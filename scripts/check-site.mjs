import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { copy, papers } from "./home-content.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFile(resolve(root, path), "utf8");
let checks = 0;
function check(value, label) {
  assert.ok(value, label);
  checks++;
}
function sameKeys(a, b, path = "") {
  check(
    JSON.stringify(Object.keys(a)) === JSON.stringify(Object.keys(b)),
    `Translation keys: ${path}`,
  );
  for (const key of Object.keys(a))
    if (a[key] && typeof a[key] === "object")
      sameKeys(a[key], b[key], `${path}.${key}`);
}
sameKeys(copy.en, copy.zh);
for (const [file, lang] of [
  ["index.html", "en"],
  ["zh/index.html", "zh-CN"],
  ["ph1/index.html", "zh-CN"],
  ["in/index.html", "zh-CN"],
]) {
  const html = await read(file);
  check(html.includes(`<html lang="${lang}">`), `${file}: language`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  check(ids.length === new Set(ids).size, `${file}: unique IDs`);
  for (const [, value] of html.matchAll(/\b(?:href|src|data-pdf)="([^"]+)"/g)) {
    if (value.startsWith("#")) {
      check(ids.includes(value.slice(1)), `${file}: anchor ${value}`);
      continue;
    }
    if (/^(?:https?:|mailto:|data:)/.test(value)) continue;
    const path = resolve(root, dirname(file), value.split(/[?#]/)[0]);
    check(
      (await stat(path)).isFile() || (await stat(path)).isDirectory(),
      `${file}: ${value}`,
    );
  }
  if (file === "index.html" || file.startsWith("zh/")) {
    check(
      !/ph1|\/in\/?["?#]|进行中的研究|课题参与与平台开发|四级|六级|GPA|硕士导师|本科导师/.test(
        html,
      ),
      `${file}: public/application separation`,
    );
    check(
      (html.match(/class="paper"/g) || []).length === 4,
      `${file}: static papers without JavaScript`,
    );
    check(html.includes('hreflang="x-default"'), `${file}: language discovery`);
    for (const paper of papers)
      check(html.includes(paper.doi), `${file}: DOI ${paper.id}`);
  }
}
const originalHtml = execFileSync("git", ["show", "17c9e23:index.html"], {
  cwd: root,
  encoding: "utf8",
});
const originalJs = execFileSync("git", ["show", "17c9e23:app.js"], {
  cwd: root,
  encoding: "utf8",
});
const phHtml = await read("ph1/index.html");
const phJs = await read("ph1/app.js");
const normalize = (s) =>
  s
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();
check(
  normalize(phJs) ===
    normalize(originalJs.replaceAll('"assets/', '"../assets/')),
  "Application data and behavior preserved",
);
const expectedHtml = originalHtml
  .replaceAll('href="favicon.svg"', 'href="../favicon.svg"')
  .replaceAll('href="styles.css', 'href="../styles.css')
  .replaceAll('src="assets/', 'src="../assets/')
  .replaceAll('data-pdf="assets/', 'data-pdf="../assets/')
  .replaceAll('href="admin.html"', 'href="../admin.html"')
  .replaceAll('src="config.js', 'src="../config.js');
check(
  normalize(phHtml.replace(/\s*<link rel="canonical"[^>]+>\s*/, "\n  ")) ===
    normalize(expectedHtml),
  "Application HTML preserved except paths and canonical URL",
);
check(
  (await read("in/index.html")).includes('location.replace("../ph1/?from=in")'),
  "/in remains an application entry",
);
check(
  !(await read("sitemap.xml")).includes("ph1"),
  "Public sitemap stays separate",
);
const originalTitles = [...originalJs.matchAll(/title: "([^"]+)"/g)].map(
  (m) => m[1],
);
for (const paper of papers)
  check(
    originalTitles.includes(paper.title),
    `Unchanged publication title: ${paper.id}`,
  );
console.log(
  `PASS: ${checks} content, bilingual parity, route, asset, and migration assertions.`,
);
