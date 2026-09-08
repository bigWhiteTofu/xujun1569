(() => {
  "use strict";
  const main = document.querySelector("#main");
  const screens = [...main.querySelectorAll(".page-screen")];
  const papers = [...document.querySelectorAll(".paper")];
  const reading = document.querySelector("#reading");
  const previous = document.querySelector("#previous-page");
  const next = document.querySelector("#next-page");
  const header = document.querySelector(".masthead");
  let steps = [];
  let current = 0;
  let wheelSum = 0;
  let lastWheel = 0;
  let gestureConsumed = false;
  let lockedUntil = 0;
  let transition = null;
  let queuedPage = null;
  let initialized = false;
  const pageSize = () => (innerWidth >= 1100 && innerHeight >= 850 ? 2 : 1);
  let lastPageSize = pageSize();

  function buildSteps() {
    const selected = papers.filter((p) => p.dataset.filtered !== "true");
    const groups = [];
    for (let i = 0; i < selected.length; i += pageSize())
      groups.push(selected.slice(i, i + pageSize()));
    if (!groups.length) groups.push([]);
    steps = screens.flatMap((screen) =>
      screen === reading
        ? groups.map((items, index) => ({
            screen,
            items,
            page: index + 1,
            pages: groups.length,
          }))
        : [{ screen }],
    );
  }

  function show(index, options = {}) {
    const destination = Math.max(0, Math.min(steps.length - 1, index));
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (transition) {
      queuedPage = [destination, options];
      transition.skipTransition();
      return;
    }
    const animate = initialized && destination !== current && !reducedMotion;
    document.documentElement.dataset.travel =
      destination < current ? "back" : "forward";
    initialized = true;
    if (animate && typeof document.startViewTransition === "function") {
      transition = document.startViewTransition(() =>
        render(destination, options),
      );
      // Resizing or a newer navigation may cancel the visual snapshot.
      // The DOM update still completes; a skipped animation is not a page error.
      transition.ready?.catch(() => {});
      transition.finished
        .catch(() => {})
        .finally(() => {
          transition = null;
          if (queuedPage) {
            const pending = queuedPage;
            queuedPage = null;
            show(...pending);
          }
        });
    } else {
      render(destination, options);
      if (animate && typeof main.animate === "function") {
        main.getAnimations().forEach((animation) => animation.cancel());
        const offset =
          document.documentElement.dataset.travel === "back" ? -28 : 28;
        main.animate(
          [
            { opacity: 0, transform: `translateY(${offset}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 480, easing: "cubic-bezier(.22,1,.36,1)" },
        );
      }
    }
  }

  function render(index, { focus = false, updateHash = true } = {}) {
    current = Math.max(0, Math.min(steps.length - 1, index));
    const step = steps[current];
    screens.forEach((screen) => {
      screen.hidden = screen !== step.screen;
    });
    papers.forEach((paper) => {
      paper.hidden =
        step.screen === reading
          ? !step.items.includes(paper)
          : paper.dataset.filtered === "true";
    });
    step.screen.scrollTop = 0;
    const label = step.screen.dataset.label;
    document.querySelector("#deck-count").textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")} · ${label}`;
    document.querySelector("#publication-page").textContent = step.page
      ? `${step.page} / ${step.pages}`
      : "";
    previous.disabled = current === 0;
    next.disabled = current === steps.length - 1;
    const navTarget =
      step.screen.id === "home"
        ? "top"
        : step.screen.id === "directions"
          ? "research"
          : step.screen.id;
    document.querySelectorAll("#site-nav a").forEach((link) => {
      if (link.hash === `#${navTarget}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (updateHash) {
      const hash = step.page
        ? `#${step.items[0]?.id || "reading"}`
        : `#${step.screen.id === "home" ? "top" : step.screen.id}`;
      history.replaceState(
        null,
        "",
        `${location.pathname}${location.search}${hash}`,
      );
    }
    if (focus) step.screen.focus({ preventScroll: true });
    wheelSum = 0;
  }

  function move(direction, focus = false) {
    show(current + direction, { focus });
    lockedUntil = performance.now() + 650;
  }
  previous.addEventListener("click", () => move(-1, true));
  next.addEventListener("click", () => move(1, true));

  function followHash(focus = false) {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id || "home");
    if (id === "top" || id === "main" || !id) {
      show(0, { focus, updateHash: false });
      return;
    }
    if (!target) return;
    if (target.classList.contains("paper")) {
      if (target.dataset.filtered === "true") {
        document.querySelector('[data-filter="all"]').click();
        history.replaceState(null, "", `#${id}`);
      }
      const index = steps.findIndex((step) => step.items?.includes(target));
      if (index >= 0) show(index, { focus, updateHash: false });
      return;
    }
    const panel = target.closest(".page-screen");
    const index = steps.findIndex((step) => step.screen === panel);
    if (index >= 0) show(index, { focus, updateHash: false });
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.button
    )
      return;
    event.preventDefault();
    history.pushState(null, "", link.hash);
    followHash(true);
  });
  addEventListener("hashchange", () => followHash());
  addEventListener("popstate", () => followHash());
  document.addEventListener("papers-filtered", () => {
    buildSteps();
    show(steps.findIndex((step) => step.screen === reading));
  });

  // Preserve scrolling inside long panels, text areas, and other scrollable controls.
  function canScroll(target, direction) {
    for (
      let element = target;
      element && element !== main;
      element = element.parentElement
    ) {
      const overflow = getComputedStyle(element).overflowY;
      if (!/(auto|scroll)/.test(overflow)) continue;
      if (
        direction > 0 &&
        element.scrollTop + element.clientHeight < element.scrollHeight - 2
      )
        return true;
      if (direction < 0 && element.scrollTop > 2) return true;
    }
    return false;
  }
  main.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
        return;
      const direction = Math.sign(event.deltaY);
      if (
        !direction ||
        event.target.closest("input,textarea,select,[contenteditable]")
      )
        return;
      const now = performance.now();
      // A fresh gesture (or a pause) is required after an inertial wheel burst.
      if (now - lastWheel > 180) {
        gestureConsumed = false;
        wheelSum = 0;
      }
      lastWheel = now;
      if (canScroll(event.target, direction)) {
        gestureConsumed = true;
        return;
      }
      event.preventDefault();
      if (now < lockedUntil || gestureConsumed) return;
      if (Math.sign(wheelSum) !== direction) wheelSum = 0;
      wheelSum +=
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(wheelSum) >= 65) {
        gestureConsumed = true;
        move(direction);
      }
    },
    { passive: false },
  );

  let touchStart;
  main.addEventListener(
    "touchstart",
    (event) => {
      touchStart =
        event.touches.length === 1
          ? {
              x: event.touches[0].clientX,
              y: event.touches[0].clientY,
              target: event.target,
              canDown: canScroll(event.target, 1),
              canUp: canScroll(event.target, -1),
            }
          : null;
    },
    { passive: true },
  );
  main.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart || !event.changedTouches.length) return;
      const start = touchStart;
      touchStart = null;
      const dx = start.x - event.changedTouches[0].clientX;
      const dy = start.y - event.changedTouches[0].clientY;
      if (
        Math.abs(dy) < 65 ||
        Math.abs(dx) > Math.abs(dy) ||
        start.target.closest("input,textarea,select,[contenteditable]")
      )
        return;
      if (
        !(dy > 0 ? start.canDown : start.canUp) &&
        !canScroll(start.target, Math.sign(dy)) &&
        performance.now() >= lockedUntil
      )
        move(Math.sign(dy));
    },
    { passive: true },
  );

  document.addEventListener("keydown", (event) => {
    if (
      event.repeat ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.target.closest(
        "input,textarea,select,button,a,summary,[contenteditable]",
      )
    )
      return;
    const direction = ["PageDown", "ArrowDown", " "].includes(event.key)
      ? 1
      : ["PageUp", "ArrowUp"].includes(event.key)
        ? -1
        : 0;
    if (!direction) return;
    event.preventDefault();
    const travel = event.shiftKey && event.key === " " ? -1 : direction;
    const panel = steps[current].screen;
    if (canScroll(panel, travel)) {
      const distance = event.key.startsWith("Arrow")
        ? 48
        : panel.clientHeight * 0.8;
      panel.scrollTop += travel * distance;
      return;
    }
    move(travel, true);
  });

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measureHeader();
      if (lastPageSize === pageSize()) return;
      lastPageSize = pageSize();
      const active = steps[current];
      const firstPaper = active.items?.[0];
      buildSteps();
      show(
        Math.max(
          0,
          steps.findIndex((step) =>
            firstPaper
              ? step.items?.includes(firstPaper)
              : step.screen === active.screen,
          ),
        ),
        { updateHash: false },
      );
    }, 120);
  });
  function measureHeader() {
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.getBoundingClientRect().height}px`,
    );
  }
  if (typeof ResizeObserver === "function")
    new ResizeObserver(measureHeader).observe(header);
  document.querySelector(".deck-controls").hidden = false;
  document.documentElement.classList.add("paged");
  measureHeader();
  buildSteps();
  show(0, { updateHash: false });
  followHash();
})();
