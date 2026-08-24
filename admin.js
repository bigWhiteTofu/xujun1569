const apiBase = (window.SITE_CONFIG?.apiBase || "").replace(/\/$/, "");
const apiReady = !apiBase.includes("YOUR-WORKER");
const loginPanel = document.querySelector("#login-panel");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
let token = sessionStorage.getItem("xj_admin_token") || "";

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const regionNames = new Intl.DisplayNames(["zh-CN"], { type: "region" });
const placeNames = {
  anhui: "安徽", beijing: "北京", chongqing: "重庆", fujian: "福建", gansu: "甘肃", guangdong: "广东", guangxi: "广西", guizhou: "贵州",
  hainan: "海南", hebei: "河北", heilongjiang: "黑龙江", henan: "河南", hubei: "湖北", hunan: "湖南", jiangsu: "江苏", jiangxi: "江西",
  jilin: "吉林", liaoning: "辽宁", neimenggu: "内蒙古", "inner mongolia": "内蒙古", ningxia: "宁夏", qinghai: "青海", shaanxi: "陕西",
  shandong: "山东", shanghai: "上海", shanxi: "山西", sichuan: "四川", tianjin: "天津", tibet: "西藏", xinjiang: "新疆", yunnan: "云南",
  zhejiang: "浙江", hongkong: "香港", "hong kong": "香港", macao: "澳门", macau: "澳门", taiwan: "台湾",
  hangzhou: "杭州", nanjing: "南京", guangzhou: "广州", shenzhen: "深圳", chengdu: "成都", wuhan: "武汉", xian: "西安", "xi'an": "西安",
  changsha: "长沙", suzhou: "苏州", qingdao: "青岛", ningbo: "宁波", xiamen: "厦门", kunming: "昆明", harbin: "哈尔滨", shenyang: "沈阳",
  tokyo: "东京", california: "加利福尼亚州", "los angeles": "洛杉矶", "san jose": "圣何塞", iowa: "艾奥瓦州", "council bluffs": "康瑟尔布拉夫斯",
  virginia: "弗吉尼亚州", ashburn: "阿什本", washington: "华盛顿州", seattle: "西雅图", ontario: "安大略省", toronto: "多伦多",
  hesse: "黑森州", "frankfurt am main": "法兰克福", "tel aviv": "特拉维夫"
};
const chinesePlace = (value) => placeNames[String(value || "").toLowerCase()] || value;
const dateTime = (value) => {
  if (!value) return "—";
  const iso = String(value).includes("T") ? String(value) : String(value).replace(" ", "T");
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "medium", hour12: false, timeZone: "Asia/Shanghai" }).format(date);
};
const locationText = (row) => {
  const country = row.country ? regionNames.of(row.country.toUpperCase()) : "";
  return [country, chinesePlace(row.region), chinesePlace(row.city)].filter(Boolean).filter((value, index, list) => list.indexOf(value) === index).join(" · ") || "未知";
};

async function api(path, options = {}) {
  if (!apiReady) throw new Error("请先在 config.js 中填写 Worker 地址。");
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

async function loadDashboard() {
  const data = await api("/api/admin/overview");
  const diagnosticVisits = data.recentVisits.filter((row) => String(row.path || "").startsWith("/__system"));
  const diagnosticIps = new Set(diagnosticVisits.map((row) => row.ip));
  const visibleVisitors = data.visitors.filter((row) => !diagnosticIps.has(row.ip));
  const visibleVisits = data.recentVisits.filter((row) => !String(row.path || "").startsWith("/__system"));
  loginPanel.hidden = true;
  dashboard.hidden = false;
  document.querySelector("#metric-grid").innerHTML = [
    [Math.max(0, data.summary.uniqueVisitors - (data.visitors.length - visibleVisitors.length)), "独立 IP"],
    [Math.max(0, data.summary.totalVisits - diagnosticVisits.length), "总访问次数"],
    [data.summary.totalMessages, "匿名留言"]
  ].map(([value, label]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
  document.querySelector("#visitor-rows").innerHTML = visibleVisitors.map((row) => `<tr><td>${escapeHtml(row.ip)}</td><td>${escapeHtml(locationText(row))}</td><td>${row.visit_count}</td><td>${dateTime(row.first_visit)}</td><td>${dateTime(row.last_visit)}</td></tr>`).join("") || '<tr><td colspan="5">暂无访问</td></tr>';
  document.querySelector("#visit-rows").innerHTML = visibleVisits.map((row) => `<tr><td>${dateTime(row.visited_at)}</td><td>${escapeHtml(row.ip)}</td><td>${escapeHtml(locationText(row))}</td><td>${escapeHtml(row.path)}</td><td>${escapeHtml(row.referrer || "直接访问")}</td></tr>`).join("") || '<tr><td colspan="5">暂无访问</td></tr>';
  document.querySelector("#admin-messages").innerHTML = data.messages.map((row) => `<article class="message-admin-item"><div><time>${dateTime(row.created_at)}</time><small>${escapeHtml(row.ip)} · ${escapeHtml(locationText(row))}</small>${row.display_name ? `<strong>称呼：${escapeHtml(row.display_name)}</strong>` : ""}</div><p>${escapeHtml(row.message)}</p></article>`).join("") || '<p>暂无留言。</p>';
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent = "正在验证……";
  try {
    const data = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: loginForm.password.value }) });
    token = data.token;
    sessionStorage.setItem("xj_admin_token", token);
    loginForm.reset();
    await loadDashboard();
  } catch (error) { loginStatus.textContent = error.message; }
});

document.querySelector("#logout").addEventListener("click", () => {
  token = "";
  sessionStorage.removeItem("xj_admin_token");
  dashboard.hidden = true;
  loginPanel.hidden = false;
  loginStatus.textContent = "";
});

if (token) loadDashboard().catch(() => sessionStorage.removeItem("xj_admin_token"));
