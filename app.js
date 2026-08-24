const publications = [
  {
    role: "第一作者", filters: ["lead", "edu-ai", "methods"], journal: "British Journal of Educational Technology", year: "2026",
    pdf: "assets/publications/bjet-ai-srl-meta-analysis.pdf", doi: "https://doi.org/10.1111/bjet.70058",
    title: "AI support in self-regulated learning: A decade of technological evolution and meta-analysis",
    tags: ["中科院 1 区 · TOP", "SSCI Q1", "IF 13.0"],
    summary: "整合 35 项研究与 133 个效应量，检验人工智能支持自我调节学习的总体作用、阶段差异与边界条件。"
  },
  {
    role: "唯一通讯作者", filters: ["lead", "methods"], journal: "Information Processing & Management", year: "2027",
    pdf: "assets/publications/ipm-official-or-influencer.pdf", doi: "https://doi.org/10.1016/j.ipm.2026.105068",
    title: "Official or Influencer? An AI-Enhanced Analytical Framework for Decoding Multimodal Persuasion in Government Marketing Videos",
    tags: ["中科院 1 区 · TOP", "SCI/SSCI Q1", "IF 8.1"],
    summary: "结合人工编码与多模态大模型分析 779 条政府营销视频，识别来源类型、内容价值与互动反应之间的关系。"
  },
  {
    role: "第一作者", filters: ["lead", "edu-ai", "methods"], journal: "Aslib Journal of Information Management", year: "2026",
    pdf: "assets/publications/aslib-danmaku-engagement.pdf", doi: "https://doi.org/10.1108/AJIM-01-2026-0111",
    title: "Trust the messenger, then the message: Unpacking the cross-route logic of danmaku engagement",
    tags: ["SSCI Q1", "IF 3.5"],
    summary: "基于 B 站知识视频与 13 万余条弹幕，结合 PLS-SEM、组间比较和 BERTopic 分析来源线索、信任与知识采纳。"
  },
  {
    role: "合作作者", filters: ["edu-ai", "methods"], journal: "Behaviour & Information Technology", year: "2026",
    pdf: "assets/publications/bit-ai-literacy-review.pdf", doi: "https://doi.org/10.1080/0144929X.2026.2711024",
    title: "Mapping the evolving landscape of AI literacy research: An integrative review combining bibliometric analysis and thematic synthesis",
    tags: ["SSCI Q1", "IF 4.2"],
    summary: "融合文献计量与主题综合，梳理 AI 素养研究的知识结构、概念演进与未来议题。"
  },
  {
    role: "唯一通讯作者", filters: ["lead", "edu-ai"], journal: "Journal of Information Science", year: "2024",
    pdf: "assets/publications/jis-mobile-social-media.pdf", doi: "https://doi.org/10.1177/01655515241293754",
    title: "The impact of mobile social media on knowledge sharing among vocational school teachers: A social cognitive career perspective",
    tags: ["SSCI Q2"],
    summary: "从社会认知职业理论视角解释移动社交媒体情境下职业院校教师知识共享的心理与技术驱动机制。"
  },
  {
    role: "第一作者", filters: ["lead", "methods"], journal: "Business Process Management Journal", year: "2025",
    pdf: "assets/publications/bpmj-supply-chain-resilience.pdf", doi: "https://doi.org/10.1108/BPMJ-04-2025-0550",
    title: "Stage-specific impacts of digital technologies on supply chain resilience: Meta-analytic evidence for continuous process improvement",
    tags: ["SSCI Q1"],
    summary: "汇总 70 项研究与 218 个效应量，比较数字技术在供应链韧性不同阶段的差异化作用。"
  },
  {
    role: "唯一通讯作者", filters: ["lead", "edu-ai"], journal: "Journal of Professional Capital and Community", year: "2026",
    pdf: "assets/publications/jpcc-blended-teacher-workshops.pdf", doi: "https://doi.org/10.1108/JPCC-12-2025-0145",
    title: "From access to adherence: Fostering professional capital and continued engagement in blended teacher workshops",
    tags: ["SSCI Q2"],
    summary: "融合技术接受、期望确认与社会支持视角，解释教师混合式研修从初次使用到持续参与的行为机制。"
  },
  {
    role: "合作作者", filters: ["edu-ai"], journal: "开放教育研究", year: "2025",
    pdf: "assets/publications/oer-llm-thinking-model.pdf", doi: "https://doi.org/10.13966/j.cnki.kfjyyj.2025.06.004",
    title: "大模型运思模式的可解释性：基于完形论与言行论整合的心设模型",
    tags: ["CSSCI"],
    summary: "从完形论与言行论整合视角讨论大模型运思模式的可解释性，并提出相应心设模型。"
  },
  {
    role: "合作作者", filters: ["edu-ai"], journal: "现代远程教育研究", year: "2026",
    pdf: "assets/publications/mder-proactive-educational-agent.pdf", doi: "https://doi.org/10.3969/j.issn.1009-5195.2026.04.009",
    title: "主动式教育智能体的构建与应用",
    tags: ["CSSCI", "导师一作"],
    summary: "讨论主动式教育智能体的技术框架、关键能力与教育应用路径。"
  },
  {
    role: "合作作者", filters: ["methods"], journal: "Humanities and Social Sciences Communications", year: "2026",
    pdf: "assets/publications/hssc-smart-city.pdf", doi: "https://doi.org/10.1057/s41599-026-06673-7",
    title: "Smart city strategy, China’s urban innovation and policy effectiveness",
    tags: ["SSCI Q1"],
    summary: "基于中国城市面板数据与多期 DID、机制及空间检验，评估智慧城市政策的创新效应。"
  },
  {
    role: "唯一通讯作者", filters: ["lead", "edu-ai"], journal: "International Journal of Mentoring and Coaching in Education", year: "2025",
    pdf: "assets/publications/ijmce-mentoring.pdf", doi: "https://doi.org/10.1108/IJMCE-07-2023-0064",
    title: "The role of teachers’ direct and emotional mentoring in shaping undergraduates’ research aspirations: A social cognitive career theory perspective",
    tags: ["ESCI Q2"],
    summary: "考察教师直接指导与情感支持如何共同影响本科生的科研志向及其形成路径。"
  },
  {
    role: "合作作者", filters: ["edu-ai", "methods"], journal: "SAGE Open", year: "2024",
    pdf: "assets/publications/sage-educational-leadership.pdf", doi: "https://doi.org/10.1177/21582440241285763",
    title: "Evolution and current research status of educational leadership theory: A content analysis-based study",
    tags: ["SSCI Q1"],
    summary: "以内容分析呈现教育领导理论的发展脉络、研究主题及演进趋势。"
  }
];

const ongoingStudies = [
  {
    journal: "The Internet and Higher Education", role: "第一作者", status: "同行评审中",
    title: "Frictionless tools, regulated minds: Designing GenAI diagnostic scaffolding for self-regulated learning in higher education",
    image: "assets/ongoing/ihe.png", note: "围绕生成式 AI 诊断性支架与自我调节学习开展平台实验。"
  },
  {
    journal: "Information Processing & Management", role: "第一作者", status: "同行评审中",
    title: "Seeing experience through multimodal traces: How practice auditability calibrates information processing and trust in the GenAI era",
    image: "assets/ongoing/ipm.png", note: "结合多模态编码、行为数据与随机实验检验可见实践证据对信任校准的作用。"
  },
  {
    journal: "Computers & Education", role: "合作作者", status: "同行评审中",
    title: "Can Multiple Debating Agents Outperform a Single Socratic Agent? Effects on Secondary School Students’ Critical Thinking",
    image: "assets/ongoing/compedu.png", note: "比较多智能体辩论与单一苏格拉底式智能体对中学生批判性思维的影响。"
  },
  {
    journal: "Business Ethics, the Environment & Responsibility", role: "通讯作者", status: "同行评审中",
    title: "Beyond symbolic compliance: A meta-analysis of corporate AI tasks and non-interchangeable sustainability outcomes",
    image: "assets/ongoing/beer.png", note: "通过元分析区分企业 AI 任务与不同可持续发展结果之间的作用差异。"
  },
  {
    journal: "Engineering, Construction and Architectural Management", role: "通讯作者", status: "同行评审中",
    title: "Beyond the Project Blueprint: How Regional Configurations Align Digital Development with Innovation Network Resilience for Infrastructure-Intensive Development",
    image: "assets/ongoing/ecam.png", note: "以区域组态视角解释数字发展与创新网络韧性的匹配机制。"
  },
  {
    journal: "Journal of Business Research", role: "通讯作者", status: "同行评审中",
    title: "When posts outpace patents: Multimodal corporate AI washing and stakeholder verification frictions on digital platforms",
    image: "assets/ongoing/jbr.png", note: "研究数字平台中的企业 AI 表述、利益相关者核验摩擦与创新真实性。"
  }
];

const projects = [
  {
    year: "2024", status: "已立项", title: "国家智能社会治理实验特色基地（教育）主任基金项目",
    description: "参与项目架构设计与申报，负责标准草案撰写。", image: "assets/projects/governance-fund.jpg", position: "center"
  },
  {
    year: "2025", status: "已验收", title: "上海市标准化创新中心（数字教育）标准化试点",
    description: "参与中期检查、验收材料整理及专家座谈会。", image: "assets/projects/standard-pilot.jpg", position: "center"
  },
  {
    year: "2026", status: "结题阶段", title: "国家社会科学基金重大项目",
    description: "参与结题研究，承担专题文献与案例梳理，负责子课题二结题材料。", image: "assets/projects/nssfc-major.jpg", position: "center"
  },
  {
    year: "2026", status: "已申报", title: "国家自然科学基金面上项目",
    description: "负责实验方案设计、平台开发技术路线论证及相关申报书撰写。", image: "assets/projects/nsfc-public.jpg", position: "top"
  },
  {
    year: "2026", status: "独立开发与实验", title: "教育智能体实验平台",
    description: "实现实验分组、大模型交互、过程支架与行为日志采集，支持教育智能体干预研究。", image: "assets/platform/multi-agent-workspace.png", position: "center"
  },
  {
    year: "2026", status: "网站开发", title: "课题组成果展示平台",
    description: "完成团队成果展示网站的界面设计、内容组织与前端实现。", image: "assets/platform/lab-platform.png", position: "center"
  }
];

const publicationList = document.querySelector("#publication-list");
const ongoingList = document.querySelector("#ongoing-list");
const projectAccordion = document.querySelector("#project-accordion");
const dialog = document.querySelector("#media-dialog");
const dialogStage = document.querySelector("#dialog-stage");
const dialogTitle = document.querySelector("#media-title");

function renderPublications(filter = "all") {
  const visible = publications.filter((item) => filter === "all" || item.filters.includes(filter));
  const tagClass = (tag) => {
    if (tag.includes("中科院 1 区")) return "tag tag-top";
    if (tag.includes("Q1")) return "tag tag-q1";
    if (tag.includes("SSCI Q2")) return "tag tag-q2";
    if (tag.includes("CSSCI")) return "tag tag-cssci";
    return "tag";
  };
  publicationList.innerHTML = visible.map((item, index) => `
    <article class="publication-item reveal">
      <span class="publication-index">${String(index + 1).padStart(2, "0")}</span>
      <div class="publication-main">
        <h3>${item.title}</h3>
        <p class="publication-meta"><em>${item.journal}</em> · ${item.year} · <strong class="author-role">${item.role}</strong></p>
        <p class="publication-summary">${item.summary}</p>
      </div>
      <div class="publication-side">
        <div class="publication-tags">${item.tags.map((tag) => `<span class="${tagClass(tag)}">${tag}</span>`).join("")}</div>
        <div class="publication-actions">
          <button class="read-publication" type="button" data-pdf="${item.pdf}" data-title="${item.journal}｜${item.title}">站内阅读全文</button>
          <a class="doi-link" href="${item.doi}" target="_blank" rel="noreferrer">DOI ↗</a>
        </div>
      </div>
    </article>`).join("");
  bindMediaButtons();
  refreshReveal();
}

function renderOngoing() {
  ongoingList.innerHTML = ongoingStudies.map((item, index) => `
    <article class="ongoing-card" style="z-index:${index + 1}">
      <div class="ongoing-card-copy">
        <span>${item.status} · <strong>${item.role}</strong></span>
        <h3>${item.title}</h3>
        <p class="ongoing-journal">${item.journal}</p>
        <p>${item.note}</p>
        <button class="evidence-button" type="button" data-image="${item.image}" data-title="${item.journal}｜送审状态证明">查看送审截图</button>
      </div>
      <figure class="ongoing-card-media" data-image="${item.image}" data-title="${item.journal}｜送审状态证明"><img src="${item.image}" alt="${item.journal} 送审状态截图"></figure>
    </article>`).join("");
  bindMediaButtons();
}

function renderProjects() {
  projectAccordion.innerHTML = projects.map((item, index) => `
    <article class="project-panel reveal">
      <img src="${item.image}" alt="${item.title}证明截图" style="object-position:${item.position}">
      <div class="project-copy">
        <small>${item.year} · ${item.status}</small>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <button class="evidence-button" type="button" data-image="${item.image}" data-title="${item.title}">查看证明截图</button>
      </div>
    </article>`).join("");
  bindMediaButtons();
  refreshReveal();
}

function openMedia({ pdf, image, title }) {
  dialogTitle.textContent = title || "材料预览";
  dialogStage.innerHTML = pdf
    ? `<iframe src="${pdf}#view=FitH" title="${title || "PDF 预览"}"></iframe>`
    : `<img src="${image}" alt="${title || "材料截图"}">`;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else window.open(pdf || image, "_blank", "noopener");
}

function bindMediaButtons() {
  document.querySelectorAll("[data-pdf], [data-image]").forEach((element) => {
    if (element.dataset.bound === "true") return;
    element.dataset.bound = "true";
    element.addEventListener("click", (event) => {
      if (element.closest(".project-panel")) event.stopPropagation();
      openMedia({ pdf: element.dataset.pdf, image: element.dataset.image, title: element.dataset.title });
    });
  });
}

document.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  renderPublications(button.dataset.filter);
}));

document.querySelector("#close-media").addEventListener("click", () => { dialog.close(); dialogStage.innerHTML = ""; });
dialog.addEventListener("click", (event) => { if (event.target === dialog) { dialog.close(); dialogStage.innerHTML = ""; } });

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
navToggle.addEventListener("click", () => {
  const open = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  siteNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}));

function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? scrollY / max : 0;
  document.querySelector("#scroll-progress").style.transform = `scaleX(${progress})`;
}
const sections = ["top", "research", "publications", "ongoing", "projects", "experience", "message"];
const navLinks = [...document.querySelectorAll("[data-nav]")];
function updateActiveSection() {
  const marker = scrollY + document.querySelector(".site-header").offsetHeight + 140;
  let current = "top";
  sections.forEach((id) => {
    const section = document.getElementById(id);
    if (section && section.offsetTop <= marker) current = id;
  });
  if (scrollY + innerHeight >= document.documentElement.scrollHeight - 8) current = "message";
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.nav === current));
}
function updatePagePosition() {
  updateScrollProgress();
  updateActiveSection();
}
addEventListener("scroll", updatePagePosition, { passive: true });
addEventListener("resize", updatePagePosition);
updatePagePosition();

document.querySelector(".wordmark").addEventListener("click", (event) => {
  event.preventDefault();
  scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  history.replaceState(null, "", `${location.pathname}${location.search}`);
});

let revealObserver;
function refreshReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
    }), { threshold: .12 });
  }
  document.querySelectorAll(".reveal:not([data-reveal-bound])").forEach((item) => {
    item.dataset.revealBound = "true";
    revealObserver.observe(item);
  });
}

function initMotion() {
  if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".hero-photo", { scale: .92, opacity: 0, rotate: 1.2, duration: 1.15, ease: "power3.out" });
  gsap.utils.toArray(".ongoing-card").forEach((card, index) => {
    gsap.from(card, { y: 80, opacity: 0, scale: .96, duration: .8, delay: index * .04, scrollTrigger: { trigger: card, start: "top 92%" } });
  });
}

const apiBase = (window.SITE_CONFIG?.apiBase || "").replace(/\/$/, "");
const messageForm = document.querySelector("#message-form");
const messageStatus = document.querySelector("#message-status");
const messageText = messageForm.elements.message;
messageText.addEventListener("input", () => { document.querySelector("#message-count").textContent = `${messageText.value.length} / 1000`; });

async function api(path, options = {}) {
  if (!apiBase) throw new Error("留言服务尚未配置");
  const response = await fetch(`${apiBase}${path}`, { ...options, headers: { "content-type": "application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "服务暂时不可用");
  return data;
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = messageForm.querySelector("button[type=submit]");
  submit.disabled = true;
  messageStatus.textContent = "正在发送……";
  const values = Object.fromEntries(new FormData(messageForm));
  if (values.contact) values.message = `${values.message}\n\n联系方式：${values.contact}`.slice(0, 1000);
  delete values.contact;
  try {
    await api("/api/message", { method: "POST", body: JSON.stringify(values) });
    messageForm.reset();
    document.querySelector("#message-count").textContent = "0 / 1000";
    messageStatus.textContent = "已收到，谢谢您的留言。";
  } catch (error) { messageStatus.textContent = error.message; }
  finally { submit.disabled = false; }
});

function recordVisit() {
  if (!apiBase) return;
  const eventId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const pagePath = `${location.pathname}${location.search}`;
  const payload = { eventId, path: pagePath, referrer: document.referrer };
  fetch(`${apiBase}/api/visit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true })
    .catch(() => {
      const pixel = new Image();
      pixel.src = `${apiBase}/api/visit.gif?event_id=${encodeURIComponent(eventId)}&path=${encodeURIComponent(pagePath)}&referrer=${encodeURIComponent(document.referrer)}&t=${Date.now()}`;
    });
}

renderPublications();
renderOngoing();
renderProjects();
bindMediaButtons();
refreshReveal();
initMotion();
recordVisit();
