(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const menu = $(".menu-toggle");
  menu.hidden = false;
  $(".masthead").classList.add("menu-ready");
  menu.addEventListener("click", () => {
    const open = $("#site-nav").classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  $("#site-nav").addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    $("#site-nav").classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#site-nav").classList.contains("open")) {
      $("#site-nav").classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.focus();
    }
  });
  // Keep the reader's location when switching between the two public languages.
  $$(".language-switch a").forEach((link) =>
    link.addEventListener("click", () => {
      link.hash = location.hash;
    }),
  );

  const questionButtons = $$("[data-question]");
  const cards = $$(".question-card");
  $(".question-picker").hidden = false;
  $(".question-deck").classList.add("interactive");
  function selectQuestion(index) {
    questionButtons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    cards.forEach((card, i) => {
      card.hidden = i !== index;
    });
    if (window.gsap && !reducedMotion.matches) {
      gsap.fromTo(
        cards[index],
        { y: 12, opacity: 0.6 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          clearProps: "transform,opacity",
          overwrite: true,
        },
      );
    }
    window.ScrollTrigger?.refresh();
  }
  questionButtons.forEach((button, i) =>
    button.addEventListener("click", () => selectQuestion(i)),
  );
  selectQuestion(0);

  const filters = $$("[data-filter]");
  $(".filters").hidden = false;
  function filterPapers(topic) {
    filters.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === topic),
      ),
    );
    let count = 0;
    $$(".paper").forEach((paper) => {
      paper.hidden = topic !== "all" && paper.dataset.topic !== topic;
      if (!paper.hidden) count++;
    });
    $("#reading-count").textContent =
      `${count} ${$("#reading-count").dataset.suffix}`;
    window.ScrollTrigger?.refresh();
  }
  filters.forEach((button) =>
    button.addEventListener("click", () => filterPapers(button.dataset.filter)),
  );
  $$(".question-reading").forEach((link) =>
    link.addEventListener("click", () => filterPapers("all")),
  );
  // A direct paper link must remain visible even after a topic filter was used.
  addEventListener("hashchange", () => {
    if (location.hash.startsWith("#paper-")) filterPapers("all");
  });

  const form = $("#message-form");
  const status = $("#message-status");
  const apiBase = (window.SITE_CONFIG?.apiBase || "").replace(/\/$/, "");
  const field = form.elements.message;
  form.hidden = false;
  function messagePayload() {
    const message = field.value.trim();
    const contact = form.elements.contact.value.trim();
    return {
      displayName: form.elements.displayName.value.trim(),
      message: contact ? `${message}\n\nContact: ${contact}` : message,
      website: form.elements.website.value,
    };
  }
  function updateCount() {
    const length = messagePayload().message.length;
    $("#message-count").textContent = `${length} / 1000`;
    field.setCustomValidity(length > 1000 ? form.dataset.length : "");
  }
  form.addEventListener("input", updateCount);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = messagePayload();
    if (field.value.trim().length < 2 || payload.message.length > 1000) {
      status.textContent = form.dataset.length;
      field.focus();
      return;
    }
    const submit = form.querySelector("[type=submit]");
    if (submit.disabled) return;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = form.dataset.sending;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      if (!apiBase) throw new Error("API unavailable");
      const response = await fetch(`${apiBase}/api/message`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        status.textContent =
          response.status === 429 ? form.dataset.limited : form.dataset.failed;
        return;
      }
      const result = await response.json();
      if (result.ok !== true) throw new Error("Unexpected response");
      form.reset();
      updateCount();
      status.textContent = form.dataset.sent;
    } catch {
      status.textContent = form.dataset.failed;
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
  $("#copy-email").hidden = false;
  $("#copy-email").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("xujun1569@gmail.com");
      $("#copy-status").textContent = form.dataset.copied;
    } catch {
      $("#copy-status").textContent = form.dataset.copyFailed;
    }
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".landscape img",
        { scale: 1.09 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".landscape",
            start: "top bottom",
            end: "bottom 25%",
            scrub: 0.6,
          },
        },
      );
      // Each paper settles into place as it enters the reading area.
      gsap.utils.toArray(".paper").forEach((paper) => {
        gsap.from(paper, {
          y: 24,
          duration: 0.55,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: { trigger: paper, start: "top 96%", once: true },
        });
      });
    });
  }
  // Preserve the existing first-party visit endpoint without changing its data model.
  if (apiBase) {
    const eventId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    fetch(`${apiBase}/api/visit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventId,
        path: `${location.pathname}${location.search}`,
        referrer: document.referrer,
      }),
      keepalive: true,
    }).catch(() => {});
  }
})();
