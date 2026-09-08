/* Native document scrolling, matching the application page's navigation behavior. */
(() => {
  const header = document.querySelector(".masthead");
  const progress = document.querySelector("#scroll-progress");
  const links = [...document.querySelectorAll("#site-nav a")];
  const sections = [...document.querySelectorAll(".page-screen")];
  let scheduled = false;
  function update() {
    scheduled = false;
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty(
      "--header-height",
      `${height}px`,
    );
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    const marker = height + 140;
    let current = "top";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker)
        current =
          section.id === "home"
            ? "top"
            : section.id === "directions"
              ? "research"
              : section.id;
    }
    if (max > 0 && scrollY >= max - 8) current = "hello";
    for (const link of links) {
      if (link.hash === `#${current}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  addEventListener("load", schedule);
  document.addEventListener("papers-filtered", schedule);
  if (typeof ResizeObserver === "function")
    new ResizeObserver(schedule).observe(document.body);
  update();
})();
