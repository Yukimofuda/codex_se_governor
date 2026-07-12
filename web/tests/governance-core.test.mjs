import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { adoptionFiles, artifactOrder, buildCodexPrompt, checkRepositoryPaths, createTaskArtifacts, evaluateArtifacts } from "../app/lib/governance.mjs";
import { createZip, inspectZip } from "../app/lib/zip.mjs";

const project = { name: "测试项目", stack: "TypeScript", security: "High", privacy: "High", process: "Agile", aiAssisted: true };
const task = { id: "TASK-001", type: "Feature", title: "登录限制", problem: "暴力破解风险", goal: "限制连续登录失败", acceptance: "第五次失败后阻止后续尝试", constraints: "不可泄露账号状态", risk: "误锁用户", rollback: "关闭功能开关" };

test("generates the full task artifact package with traceability", () => {
  const artifacts = createTaskArtifacts(project, task);
  assert.deepEqual(Object.keys(artifacts), artifactOrder);
  assert.match(artifacts["REQUIREMENTS.md"], /FR-001/);
  assert.match(artifacts["TEST_CASE_MATRIX.md"], /FR-001 \/ AC-001/);
  assert.match(artifacts["SECURITY_REVIEW.md"], /Threat Model/);
  const metrics = evaluateArtifacts(artifacts);
  assert.equal(metrics.artifactCompletion, 100);
  assert.equal(metrics.security, "pass");
  assert.ok(metrics.traceability > 0);
});

test("supports every public MVP task type with the same evidence contract", () => {
  for (const type of ["Feature", "Bug Fix", "Refactor", "Architecture Change", "Security Review", "Deployment", "Maintenance"]) {
    const artifacts = createTaskArtifacts(project, { ...task, type, title: `${type} task` });
    assert.equal(Object.keys(artifacts).length, artifactOrder.length);
    assert.match(artifacts["PROCESS_COMPLIANCE_REPORT.md"], /Selected Process Model/);
    assert.match(artifacts["DEPLOYMENT_PLAN.md"], /Rollback Criteria/);
  }
});

test("adoption check reports exact missing governor paths", () => {
  const complete = checkRepositoryPaths(adoptionFiles);
  assert.equal(complete.score, 100);
  assert.deepEqual(complete.missing, []);
  const incomplete = checkRepositoryPaths(["AGENTS.md"]);
  assert.ok(incomplete.missing.includes("scripts/se_gate.py"));
});

test("prompt keeps lifecycle, tests, security, and rollback explicit", () => {
  const prompt = buildCodexPrompt(project, task, { plan: true, tests: true, docs: true, finalReport: true, minimal: true, dependencies: false, architecture: false });
  assert.match(prompt, /Engineering Plan/);
  assert.match(prompt, /Do not add dependencies/);
  assert.match(prompt, /关闭功能开关/);
  assert.doesNotMatch(prompt, /\/Users\//);
});

test("ZIP output preserves UTF-8 names and rejects traversal", () => {
  const archive = createZip({ "任务/需求.md": "# 需求", "AGENTS.md": "rules" });
  const inspection = inspectZip(archive);
  assert.deepEqual(inspection.issues, []);
  assert.ok(inspection.entries.some((entry) => entry.path === "任务/需求.md"));
  const unsafe = createZip({ "../secret.txt": "bad", "__MACOSX/._file": "bad" });
  const unsafeInspection = inspectZip(unsafe);
  assert.ok(unsafeInspection.issues.some((issue) => issue.includes("path traversal")));
  assert.ok(unsafeInspection.issues.some((issue) => issue.includes("generated directory")));
});

test("invalid ZIP bytes fail closed", () => {
  const inspection = inspectZip(new Uint8Array([1, 2, 3, 4]));
  assert.deepEqual(inspection.entries, []);
  assert.ok(inspection.issues.some((issue) => issue.includes("invalid ZIP")));
});

test("responsive and reduced-motion policies are present", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /@media \(max-width: 540px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.mobile-nav/);
});
