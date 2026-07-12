import assert from "node:assert/strict";
import test from "node:test";

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
  assert.match(html, /<title>Codex SE Governor \| Lifecycle Workspace<\/title>/i);
  assert.match(html, /Codex SE Governor/);
  assert.match(html, /Lifecycle Workspace/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("capability endpoint states the public execution boundary", async () => {
  const response = await (await worker()).fetch(new Request("http://localhost/api/capabilities"), environment, context);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.mode, "local-first");
  assert.equal(body.execution, "disabled");
  assert.ok(body.unavailable.includes("pytest"));
});
