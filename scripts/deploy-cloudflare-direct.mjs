import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const configPath = path.join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml");
const scriptName = "xujun-academic-api";
const databaseName = "xujun-academic-site";
const customDomain = "xujun-api.aiecnu.site";
const apiRoot = "https://api.cloudflare.com/client/v4";

function readTomlValue(source, key) {
  return source.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"))?.[1] || "";
}

async function refreshAccessToken() {
  const config = fs.readFileSync(configPath, "utf8");
  const refreshToken = readTomlValue(config, "refresh_token");
  if (!refreshToken) throw new Error("Cloudflare refresh token is unavailable.");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: "54d11594-84e4-41aa-b438-e81b8fa78ee7"
  });
  const response = await fetch("https://dash.cloudflare.com/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) throw new Error(`Cloudflare OAuth refresh failed: ${JSON.stringify(payload)}`);
  return payload.access_token;
}

function apiClient(token) {
  return async (pathname, options = {}) => {
    const response = await fetch(`${apiRoot}${pathname}`, {
      ...options,
      signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
    });
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { success: response.ok, result: text }; }
    if (!response.ok || payload.success === false) {
      throw new Error(`${options.method || "GET"} ${pathname} failed: ${JSON.stringify(payload.errors || payload)}`);
    }
    return payload.result;
  };
}

async function main() {
  console.log("cloudflare: refreshing credentials");
  const token = await refreshAccessToken();
  const api = apiClient(token);
  console.log("cloudflare: resolving account");
  const accounts = await api("/accounts?page=1&per_page=20");
  if (!accounts?.length) throw new Error("No Cloudflare account is available.");
  const accountId = accounts[0].id;

  const databases = await api(`/accounts/${accountId}/d1/database?name=${encodeURIComponent(databaseName)}&page=1&per_page=20`);
  let database = databases?.find((item) => item.name === databaseName);
  if (!database) {
    console.log("cloudflare: creating D1 database");
    database = await api(`/accounts/${accountId}/d1/database`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: databaseName })
    });
  }

  console.log("cloudflare: applying D1 schema");
  const schema = fs.readFileSync(path.join(root, "worker", "schema.sql"), "utf8");
  const statements = schema.split(";").map((value) => value.trim()).filter(Boolean);
  for (const sql of statements) {
    await api(`/accounts/${accountId}/d1/database/${database.uuid}/query`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sql })
    });
  }

  await api(`/accounts/${accountId}/d1/database/${database.uuid}/query`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sql: "DELETE FROM visits WHERE path = '/__system_check'" })
  });

  const source = fs.readFileSync(path.join(root, "worker", "src", "index.js"), "utf8");
  console.log("cloudflare: uploading Worker");
  const metadata = {
    main_module: "index.js",
    compatibility_date: "2026-08-23",
    bindings: [
      { type: "d1", name: "DB", id: database.uuid },
      { type: "plain_text", name: "ALLOWED_ORIGIN", text: "https://bigwhitetofu.github.io" },
      { type: "secret_text", name: "ADMIN_PASSWORD", text: "XXX" },
      { type: "secret_text", name: "ADMIN_TOKEN_SECRET", text: crypto.randomBytes(32).toString("hex") },
      { type: "secret_text", name: "IP_HASH_SECRET", text: crypto.randomBytes(32).toString("hex") }
    ]
  };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }), "metadata.json");
  form.append("index.js", new Blob([source], { type: "application/javascript+module" }), "index.js");
  await api(`/accounts/${accountId}/workers/scripts/${scriptName}`, { method: "PUT", body: form });

  console.log("cloudflare: attaching custom domain");
  let domainAttached = true;
  try {
    await api(`/accounts/${accountId}/workers/domains`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ environment: "production", hostname: customDomain, service: scriptName })
    });
  } catch (error) {
    domainAttached = false;
    console.error(String(error));
  }

  console.log(JSON.stringify({
    accountId,
    databaseId: database.uuid,
    databaseName,
    scriptName,
    customDomain,
    domainAttached
  }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
