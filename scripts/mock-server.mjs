import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const visits = [];
const messages = [];
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf", ".svg": "image/svg+xml" };
const body = (request) => new Promise((resolve) => { let data = ""; request.on("data", (chunk) => data += chunk); request.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); } }); });
const send = (response, status, value, type = "application/json; charset=utf-8") => { response.writeHead(status, { "content-type": type, "access-control-allow-origin": "*" }); response.end(type.startsWith("application/json") ? JSON.stringify(value) : value); };

http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname === "/api/visit" && request.method === "POST") { const data = await body(request); if (!visits.some((item) => item.event_id === data.eventId)) visits.push({ event_id: data.eventId, ip: "127.0.0.1", country: "CN", region: "Shanghai", city: "Shanghai", path: data.path || "/", referrer: data.referrer || "", visited_at: new Date().toISOString() }); return send(response, 201, { ok: true }); }
  if (url.pathname === "/api/visit.gif") { const eventId = url.searchParams.get("event_id"); if (!visits.some((item) => item.event_id === eventId)) visits.push({ event_id: eventId, ip: "127.0.0.1", country: "CN", region: "Shanghai", city: "Shanghai", path: url.searchParams.get("path") || "/", referrer: url.searchParams.get("referrer") || "", visited_at: new Date().toISOString() }); return send(response, 200, Buffer.from("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", "base64"), "image/gif"); }
  if (url.pathname === "/api/message" && request.method === "POST") { const data = await body(request); messages.unshift({ id: messages.length + 1, ip: "127.0.0.1", country: "CN", region: "Shanghai", city: "Shanghai", display_name: data.displayName || null, message: data.message, created_at: new Date().toISOString() }); return send(response, 201, { ok: true }); }
  if (url.pathname === "/api/admin/login" && request.method === "POST") { const data = await body(request); return data.password === "XXX" ? send(response, 200, { token: "mock-token" }) : send(response, 401, { error: "密码不正确" }); }
  if (url.pathname === "/api/admin/overview") {
    const count = visits.length;
    return send(response, 200, { summary: { totalVisits: count, uniqueVisitors: count ? 1 : 0, totalMessages: messages.length }, visitors: count ? [{ ip: "127.0.0.1", country: "CN", region: "Shanghai", city: "Shanghai", visit_count: count, first_visit: visits[0].visited_at, last_visit: visits.at(-1).visited_at }] : [], recentVisits: visits.slice().reverse(), messages });
  }
  const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1)).replace(/\/$/, "/index.html");
  const file = normalize(join(root, requested));
  if (!file.startsWith(normalize(root))) return send(response, 403, "Forbidden", "text/plain");
  try { const data = await readFile(file); send(response, 200, data, types[extname(file)] || "application/octet-stream"); }
  catch { try { const fallback = await readFile(join(root, "index.html")); send(response, 404, fallback, types[".html"]); } catch { send(response, 404, "Not found", "text/plain"); } }
}).listen(4173, "127.0.0.1", () => console.log("Academic site: http://127.0.0.1:4173"));
