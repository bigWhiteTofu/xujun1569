import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
for (const locale of ["en", "zh"]) {
  test(`${locale}: native scroll updates progress and current section`, async (t) => {
    const html = await readFile(
      locale === "en" ? "index.html" : "zh/index.html",
      "utf8",
    );
    const dom = new JSDOM(html, {
      runScripts: "outside-only",
      url: "https://example.com/",
    });
    t.after(() => dom.window.close());
    const w = dom.window,
      d = w.document;
    w.innerHeight = 800;
    Object.defineProperty(d.documentElement, "scrollHeight", { value: 6800 });
    d.querySelector(".masthead").getBoundingClientRect = () => ({ height: 80 });
    [...d.querySelectorAll(".page-screen")].forEach((s, i) => {
      s.getBoundingClientRect = () => ({ top: i * 1000 - w.scrollY });
    });
    w.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
    w.eval(await readFile("screens.js", "utf8"));
    const active = () => d.querySelector("#site-nav [aria-current]").hash;
    assert.equal(active(), "#top");
    assert.equal(
      d.querySelectorAll(".page-screen[hidden],.paper[hidden]").length,
      0,
    );
    assert.equal(d.querySelector(".deck-controls"), null);
    for (const [y, id] of [
      [1000, "research"],
      [2000, "research"],
      [3000, "reading"],
      [4000, "field"],
      [6000, "hello"],
    ]) {
      w.scrollY = y;
      w.dispatchEvent(new w.Event("scroll"));
      assert.equal(active(), `#${id}`);
    }
    assert.equal(
      d.querySelector("#scroll-progress").style.transform,
      "scaleX(1)",
    );
    w.scrollY = 3000;
    d.dispatchEvent(new w.Event("papers-filtered"));
    assert.equal(
      d.querySelector("#scroll-progress").style.transform,
      "scaleX(0.5)",
    );
    const wheel = new w.WheelEvent("wheel", {
      deltaY: 100,
      bubbles: true,
      cancelable: true,
    });
    d.querySelector("#main").dispatchEvent(wheel);
    assert.equal(wheel.defaultPrevented, false);
  });
}
