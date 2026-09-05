import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

process.env["PROVIDER_VAULT_SECRET"] = "test-provider-vault-secret-with-more-than-32-characters";

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const environment = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};

const context = { waitUntil() {}, passThroughOnException() {} };

test("server-renders the governance workspace", async () => {
  const response = await (await worker()).fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), environment, context);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Codex SE Governor \| AI 软件工程治理工作区<\/title>/i);
  assert.match(html, /Codex SE Governor/);
  assert.match(html, /workspace-content/);
  assert.match(html, /所有项目/);
  assert.match(html, /设置/);
  assert.match(html, /manifest\.webmanifest/);
  assert.match(html, /og-governor\.png/);
  assert.doesNotMatch(html, />Local-first</i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("capability endpoint states the public execution boundary", async () => {
  const response = await (await worker()).fetch(new Request("http://localhost/api/capabilities"), environment, context);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.mode, "governance-workspace");
  assert.equal(body.execution, "external-evidence-import-and-loopback-codex-runner");
  assert.equal(body.localRunner.transport, "loopback-only");
  assert.equal(body.localRunner.analysisSandbox, "read-only");
  assert.equal(body.localRunner.implementationSandbox, "workspace-write");
  assert.equal(body.persistence, "browser-indexeddb");
  assert.equal(body.ai, "server-side-provider-session");
  assert.equal(body.secretStorage, "encrypted-httponly-session");
  assert.ok(body.unavailable.includes("accounts"));
});

test("provider configuration stays in an encrypted HttpOnly session", async () => {
  const app = await worker();
  const providerKey = "sk-test-provider-secret-value";
  const response = await app.fetch(new Request("http://localhost/api/providers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "openai", apiKey: providerKey, model: "gpt-test", timeoutSeconds: 30, maxRetries: 0 }),
  }), environment, context);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.doesNotMatch(body, new RegExp(providerKey));
  assert.match(body, /sk-••••••••alue/);
  const cookie = response.headers.get("set-cookie") ?? "";
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.doesNotMatch(cookie, new RegExp(providerKey));

  const getResponse = await app.fetch(new Request("http://localhost/api/providers", {
    headers: { cookie: cookie.split(";")[0] },
  }), environment, context);
  assert.equal(getResponse.status, 200);
  const saved = await getResponse.text();
  assert.doesNotMatch(saved, new RegExp(providerKey));
  assert.match(saved, /\"configured\":true/);
});

test("provider status degrades cleanly when a local deployment has no vault secret", async () => {
  const previousVaultKey = process.env.PROVIDER_VAULT_SECRET;
  delete process.env.PROVIDER_VAULT_SECRET;
  try {
    const response = await (await worker()).fetch(new Request("http://localhost/api/providers"), {}, context);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.vaultAvailable, false);
    assert.equal(body.configured, false);
    assert.equal(body.provider, null);
    assert.ok(body.catalog.length >= 5);
  } finally {
    process.env["PROVIDER_VAULT_SECRET"] = previousVaultKey;
  }
});

test("publishes installable PWA metadata", async () => {
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.short_name, "SE Governor");
  assert.ok(manifest.icons.some((icon) => icon.src === "/favicon.svg"));
  const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(serviceWorker, /url\.pathname\.startsWith\("\/api\/"\)/);
});
