import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { JSDOM } from "jsdom";

test("application profile renders current work and opens both IHE evidence images", async (t) => {
  const root = new URL("../", import.meta.url);
  const dom = new JSDOM(await readFile(new URL("ph1/index.html", root), "utf8"), {
    url: "http://localhost:4173/xujun1569/ph1/", runScripts: "outside-only",
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.matchMedia = () => ({ matches: true });
  window.IntersectionObserver = class { observe() {} unobserve() {} };
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  window.eval(await readFile(new URL("ph1/app.js", root), "utf8"));
  const $ = (s) => window.document.querySelector(s);
  const $$ = (s) => [...window.document.querySelectorAll(s)];
  assert.equal($$(".publication-item").length, 13);
  assert.equal($$(".ongoing-card").length, 3);
  assert.match($(".ongoing-card").textContent, /返修中/);
  const evidence = $$(".ongoing-card:first-child .evidence-button");
  assert.equal(evidence.length, 2);
  assert.notEqual(evidence[0].dataset.image, evidence[1].dataset.image);
  for (const button of evidence) {
    button.click();
    assert.equal($("#dialog-stage img").getAttribute("src"), button.dataset.image);
    assert.equal($("#media-dialog").open, true);
    $("#close-media").click();
    assert.equal($("#dialog-stage").children.length, 0);
  }
  const jcal = $$(".publication-item").find((p) => p.textContent.includes("Journal of Computer Assisted Learning"));
  assert.ok(jcal.querySelector('a[href="https://doi.org/10.1002/jcal.70329"]'));
  assert.equal(jcal.querySelector("[data-pdf]"), null);
  assert.match($(".publication-item").textContent, /ESI 高被引/);
  for (const element of $$('[data-image], [data-pdf], .ongoing-card-media img')) {
    const path = element.dataset.image || element.dataset.pdf || element.getAttribute("src");
    assert.ok(path && !path.includes("undefined"));
    await access(new URL(path, new URL("ph1/", root)));
  }
  $('[data-filter="lead"]').click();
  assert.equal($$(".publication-item").length, 7);
});
