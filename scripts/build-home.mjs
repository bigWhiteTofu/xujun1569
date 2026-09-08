import { mkdir, writeFile } from "node:fs/promises";
import { copy } from "./home-content.mjs";
import { atlas, papers, topics } from "./research-content.mjs";

const root = new URL("../", import.meta.url);
const origin = "https://bigwhitetofu.github.io/xujun1569/";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const arrow = '<span aria-hidden="true">↗</span>';

export function renderHome(locale) {
  const t = copy[locale];
  const a = atlas[locale];
  const base = locale === "en" ? "./" : "../";
  const url = origin + (locale === "en" ? "" : "zh/");
  const structured = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    inLanguage: t.lang,
    mainEntity: {
      "@type": "Person",
      name: "Jun Xu",
      alternateName: "徐俊",
      url: origin,
      sameAs: ["https://orcid.org/0000-0002-0557-2046"],
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: "East China Normal University",
      },
    },
  };
  return `<!doctype html>
<html lang="${t.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(t.title)}</title>
  <meta name="description" content="${escape(t.description)}">
  <meta name="theme-color" content="#f4f1e9">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${origin}">
  <link rel="alternate" hreflang="zh-CN" href="${origin}zh/">
  <link rel="alternate" hreflang="x-default" href="${origin}">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escape(t.title)}">
  <meta property="og:description" content="${escape(t.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${origin}assets/jun-chalkboard.jpg">
  <meta property="og:image:alt" content="${escape(a.portraitAlt)}">
  <meta property="og:locale" content="${locale === "en" ? "en_US" : "zh_CN"}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${base}home-favicon.svg" type="image/svg+xml">
  <link rel="preload" href="${base}assets/fonts/cabinet-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${base}home.css?v=20260908-2">
  <script type="application/ld+json">${JSON.stringify(structured)}</script>
</head>
<body id="top">
  <a class="skip-link" href="#main">${t.skip}</a>
  <header class="masthead shell">
    <a class="wordmark" href="${base}${locale === "zh" ? "zh/" : ""}" aria-label="${t.name}"><svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 3v34M3 20h34M8 8l24 24M8 32 32 8" stroke="currentColor" stroke-width="3"/></svg><span>${t.name}<small>${locale === "en" ? "徐俊" : "JUN XU"}</small></span></a>
    <nav id="site-nav" class="site-nav" aria-label="${locale === "en" ? "Main navigation" : "主要导航"}">${["top", "research", "reading", "hello"].map((id, i) => `<a href="#${id}">${t.nav[i]}</a>`).join("")}</nav>
    <div class="nav-tools"><div class="language-switch" aria-label="Language / 语言"><a href="${base}" lang="en" hreflang="en" ${locale === "en" ? 'aria-current="page"' : ""}>EN</a><span aria-hidden="true">/</span><a href="${base}zh/" lang="zh-CN" hreflang="zh-CN" ${locale === "zh" ? 'aria-current="page"' : ""}>中文</a></div><button class="menu-toggle" hidden type="button" aria-expanded="false" aria-controls="site-nav">${t.menu}</button></div>
  </header>
  <main id="main">
    <section class="hero shell" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="eyebrow">${t.intro}</p>
      <h1 id="hero-title">${t.hero[0]}<br><em>${t.hero[1]}</em></h1>
      <p class="hero-lead">${t.lead}</p>
      <div class="hero-actions"><a class="button dark" href="#research">${t.explore}<span aria-hidden="true">↓</span></a><a class="text-link" href="#hello">${t.hello}${arrow}</a></div></div>
      <figure class="chalk-portrait"><div class="chalk-frame"><img src="${base}assets/jun-chalkboard.jpg" width="1706" height="1279" fetchpriority="high" alt="${a.portraitAlt}"></div><figcaption>${a.portraitNote}</figcaption></figure>
    </section>
    <section class="about shell" aria-labelledby="about-title"><div><p class="eyebrow">${locale === "en" ? "A NOTE FROM JUN" : "写在这里"}</p><h2 id="about-title">${t.about}</h2></div><div class="about-copy"><p>${t.bio}</p><p>${t.bioEnd}</p><a class="text-link" href="https://orcid.org/0000-0002-0557-2046" target="_blank" rel="noopener noreferrer">${t.orcid}${arrow}</a></div></section>
    <div class="word-ribbon" aria-hidden="true"><div>${[0, 1].map(() => `<span>${t.interests.map((word) => `${word}<i>✳</i>`).join("")}</span>`).join("")}</div></div>
    <section id="research" class="research-atlas shell" aria-labelledby="research-title">
      <div class="section-heading"><div><p class="eyebrow">${a.label}</p><h2 id="research-title">${a.title}</h2></div><p>${a.intro}</p></div>
      <figure class="atlas-art"><a href="${base}assets/research-wordcloud.png" target="_blank" rel="noopener noreferrer" aria-label="${locale === "en" ? "Open the full research portrait" : "查看完整研究肖像"}"><img src="${base}assets/research-wordcloud.png" width="1536" height="1024" loading="lazy" alt="${locale === "en" ? "A typographic portrait of Jun, built from research terms including educational AI, self-regulated learning, learning analytics, human–AI collaboration, and knowledge sharing." : "由徐俊肖像与英文研究词汇组成的词云图，包含教育人工智能、自我调节学习、学习分析、人机协作与知识共享等主题。"}"></a><figcaption><span>${a.hint}</span><a href="${base}assets/research-wordcloud.png" target="_blank" rel="noopener noreferrer">${locale === "en" ? "View full size" : "查看大图"} ${arrow}</a></figcaption></figure>
      <div class="atlas-directions">${a.directions.map((d, i) => `<details class="atlas-direction" ${i === 0 ? "open" : ""}><summary><span class="direction-dot dot-${i}" aria-hidden="true"></span>${d.name}<span class="expand-mark" aria-hidden="true">+</span></summary><div class="direction-copy"><h3>${d.detail}</h3><p>${d.text}</p><ul>${d.keywords.map((word) => `<li>${word}</li>`).join("")}</ul></div></details>`).join("")}</div>
      <div class="atlas-methods"><span>${a.methodsLabel}</span><p>${a.methods.join('<span aria-hidden="true"> / </span>')}</p></div>
    </section>
    <section id="reading" class="reading shell" aria-labelledby="reading-title"><div class="section-heading"><h2 id="reading-title">${t.readingTitle}</h2><p>${t.readingIntro}</p></div>
      <div class="reading-tools"><div class="filters" hidden role="group" aria-label="${locale === "en" ? "Filter papers by topic" : "按话题筛选论文"}">${["all", ...topics].map((filter, i) => `<button type="button" data-filter="${filter}" aria-pressed="${i === 0}">${t.filters[i]}</button>`).join("")}</div><span id="reading-count" role="status" data-suffix="${t.results}">${papers.length} ${t.results}</span></div>
      <p class="sort-note">${a.sort}</p>
      <div class="paper-list">${papers
        .map((p, i) => {
          const translated = Boolean(p.titleEn);
          const mainTitle = locale === "en" && translated ? p.titleEn : p.title;
          const mainLang = translated && locale === "zh" ? "zh-CN" : "en";
          const secondary = translated
            ? `<p class="paper-original"><span>${locale === "en" ? a.originalTitle : a.translation}</span><span lang="${locale === "en" ? "zh-CN" : "en"}">${escape(locale === "en" ? p.title : p.titleEn)}</span></p>`
            : "";
          return `<article class="paper" id="paper-${p.id}" data-topic="${p.topic}" data-year="${p.year}"><div class="paper-index" aria-hidden="true">${String(i + 1).padStart(2, "0")}</div><div class="paper-content"><p class="paper-meta"><span lang="${translated ? "zh-CN" : "en"}">${escape(p.journal)}</span><span>${p.year}</span><span class="paper-topic">${t.filters[topics.indexOf(p.topic) + 1]}</span></p><h3 lang="${mainLang}"><a href="${p.doi}" target="_blank" rel="noopener noreferrer">${escape(mainTitle)}</a></h3>${secondary}<p class="paper-note">${escape(p[locale])}</p><div class="paper-links"><a href="${p.doi}" target="_blank" rel="noopener noreferrer">DOI ${arrow}</a><a href="${base}assets/publications/${p.pdf}" target="_blank" rel="noopener noreferrer">${a.pdf} ${arrow}</a></div></div><a class="paper-arrow" href="${p.doi}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t.paperLink + ": " + p.title)}">${arrow}</a></article>`;
        })
        .join("")}</div>
      <a class="text-link all-papers" href="https://orcid.org/0000-0002-0557-2046" target="_blank" rel="noopener noreferrer">${t.fullRecord}${arrow}</a>
    </section>
    <section class="field-note shell" aria-labelledby="field-title"><div class="field-copy"><p class="eyebrow">${locale === "en" ? "BEYOND THE SCREEN" : "屏幕之外"}</p><h2 id="field-title">${a.fieldTitle}</h2><p>${a.fieldText}</p></div><figure class="landscape"><div class="landscape-frame"><img src="${base}assets/jun-grassland.jpg" width="1706" height="1279" loading="lazy" alt="${t.photoAlt}"></div><figcaption>${t.photoSide}</figcaption></figure></section>
    <section id="hello" class="contact" aria-labelledby="hello-title"><div class="shell contact-grid"><div class="contact-copy"><p class="eyebrow">${locale === "en" ? "KEEP THE CONVERSATION GOING" : "让对话继续"}</p><h2 id="hello-title">${t.contactTitle}</h2><p>${t.contactIntro}</p><a class="email-address" href="mailto:xujun1569@gmail.com">xujun1569@gmail.com ${arrow}</a><div class="contact-links"><button id="copy-email" type="button" hidden>${t.copy}</button><a href="https://orcid.org/0000-0002-0557-2046" target="_blank" rel="noopener noreferrer">ORCID ${arrow}</a></div><p id="copy-status" class="status" role="status"></p></div>
      <form id="message-form" class="note-form" hidden data-sending="${t.sending}" data-sent="${t.sent}" data-failed="${t.failed}" data-limited="${t.limited}" data-length="${t.length}" data-copied="${t.copied}" data-copy-failed="${t.copyFailed}"><h3>${t.formTitle}</h3><div class="form-pair"><label>${t.nameLabel}<small>${t.optional}</small><input name="displayName" maxlength="80" autocomplete="name"></label><label>${t.contactLabel}<small>${t.optional}</small><input name="contact" maxlength="100" placeholder="${t.contactPlaceholder}"></label></div><label>${t.messageLabel}<textarea name="message" rows="4" maxlength="1000" minlength="2" required placeholder="${t.placeholder}"></textarea></label><input class="honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="form-bottom"><span id="message-count" aria-label="${t.countLabel}">0 / 1000</span><button class="button light" type="submit">${t.submit}${arrow}</button></div><p id="message-status" class="status" role="status"></p><p class="privacy">${t.privacy}</p></form>
      <noscript><p>${t.noscript}</p></noscript></div></section>
  </main>
  <footer class="footer shell"><a class="footer-signature" href="#top">${t.name}<span aria-hidden="true">✳</span></a><p>${t.footer}</p><a href="#top">${t.top}<span aria-hidden="true">↑</span></a></footer>
  <script src="${base}config.js?v=20260824-3" defer></script>
  <script src="${base}assets/vendor/gsap.min.js" defer></script>
  <script src="${base}assets/vendor/ScrollTrigger.min.js" defer></script>
  <script src="${base}home.js?v=20260908-2" defer></script>
</body>
</html>
`;
}

await mkdir(new URL("zh/", root), { recursive: true });
await writeFile(new URL("index.html", root), renderHome("en"));
await writeFile(new URL("zh/index.html", root), renderHome("zh"));
await writeFile(
  new URL("sitemap.xml", root),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", "zh/"].map((path) => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>\n`,
);
console.log("Built English homepage, Chinese homepage, and sitemap.");
