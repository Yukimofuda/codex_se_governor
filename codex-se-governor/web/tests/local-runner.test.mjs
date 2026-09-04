import assert from "node:assert/strict";
import test from "node:test";
import { buildCodexArgs, corsHeaders, parseRunnerArgs, safeEqual } from "../local-runner/server.mjs";

test("local runner requires an explicit workspace and strong bearer token", () => {
  assert.throws(() => parseRunnerArgs(["--workspace", "/tmp/repo", "--token", "short"]), /at least 16/);
  const parsed = parseRunnerArgs(["--workspace", "/tmp/repo", "--token", "sixteen-characters", "--origin", "https://example.test"]);
  assert.equal(parsed.workspace, "/tmp/repo");
  assert.deepEqual(parsed.origins, ["https://example.test"]);
});

test("local runner grants workspace writes only to implementation runs", () => {
  assert.ok(buildCodexArgs({ mode: "plan" }).includes("read-only"));
  assert.ok(buildCodexArgs({ mode: "implement" }).includes("workspace-write"));
  assert.ok(buildCodexArgs({ mode: "implement" }).includes('approval_policy="never"'));
});

test("local runner request boundary enforces origin and bearer token", () => {
  const token = "runner-test-token-1234";
  const origin = "https://governor.example";
  assert.equal(corsHeaders("https://attacker.example", [origin]), null);
  assert.equal(corsHeaders(origin, [origin])["access-control-allow-origin"], origin);
  assert.equal(safeEqual("wrong-token", token), false);
  assert.equal(safeEqual(token, token), true);
});
