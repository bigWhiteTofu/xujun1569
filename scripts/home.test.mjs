import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { papers, topics } from "./research-content.mjs";

const root = new URL("../", import.meta.url);
const script = await readFile(new URL("home.js", root), "utf8");
async function setup(t, locale = "en", response = { ok: true, status: 201 }) {
  const html = await readFile(
    new URL(locale === "en" ? "index.html" : "zh/index.html", root),
    "utf8",
  );
  const dom = new JSDOM(html, {
    url: `http://localhost:4173/xujun1569/${locale === "zh" ? "zh/" : ""}`,
    runScripts: "outside-only",
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.matchMedia = () => ({ matches: true });
  window.SITE_CONFIG = { apiBase: "http://localhost:4173" };
  const requests = [];
  window.fetch = async (url, options) => {
    requests.push({ url, options });
    if (response.throw && url.endsWith("/api/message"))
      throw new Error("offline");
    return { ...response, json: async () => ({ ok: true }) };
  };
  window.eval(script);
  return {
    window,
    requests,
    $: (selector) => window.document.querySelector(selector),
    $$: (selector) => [...window.document.querySelectorAll(selector)],
  };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("every topic filter preserves publication counts and descending year order", async (t) => {
  const { $, $$ } = await setup(t);
  for (const topic of topics) {
    $(`[data-filter="${topic}"]`).click();
    const visible = $$(".paper:not([hidden])");
    assert.equal(
      visible.length,
      papers.filter((p) => p.topic === topic).length,
    );
    assert.ok(
      visible.every(
        (p, i) =>
          !i || Number(visible[i - 1].dataset.year) >= Number(p.dataset.year),
      ),
    );
    assert.equal($$('[data-filter][aria-pressed="true"]').length, 1);
  }
  $('[data-filter="all"]').click();
  assert.equal($$(".paper:not([hidden])").length, 12);
});
test("a direct paper anchor reveals a previously filtered-out publication", async (t) => {
  const { window, $, $$ } = await setup(t);
  $('[data-filter="learning"]').click();
  assert.equal($("#paper-trust").hidden, true);
  window.location.hash = "#paper-trust";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  assert.equal($("#paper-trust").hidden, false);
  assert.equal($$(".paper:not([hidden])").length, 12);
});
for (const locale of ["en", "zh"]) {
  test(`${locale}: portrait, independent atlas, complete papers, and grassland appear in order`, async (t) => {
    const { window, $, $$ } = await setup(t, locale);
    assert.ok($(".hero img").src.endsWith("jun-chalkboard.jpg"));
    assert.ok($("#research img").src.endsWith("research-wordcloud.png"));
    assert.equal($$('#research a[href^="#paper-"]').length, 0);
    assert.equal($$("#directions .atlas-direction[open]").length, 4);
    assert.ok($(".field-note img").src.endsWith("jun-grassland.jpg"));
    assert.ok(
      $("#reading").compareDocumentPosition($(".field-note")) &
        window.Node.DOCUMENT_POSITION_FOLLOWING,
    );
    assert.equal($$(".paper").length, 12);
    assert.equal($$(".paper-original").length, 2);
    assert.ok($$(".paper h3").every((h) => h.getAttribute("lang")));
  });
}
test("CSS parses as a stylesheet after the layout refactor", async (t) => {
  const css = await readFile(new URL("home.css", root), "utf8");
  const dom = new JSDOM(`<style>${css}</style>`);
  t.after(() => dom.window.close());
  assert.ok(dom.window.document.styleSheets[0].cssRules.length > 100);
});
test("language switch preserves a shareable section anchor", async (t) => {
  const { window, $ } = await setup(t);
  window.location.hash = "#reading";
  const language = $('.language-switch [lang="zh-CN"]');
  language.addEventListener("click", (event) => event.preventDefault());
  language.click();
  assert.equal(language.href, "http://localhost:4173/xujun1569/zh/#reading");
});
test("mobile menu Escape closes navigation and returns focus", async (t) => {
  const { window, $ } = await setup(t);
  $(".menu-toggle").click();
  assert.equal($(".menu-toggle").getAttribute("aria-expanded"), "true");
  window.document.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "Escape" }),
  );
  assert.equal($(".menu-toggle").getAttribute("aria-expanded"), "false");
  assert.equal(window.document.activeElement, $(".menu-toggle"));
});
for (const locale of ["en", "zh"]) {
  test(`${locale}: successful note retains complete contact and resets the form`, async (t) => {
    const { window, requests, $ } = await setup(t, locale);
    $("[name=message]").value = "A question about self-regulated learning.";
    $("[name=contact]").value = "reader@example.test";
    $("#message-form").dispatchEvent(
      new window.Event("submit", { cancelable: true }),
    );
    await settle();
    const sent = requests.find((r) => r.url.endsWith("/api/message"));
    assert.ok(
      JSON.parse(sent.options.body).message.endsWith(
        "Contact: reader@example.test",
      ),
    );
    assert.equal($("[name=message]").value, "");
    assert.equal(
      $("#message-status").textContent,
      $("#message-form").dataset.sent,
    );
    assert.equal($("#message-count").textContent, "0 / 1000");
  });
  test(`${locale}: failure preserves draft and localizes the feedback`, async (t) => {
    const { window, $ } = await setup(t, locale, { throw: true });
    $("[name=message]").value = "Keep this draft.";
    $("#message-form").dispatchEvent(
      new window.Event("submit", { cancelable: true }),
    );
    await settle();
    assert.equal($("[name=message]").value, "Keep this draft.");
    assert.equal(
      $("#message-status").textContent,
      $("#message-form").dataset.failed,
    );
    assert.equal($("[type=submit]").disabled, false);
  });
}
test("combined note/contact limit rejects overflow without silently truncating", async (t) => {
  const { window, requests, $ } = await setup(t);
  $("[name=message]").value = "x".repeat(990);
  $("[name=contact]").value = "reader@example.test";
  $("#message-form").dispatchEvent(
    new window.Event("input", { bubbles: true }),
  );
  assert.equal($("[name=message]").validity.customError, true);
  $("#message-form").dispatchEvent(
    new window.Event("submit", { cancelable: true }),
  );
  await settle();
  assert.equal(
    requests.filter((r) => r.url.endsWith("/api/message")).length,
    0,
  );
  assert.equal($("[name=message]").value.length, 990);
});
test("rate limiting has a distinct localized message", async (t) => {
  const { window, $ } = await setup(t, "en", { ok: false, status: 429 });
  $("[name=message]").value = "A question.";
  $("#message-form").dispatchEvent(
    new window.Event("submit", { cancelable: true }),
  );
  await settle();
  assert.equal(
    $("#message-status").textContent,
    $("#message-form").dataset.limited,
  );
});
