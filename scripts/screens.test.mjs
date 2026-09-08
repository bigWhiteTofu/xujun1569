import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const root = new URL("../", import.meta.url);
const homeCode = await readFile(new URL("home.js", root), "utf8");
const screenCode = await readFile(new URL("screens.js", root), "utf8");
async function setup(
  t,
  { locale = "en", hash = "", width = 1024, height = 768 } = {},
) {
  const html = await readFile(
    new URL(locale === "en" ? "index.html" : "zh/index.html", root),
    "utf8",
  );
  const dom = new JSDOM(html, {
    url: `http://localhost:4173/xujun1569/${locale === "zh" ? "zh/" : ""}${hash}`,
    runScripts: "outside-only",
  });
  t.after(() => dom.window.close());
  const window = dom.window;
  window.innerWidth = width;
  window.innerHeight = height;
  window.SITE_CONFIG = { apiBase: "http://localhost:4173" };
  window.fetch = async () => ({ ok: true, json: async () => ({ ok: true }) });
  let time = 1000;
  window.performance.now = () => time;
  window.eval(homeCode);
  window.eval(screenCode);
  const $ = (selector) => window.document.querySelector(selector);
  const $$ = (selector) => [...window.document.querySelectorAll(selector)];
  return {
    window,
    $,
    $$,
    advance: (ms) => {
      time += ms;
    },
    active: () => $(".page-screen:not([hidden])"),
  };
}

for (const locale of ["en", "zh"]) {
  test(`${locale}: one screen at a time, every paper is visited before the grassland`, async (t) => {
    const { $, $$, active } = await setup(t, { locale });
    assert.equal(active().id, "home");
    const seen = [];
    while (!$("#next-page").disabled) {
      $("#next-page").click();
      assert.equal($$(".page-screen:not([hidden])").length, 1);
      if (active().id === "reading")
        seen.push(...$$(".paper:not([hidden])").map((p) => p.id));
      if (active().id === "field") assert.equal(seen.length, 12);
    }
    assert.equal(active().id, "hello");
    assert.equal(new Set(seen).size, 12);
    assert.equal($$(".atlas-direction[open]").length, 4);
    assert.equal($("#previous-page").disabled, false);
  });
}
test("large viewports show two papers while the full collection remains reachable", async (t) => {
  const { $, $$, active } = await setup(t, { width: 1440, height: 900 });
  $('#site-nav a[href="#reading"]').click();
  assert.equal(active().id, "reading");
  assert.equal($$(".paper:not([hidden])").length, 2);
  assert.match($("#publication-page").textContent, /1 \/ 6/);
});
test("filtering rebuilds paper pages and keeps only matching papers", async (t) => {
  const { $, $$, active } = await setup(t);
  $('#site-nav a[href="#reading"]').click();
  $('[data-filter="society"]').click();
  const seen = [];
  while (active().id === "reading") {
    seen.push(...$$(".paper:not([hidden])").map((p) => p.dataset.topic));
    $("#next-page").click();
  }
  assert.deepEqual(seen, ["society", "society"]);
  assert.match($("#deck-count").textContent, /06 \/ 07/);
});
test("deep links and browser back reveal the correct screen and paper", async (t) => {
  const { window, $, active } = await setup(t, { hash: "#paper-trust" });
  assert.equal(active().id, "reading");
  assert.equal($("#paper-trust").hidden, false);
  $('[data-filter="society"]').click();
  window.location.hash = "#paper-trust";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  assert.equal($("#paper-trust").hidden, false);
  assert.equal(window.location.hash, "#paper-trust");
  window.history.replaceState(null, "", "#research");
  window.dispatchEvent(new window.PopStateEvent("popstate"));
  assert.equal(active().id, "research");
});
test("wheel inertia does not skip several screens in one gesture", async (t) => {
  const { window, $, active, advance } = await setup(t);
  const wheel = () =>
    $("#main").dispatchEvent(
      new window.WheelEvent("wheel", {
        deltaY: 100,
        bubbles: true,
        cancelable: true,
      }),
    );
  wheel();
  assert.equal(active().id, "research");
  for (let i = 0; i < 15; i++) {
    advance(100);
    wheel();
  }
  assert.equal(active().id, "research");
  advance(250);
  wheel();
  assert.equal(active().id, "directions");
});
test("long content scrolls within its screen before turning the page", async (t) => {
  const { window, $, active, advance } = await setup(t, {
    hash: "#directions",
  });
  const panel = active();
  panel.style.overflowY = "auto";
  Object.defineProperty(panel, "scrollHeight", { value: 1400 });
  Object.defineProperty(panel, "clientHeight", { value: 600 });
  panel.dispatchEvent(
    new window.WheelEvent("wheel", {
      deltaY: 100,
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(active().id, "directions");
  panel.scrollTop = 800;
  panel.dispatchEvent(
    new window.WheelEvent("wheel", {
      deltaY: 100,
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(
    active().id,
    "directions",
    "the same gesture cannot escape a long panel",
  );
  advance(250);
  panel.dispatchEvent(
    new window.WheelEvent("wheel", {
      deltaY: 100,
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(active().id, "reading");
});
test("keyboard paging does not intercept text editing", async (t) => {
  const { window, $, active } = await setup(t, { hash: "#hello" });
  $("[name=message]").dispatchEvent(
    new window.KeyboardEvent("keydown", {
      key: "ArrowUp",
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(active().id, "hello");
  active().dispatchEvent(
    new window.KeyboardEvent("keydown", {
      key: "PageUp",
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(active().id, "field");
});
test("paging stylesheet parses and reduced-motion rules remain available", async (t) => {
  const css = await readFile(new URL("screens.css", root), "utf8");
  const dom = new JSDOM(`<style>${css}</style>`);
  t.after(() => dom.window.close());
  assert.ok(dom.window.document.styleSheets[0].cssRules.length > 20);
  assert.ok(css.includes("prefers-reduced-motion"));
});

test("animated navigation queues the latest destination without leaving two active pages", async (t) => {
  const { window, $, $$, active } = await setup(t);
  const finishes = [];
  window.document.startViewTransition = (update) => {
    update();
    let finish;
    const finished = new Promise((resolve) => {
      finish = resolve;
    });
    finishes.push(finish);
    return {
      finished,
      ready: Promise.reject(new Error("Snapshot cancelled by resize")),
      skipTransition: finish,
    };
  };
  $('#site-nav a[href="#research"]').click();
  assert.equal(active().id, "research");
  $('#site-nav a[href="#reading"]').click();
  $('#site-nav a[href="#hello"]').click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(active().id, "hello");
  assert.equal($$(".page-screen:not([hidden])").length, 1);
  finishes.at(-1)();
  await new Promise((resolve) => setTimeout(resolve, 0));
  $("#previous-page").click();
  assert.equal(active().id, "field");
  assert.equal(window.document.documentElement.dataset.travel, "back");
  finishes.at(-1)();
});

test("reduced motion skips page animations but retains working navigation", async (t) => {
  const { window, $, active } = await setup(t);
  window.matchMedia = () => ({ matches: true });
  window.document.startViewTransition = () => {
    throw new Error("Motion should be disabled");
  };
  $("#next-page").click();
  assert.equal(active().id, "research");
  $("#previous-page").click();
  assert.equal(active().id, "home");
});

test("the fallback animates in the direction of travel and cancels stale animations", async (t) => {
  const { $, active } = await setup(t);
  const effects = [];
  let cancelled = 0;
  $("#main").getAnimations = () => [{ cancel: () => cancelled++ }];
  $("#main").animate = (frames) => effects.push(frames);
  $("#next-page").click();
  $("#previous-page").click();
  assert.equal(active().id, "home");
  assert.equal(effects[0][0].transform, "translateY(28px)");
  assert.equal(effects[1][0].transform, "translateY(-28px)");
  assert.equal(cancelled, 2);
});
