import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { adoptionFiles, artifactOrder, buildCodexPrompt, checkRepositoryPaths, createTaskArtifacts, createTraceableTaskArtifacts, evaluateArtifacts } from "../app/lib/governance.mjs";
import { createZip, inspectZip } from "../app/lib/zip.mjs";
import { buildReleaseManifest } from "../app/lib/export.mjs";
import { parseGithubRepoUrl } from "../app/lib/repository.ts";
import { assertSafeProviderUrl, maskApiKey, redactProviderError } from "../app/server/providers.ts";
import { openProviderConfig, sealProviderConfig } from "../app/server/provider-vault.ts";
import { createPlan, createRun, importValidationManifest, releaseReadiness } from "../app/domain/governance.ts";
import { validateProjectDraft } from "../app/domain/project-validation.ts";
import { demoProject, demoRequirement } from "../app/domain/demo.ts";

const project = { name: "测试项目", stack: "TypeScript", security: "High", privacy: "High", process: "Agile", aiAssisted: true };
const task = { id: "TASK-001", type: "Feature", title: "登录限制", problem: "暴力破解风险", goal: "限制连续登录失败", acceptance: "第五次失败后阻止后续尝试", constraints: "不可泄露账号状态", risk: "误锁用户", rollback: "关闭功能开关" };
const validProjectDraft = {
  name: "客户服务门户",
  description: "客服跟踪问题。",
  stack: ["TypeScript", "React"],
  softwareType: "Web application",
  source: "github-public",
  repository: "https://github.com/example/customer-portal",
  branch: "main",
  environment: "Development",
  policyProfile: "standard",
};

test("project setup blocks missing boundaries without arbitrary length rules", () => {
  const empty = { ...validProjectDraft, name: "", description: "", stack: [] };
  assert.deepEqual(validateProjectDraft(empty, 1), ["name", "description", "stack"]);
  assert.deepEqual(validateProjectDraft({ ...validProjectDraft, name: "A" }, 1), []);
  assert.deepEqual(validateProjectDraft({ ...validProjectDraft, repository: "https://example.com/repo" }, 1), ["repository"]);
  assert.deepEqual(validateProjectDraft({ ...validProjectDraft, branch: "" }, 2), ["branch"]);
  assert.deepEqual(validateProjectDraft(validProjectDraft, 2), []);
});

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

test("confirmed requirement and quality scenarios flow into exported evidence", () => {
  const artifacts = createTraceableTaskArtifacts(
    { ...project, environment: "Production", release: "Staged" },
    {
      ...task,
      stakeholders: ["Customer", "Security owner"],
      userStory: { role: "customer", goal: "download only my orders", benefit: "I can reconcile invoices" },
      functional: ["FR-001 Signed-in customers can export their own orders", "FR-002 Exports include order number and total"],
      nonFunctional: ["NFR-001 Exports never include another customer's records"],
      acceptanceDetails: [
        { id: "AC-001", kind: "normal", context: "a customer has two orders", action: "the customer exports orders", expected: "the file contains exactly those two orders" },
        { id: "AC-002", kind: "security", context: "a customer changes an order owner ID", action: "the customer requests an export", expected: "the server rejects access without disclosing another order" },
      ],
      qualityScenarios: [{ id: "QS-SEC-001", attribute: "security", condition: "an export contains a foreign owner ID", expectedResponse: "deny the export and record a redacted audit event", verification: "authorization integration test passes" }],
      securityRequirements: ["Authorize every order against the authenticated customer"],
      outOfScope: ["Accounting-system import"],
    },
  );
  assert.match(artifacts["REQUIREMENTS.md"], /Customer/);
  assert.match(artifacts["REQUIREMENTS.md"], /FR-002/);
  assert.match(artifacts["USER_STORY.md"], /download only my orders/);
  assert.match(artifacts["TEST_CASE_MATRIX.md"], /FR-002 \/ AC-002/);
  assert.match(artifacts["TEST_CASE_MATRIX.md"], /NFR-001/);
  assert.match(artifacts["QUALITY_ATTRIBUTE_SCENARIOS.md"], /authorization integration test passes/);
  assert.match(artifacts["SECURITY_REVIEW.md"], /Authorize every order/);
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

test("redacts provider errors and never returns a complete key", () => {
  const redacted = redactProviderError("Authorization: Bearer sk-test-secret-value");
  assert.doesNotMatch(redacted, /sk-test-secret-value/);
  assert.match(maskApiKey("sk-1234567890ABCD"), /•{8}ABCD$/);
});

test("accepts only public GitHub repository URLs", () => {
  assert.deepEqual(parseGithubRepoUrl("https://github.com/openai/openai"), {
    owner: "openai",
    repo: "openai",
  });
  assert.equal(parseGithubRepoUrl("https://example.com/openai/openai"), null);
  assert.equal(parseGithubRepoUrl("https://github.com/openai"), null);
});

test("builds a deterministic release manifest with SHA-256 evidence", async () => {
  const manifest = await buildReleaseManifest({
    "需求.md": "# Requirements",
    "TEST_PLAN.md": "# Test Plan",
  });
  assert.equal(manifest.schema, 2);
  assert.equal(manifest.files.length, 2);
  assert.match(manifest.files[0].sha256, /^[a-f0-9]{64}$/);
  assert.ok(manifest.files.every((file) => !file.path.includes("/Users/")));
});

test("responsive and reduced-motion policies are present", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@media \(max-width: 1080px\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(min-width: 1680px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.run-layout/);
  assert.match(css, /\.requirement-layout/);
  assert.match(css, /\.sidebar-backdrop/);
});

test("provider endpoints reject local and private network targets", () => {
  assert.throws(() => assertSafeProviderUrl("http://example.com/v1"), /HTTPS/);
  assert.throws(() => assertSafeProviderUrl("https://localhost/v1"), /Private or local/);
  assert.throws(() => assertSafeProviderUrl("https://192.168.1.4/v1"), /Private or local/);
  assert.equal(assertSafeProviderUrl("https://api.example.com/v1").hostname, "api.example.com");
});

test("provider session encryption round-trips without exposing plaintext", async () => {
  const vaultKey = "test-provider-vault-secret-with-32-characters";
  const config = { provider: "openai", apiKey: "sk-test-secret-value", model: "gpt-test", baseUrl: "https://api.openai.com/v1", timeoutSeconds: 30, maxRetries: 1, savedAt: "2026-09-04T00:00:00.000Z" };
  const sealed = await sealProviderConfig(config, vaultKey);
  assert.doesNotMatch(sealed, /sk-test-secret-value/);
  assert.deepEqual(await openProviderConfig(sealed, vaultKey), config);
});

test("domain workflow preserves actor, evidence, and release semantics", () => {
  const plan = createPlan(demoProject, { ...demoRequirement, projectId: "project-test", source: "user" });
  assert.equal(plan.phases.length, 14);
  assert.equal(plan.phases.find((item) => item.id === "validation").tasks[0].owner, "deterministic");
  const run = createRun({ ...plan, projectId: "project-test", status: "approved" });
  assert.equal(run.currentStage, "user-story");
  assert.equal(createRun(plan, "2026-09-04T00:00:00.000Z", 3).sequence, 3);
  const imported = importValidationManifest({ validators: [{ validator: "build", status: "pass", duration_seconds: 1.2 }] }, run);
  assert.equal(imported.checks[0].status, "passed");
  assert.equal(imported.evidence[0].source, "verified");
  const release = releaseReadiness(imported.run, imported.checks, imported.evidence);
  assert.equal(release.status, "blocked");
  assert.ok(release.blockers.some((item) => item.includes("Testing")));
});

test("validation results update their real stages and policy gates release", () => {
  const plan = createPlan(demoProject, { ...demoRequirement, projectId: "project-release", source: "user" });
  const baseRun = createRun({ ...plan, projectId: "project-release", status: "approved" }, "2026-09-04T00:00:00.000Z");
  const implemented = {
    ...baseRun,
    stages: baseRun.stages.map((stage) => !["release", "retrospective"].includes(stage.key)
      ? { ...stage, status: "passed", output: stage.key === "implementation" ? "PR #42" : `${stage.label} evidence confirmed` }
      : stage),
  };
  const imported = importValidationManifest({ validators: [
    { validator: "build", status: "pass" },
    { validator: "pytest", status: "pass" },
    { validator: "security-review", status: "pass" },
    { validator: "validate_traceability", status: "pass" },
  ] }, implemented);
  assert.equal(imported.run.stages.find((stage) => stage.key === "validation").status, "passed");
  assert.equal(imported.run.stages.find((stage) => stage.key === "testing").status, "passed");
  assert.equal(imported.run.stages.find((stage) => stage.key === "security").status, "passed");
  assert.equal(imported.run.currentStage, "release");
  assert.deepEqual(new Set(imported.checks.map((check) => check.key)), new Set(["build", "unit-tests", "security-review", "policy-check"]));
  const beforeApproval = releaseReadiness(imported.run, imported.checks, imported.evidence);
  assert.deepEqual(beforeApproval.blockers, ["Release owner approval is required."]);
  const approved = releaseReadiness(imported.run, imported.checks, imported.evidence, "run-1", undefined, [{ id: "decision-1", runId: imported.run.id, type: "release-approval", actor: "human", decision: "approved", reason: "Owner reviewed the evidence.", createdAt: "2026-09-04T00:10:00.000Z" }]);
  assert.equal(approved.status, "ready");
});

test("demo data is centralized and explicitly marked as recorded", async () => {
  const demoSource = await readFile(new URL("../app/domain/demo.ts", import.meta.url), "utf8");
  const pageSources = await Promise.all([
    "OverviewPage.tsx", "RunPage.tsx", "ChecksPage.tsx", "EvidencePage.tsx", "ReleasePage.tsx",
  ].map((name) => readFile(new URL(`../app/components/pages/${name}`, import.meta.url), "utf8")));
  assert.match(demoSource, /recorded-demo/);
  assert.doesNotMatch(pageSources.join("\n"), /RUN-DEMO-002|CHK-DEMO-BUILD|Sample Login API/);
});
