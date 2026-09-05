import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultQualityProfile,
  performanceChoices,
  privacyChoices,
  processChoices,
  reliabilityChoices,
  securityChoices,
} from "../app/domain/course-policy.ts";
import { demoProject, demoRequirement } from "../app/domain/demo.ts";
import { createPlan, createRun, importValidationManifest, policies, projectPolicy, releaseReadiness } from "../app/domain/governance.ts";

const timestamp = "2026-09-05T00:00:00.000Z";
const baseProject = {
  ...demoProject,
  id: "project-check-identity",
  demo: false,
  source: "blank",
  processModel: "agile",
  qualityProfile: defaultQualityProfile,
};

function runFor(project = baseProject) {
  const requirement = { ...demoRequirement, projectId: project.id, source: "user" };
  const plan = createPlan(project, requirement, timestamp);
  return createRun({ ...plan, status: "approved" }, timestamp);
}

const qualityChoices = [
  ["security", securityChoices],
  ["privacy", privacyChoices],
  ["reliability", reliabilityChoices],
  ["performance", performanceChoices],
];
const profileCases = [
  ["defaults", {}],
  ...qualityChoices.flatMap(([attribute, choices]) => choices.map(({ id }) => [
    `${attribute}/${id}`,
    { qualityProfile: { ...defaultQualityProfile, [attribute]: id } },
  ])),
  ...processChoices.map(({ id }) => [`process/${id}`, { processModel: id }]),
];

for (const policy of policies) {
  for (const [profileName, profile] of profileCases) {
    test(`preserves required check IDs for ${policy.id} policy with ${profileName}`, () => {
      const project = { ...baseProject, ...profile, policyProfile: policy.id };
      const effectivePolicy = projectPolicy(project);
      const run = runFor(project);
      for (const [collection, nameField] of [["validators", "validator"], ["results", "name"]]) {
        const input = { [collection]: effectivePolicy.requiredChecks.map((key) => ({ [nameField]: key, status: "pass" })) };
        const imported = importValidationManifest(input, run, timestamp);
        assert.deepEqual(imported.checks.map((check) => check.key), effectivePolicy.requiredChecks);
        const readiness = releaseReadiness(imported.run, imported.checks, imported.evidence, "draft", effectivePolicy);
        assert.deepEqual(readiness.blockers.filter((blocker) => blocker.startsWith("Required check is missing:")), []);
      }
    });
  }
}

test("preserves custom policy IDs even when their names contain category keywords", () => {
  const project = {
    ...baseProject,
    policyProfile: "custom",
    customRequiredChecks: ["billing-security-test", "dependency-inventory", "audit-log-test", "rebuild-cache", "lint-policy-docs", "acceptance-trace-custom"],
  };
  const keys = projectPolicy(project).requiredChecks;
  const imported = importValidationManifest({ validators: keys.map((validator) => ({ validator, status: "pass" })) }, runFor(project), timestamp);
  assert.deepEqual(imported.checks.map((check) => check.key), keys);
});

const legacyAliases = [
  ["pytest", "unit-tests"],
  ["tests_unit", "unit-tests"],
  ["tests_integration", "integration-tests"],
  ["se_gate", "policy-check"],
  ["validate_traceability", "policy-check"],
];

for (const [legacy, expected] of legacyAliases) {
  test(`maps only the exact legacy alias ${legacy} to ${expected}`, () => {
    const labels = [legacy, legacy.replaceAll("_", "-"), ` ${legacy.toUpperCase()} `];
    const imported = importValidationManifest({ validators: labels.map((validator) => ({ validator, status: "pass" })) }, runFor(), timestamp);
    assert.deepEqual(imported.checks.map((check) => check.key), labels.map(() => expected));
    assert.deepEqual(imported.checks.map((check) => check.label), labels);
  });
}

test("does not promote similarly named validators to legacy or category checks", () => {
  const labels = [
    "validate_pytest_environment",
    "validate_test_traceability",
    "validate_traceability_graph",
    "tests_e2e",
    "tests_unit_performance",
    "tests_integration_report",
    "se_gate_report",
    "integration-smoke-test",
    "secret-scan-extra",
    "type-schema-check",
    "governance-metrics",
  ];
  const imported = importValidationManifest({ validators: labels.map((validator) => ({ validator, status: "pass" })) }, runFor(), timestamp);
  assert.deepEqual(imported.checks.map((check) => check.key), labels.map((label) => label.replaceAll("_", "-")));
});

test("normalizes spelling without collapsing explicit policy IDs or changing statuses", () => {
  const records = [
    { validator: " SECRET_SCAN ", status: "failed", key: "secret-scan", normalizedStatus: "failed" },
    { validator: " Security Tests ", status: "not_run", key: "security-tests", normalizedStatus: "not-run" },
    { validator: " RECOVERY_TEST ", status: "unknown", key: "recovery-test", normalizedStatus: "unknown" },
    { validator: " Acceptance Trace ", status: "warning", key: "acceptance-trace", normalizedStatus: "warning" },
    { validator: " !!! ", status: "pending", key: "quality-check", normalizedStatus: "pending" },
  ];
  const input = { validators: records.map(({ validator, status }) => ({ validator, status })) };
  const original = structuredClone(input);
  const run = runFor();
  const imported = importValidationManifest(input, run, timestamp);
  assert.deepEqual(imported.checks.map((check) => check.key), records.map((record) => record.key));
  assert.deepEqual(imported.checks.map((check) => check.status), records.map((record) => record.normalizedStatus));
  assert.deepEqual(input, original);
  assert.equal(run.status, "pending");
});
