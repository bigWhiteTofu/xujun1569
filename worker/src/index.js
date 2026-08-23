const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET" && origin && env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN !== "*" && origin !== env.ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed" }, 403, cors);
    }

    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/health") return json({ ok: true }, 200, cors);
      if (url.pathname === "/api/visit" && request.method === "POST") return recordVisit(request, env, cors);
      if (url.pathname === "/api/visit.gif" && request.method === "GET") return recordVisitPixel(request, env, cors);
      if (url.pathname === "/api/message" && request.method === "POST") return saveMessage(request, env, cors);
      if (url.pathname === "/api/admin/login" && request.method === "POST") return adminLogin(request, env, cors);
      if (url.pathname === "/api/admin/overview" && request.method === "GET") return adminOverview(request, env, cors);
      return json({ error: "Not found" }, 404, cors);
    } catch (error) {
      console.error(error);
      return json({ error: "服务暂时不可用" }, 500, cors);
    }
  }
};

function corsHeaders(origin, allowedOrigin = "*") {
  const allowed = allowedOrigin === "*" || origin === allowedOrigin ? (origin || "*") : allowedOrigin;
  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
}

function visitor(request) {
  const cf = request.cf || {};
  return {
    ip: request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "unknown",
    country: cf.country || "",
    region: cf.region || "",
    city: cf.city || "",
    timezone: cf.timezone || "",
    asn: cf.asn || null,
    organization: cf.asOrganization || ""
  };
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signed)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function recordVisit(request, env, cors) {
  const body = await safeBody(request);
  await persistVisit(request, env, body);
  return json({ ok: true }, 201, cors);
}

async function recordVisitPixel(request, env, cors) {
  const url = new URL(request.url);
  await persistVisit(request, env, {
    eventId: url.searchParams.get("event_id"),
    path: url.searchParams.get("path"),
    referrer: url.searchParams.get("referrer")
  });
  const bytes = Uint8Array.from(atob("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="), (character) => character.charCodeAt(0));
  return new Response(bytes, { status: 200, headers: { ...cors, "content-type": "image/gif", "cache-control": "no-store, max-age=0" } });
}

async function persistVisit(request, env, body) {
  const v = visitor(request);
  const ipHash = await hmac(v.ip, env.IP_HASH_SECRET || "replace-this-ip-secret");
  const eventId = String(body.eventId || "").slice(0, 100) || null;
  await env.DB.prepare(`INSERT OR IGNORE INTO visits (event_id, ip, ip_hash, country, region, city, timezone, asn, organization, user_agent, referrer, path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(eventId, v.ip, ipHash, v.country, v.region, v.city, v.timezone, v.asn, v.organization, request.headers.get("User-Agent")?.slice(0, 500) || "", String(body.referrer || "").slice(0, 500), String(body.path || "/").slice(0, 300)).run();
}

async function saveMessage(request, env, cors) {
  const body = await safeBody(request);
  if (body.website) return json({ ok: true }, 201, cors);
  const displayName = String(body.displayName || "").trim();
  const message = String(body.message || "").trim();
  if (displayName.length > 80) return json({ error: "称呼请控制在 80 字内" }, 400, cors);
  if (message.length < 2 || message.length > 1000) return json({ error: "留言请控制在 2—1000 字内" }, 400, cors);
  const v = visitor(request);
  const ipHash = await hmac(v.ip, env.IP_HASH_SECRET || "replace-this-ip-secret");
  const recent = await env.DB.prepare("SELECT COUNT(*) AS count FROM messages WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hour')").bind(ipHash).first();
  if ((recent?.count || 0) >= 5) return json({ error: "发送较为频繁，请稍后再试" }, 429, cors);
  await env.DB.prepare("INSERT INTO messages (ip, ip_hash, country, region, city, display_name, message) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(v.ip, ipHash, v.country, v.region, v.city, displayName || null, message).run();
  return json({ ok: true }, 201, cors);
}

async function adminLogin(request, env, cors) {
  const body = await safeBody(request);
  const expected = env.ADMIN_PASSWORD || "XXX";
  if (!timingSafeEqual(String(body.password || ""), expected)) return json({ error: "密码不正确" }, 401, cors);
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({ iat: now, exp: now + 8 * 3600 }));
  const signature = await hmac(payload, env.ADMIN_TOKEN_SECRET || "replace-this-admin-token-secret");
  return json({ token: `${payload}.${signature}`, expiresIn: 28800 }, 200, cors);
}

async function adminOverview(request, env, cors) {
  if (!(await authorized(request, env))) return json({ error: "登录已失效，请重新验证" }, 401, cors);
  const summary = await env.DB.prepare(`SELECT COUNT(*) AS totalVisits, COUNT(DISTINCT ip_hash) AS uniqueVisitors,
    (SELECT COUNT(*) FROM messages) AS totalMessages FROM visits`).first();
  const visitors = await env.DB.prepare(`SELECT ip, country, region, city, COUNT(*) AS visit_count,
    MIN(visited_at) AS first_visit, MAX(visited_at) AS last_visit FROM visits GROUP BY ip_hash ORDER BY last_visit DESC LIMIT 200`).all();
  const recentVisits = await env.DB.prepare("SELECT ip, country, region, city, path, referrer, visited_at FROM visits ORDER BY visited_at DESC LIMIT 100").all();
  const messages = await env.DB.prepare("SELECT id, ip, country, region, city, display_name, message, created_at FROM messages ORDER BY created_at DESC LIMIT 200").all();
  return json({
    summary: { totalVisits: summary?.totalVisits || 0, uniqueVisitors: summary?.uniqueVisitors || 0, totalMessages: summary?.totalMessages || 0 },
    visitors: visitors.results || [], recentVisits: recentVisits.results || [], messages: messages.results || []
  }, 200, cors);
}

async function authorized(request, env) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload, env.ADMIN_TOKEN_SECRET || "replace-this-admin-token-secret");
  if (!timingSafeEqual(signature, expected)) return false;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    return JSON.parse(atob(padded)).exp > Math.floor(Date.now() / 1000);
  }
  catch { return false; }
}

function timingSafeEqual(a, b) {
  const aa = encoder.encode(a); const bb = encoder.encode(b);
  if (aa.length !== bb.length) return false;
  let result = 0;
  for (let i = 0; i < aa.length; i += 1) result |= aa[i] ^ bb[i];
  return result === 0;
}

function base64url(value) {
  return btoa(unescape(encodeURIComponent(value))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function safeBody(request) {
  try { return await request.json(); } catch { return {}; }
}
