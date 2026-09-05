import type {
  Check,
  Decision,
  Evidence,
  EngineeringArtifact,
  ExecutionPlan,
  GovernancePolicy,
  Project,
  ReleaseManifest,
  Requirement,
  ValidationManifestInput,
  WorkflowRun,
  WorkflowStage,
  WorkStatus,
} from "./model";
import { lifecycleBlueprint, requiredProjectArtifacts, requiredProjectChecks } from "./course-policy.ts";

export const policies: GovernancePolicy[] = [
  {
    id: "standard",
    name: "Standard",
    description: "适用于常规产品迭代。构建、测试、安全与工程规则必须有结果。",
    requiredChecks: ["build", "unit-tests", "security-review", "policy-check"],
    requiredArtifacts: ["REQUIREMENTS.md", "DESIGN.md", "TEST_PLAN.md", "RISK_REGISTER.md", "SECURITY_REVIEW.md", "FINAL_REPORT.md"],
    requiredApprovals: ["plan owner", "release owner"],
    blockOnWarning: false,
    requireHumanReleaseApproval: true,
  },
  {
    id: "strict",
    name: "Strict",
    description: "适用于敏感或关键系统。警告也会阻止发布，且必须人工批准。",
    requiredChecks: ["build", "lint", "type-check", "unit-tests", "integration-tests", "dependency-audit", "security-review", "policy-check"],
    requiredArtifacts: ["REQUIREMENTS.md", "USER_STORY.md", "ANALYSIS.md", "DESIGN.md", "ADR.md", "TEST_PLAN.md", "TEST_CASE_MATRIX.md", "RISK_REGISTER.md", "SECURITY_REVIEW.md", "AI_USAGE_REVIEW.md", "DEPLOYMENT_PLAN.md", "MAINTENANCE_TASK.md", "FINAL_REPORT.md"],
    requiredApprovals: ["plan owner", "security owner", "release owner"],
    blockOnWarning: true,
    requireHumanReleaseApproval: true,
  },
  {
    id: "custom",
    name: "Custom",
    description: "由项目负责人明确选择必需检查；未配置前按 Standard 执行。",
    requiredChecks: ["build", "unit-tests", "security-review", "policy-check"],
    requiredArtifacts: ["REQUIREMENTS.md", "TEST_PLAN.md", "RISK_REGISTER.md", "SECURITY_REVIEW.md", "FINAL_REPORT.md"],
    requiredApprovals: ["plan owner", "release owner"],
    blockOnWarning: false,
    requireHumanReleaseApproval: true,
  },
];

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 6)}`;
}

export function createPlan(project: Project, requirement: Requirement, timestamp = new Date().toISOString()): ExecutionPlan {
  return {
    id: makeId("plan"),
    projectId: project.id,
    requirementId: requirement.id,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
    phases: lifecycleBlueprint.map((phase, index) => ({
      id: phase.key,
      name: phase.name.en,
      tasks: [{
        id: `${phase.key}-${index + 1}`,
        title: phase.purpose.zh,
        owner: phase.actor,
        input: index === 0 ? `${project.name} project profile` : lifecycleBlueprint[index - 1].artifactNames.join(", "),
        expectedOutput: phase.artifactNames.join(", "),
        check: phase.completion.zh,
        dependency: index === 0 ? undefined : lifecycleBlueprint[index - 1].key,
        risk: phase.risk.zh,
        status: "pending",
      }],
    })),
  };
}

export function createRun(plan: ExecutionPlan, timestamp = new Date().toISOString(), sequence = 1): WorkflowRun {
  const stages: WorkflowStage[] = lifecycleBlueprint.map((phase, index) => ({
    id: `${plan.id}-${phase.key}`,
    key: phase.key,
    label: phase.name.en,
    status: index < 2 ? "passed" : index === 2 ? "pending" : "not-run",
    actor: phase.actor,
    startedAt: index < 2 ? timestamp : undefined,
    endedAt: index < 2 ? timestamp : undefined,
    input: index === 0 ? "Confirmed project profile" : lifecycleBlueprint[index - 1].artifactNames.join(", "),
    output: index === 0 ? "PROJECT_CONTEXT.md" : index === 1 ? "REQUIREMENTS.md" : "",
    decision: index === 0 ? "Project context confirmed by owner" : index === 1 ? "Requirement confirmed by owner" : "Evidence not provided",
    checkIds: [],
    evidenceIds: [],
  }));
  return {
    id: makeId("run"),
    projectId: plan.projectId,
    requirementId: plan.requirementId,
    planId: plan.id,
    sequence,
    status: "pending",
    currentStage: "user-story",
    stages,
    startedAt: timestamp,
    kind: "workspace",
    executionTarget: "evidence-import",
  };
}

export function projectPolicy(project: Project): GovernancePolicy {
  const base = policies.find((policy) => policy.id === project.policyProfile) || policies[0];
  const profileChecks = requiredProjectChecks(project);
  const profileArtifacts = requiredProjectArtifacts(project);
  if (project.policyProfile !== "custom") {
    return {
      ...base,
      requiredChecks: [...new Set([...base.requiredChecks, ...profileChecks])],
      requiredArtifacts: [...new Set([...(base.requiredArtifacts || []), ...profileArtifacts])],
    };
  }
  return {
    ...base,
    requiredChecks: [...new Set([...(project.customRequiredChecks || base.requiredChecks), ...profileChecks])],
    requiredArtifacts: [...new Set([...(base.requiredArtifacts || []), ...profileArtifacts])],
  };
}

function normalizeStatus(value = ""): WorkStatus {
  const normalized = value.toLowerCase().replaceAll("_", "-");
  if (["pass", "passed", "success"].includes(normalized)) return "passed";
  if (["fail", "failed", "error", "timeout"].includes(normalized)) return "failed";
  if (normalized === "warning" || normalized === "warn") return "warning";
  if (normalized === "running") return "running";
  if (normalized === "skipped") return "skipped";
  if (normalized === "pending") return "pending";
  if (normalized === "not-run") return "not-run";
  return "unknown";
}

function classifyCheck(name: string): Check["category"] {
  const value = name.toLowerCase();
  if (value.includes("security") || value.includes("secret") || value.includes("dependency")) return "security";
  if (value.includes("test") || value.includes("pytest")) return "test";
  if (value.includes("build")) return "build";
  if (value.includes("architecture")) return "architecture";
  if (value.includes("policy") || value.includes("trace") || value.includes("governance")) return "policy";
  return "quality";
}

function stageForCategory(category: Check["category"], label: string): WorkflowStage["key"] {
  const value = label.toLowerCase();
  if (category === "test") return "testing";
  if (category === "security") return "security";
  if (category === "architecture") return "design";
  if (value.includes("document") || value.includes("maintenance") || value.includes("release-package")) return "documentation";
  if (value.includes("risk") || value.includes("quality-attribute")) return "risk-quality";
  return "validation";
}

function canonicalCheckKey(name: string): string {
  const value = name.toLowerCase().replaceAll("_", "-").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  // Check categories must not collapse distinct policy IDs; only exact legacy aliases may do so.
  switch (value) {
    case "pytest":
    case "tests-unit":
      return "unit-tests";
    case "tests-integration":
      return "integration-tests";
    case "se-gate":
    case "validate-traceability":
      return "policy-check";
    default:
      return value || "quality-check";
  }
}

export function importValidationManifest(
  input: ValidationManifestInput,
  run: WorkflowRun,
  timestamp = new Date().toISOString(),
): { run: WorkflowRun; checks: Check[]; evidence: Evidence[] } {
  const records = input.validators || input.results || [];
  if (!Array.isArray(records) || records.length === 0) throw new Error("Validation manifest contains no validator results.");
  const evidence: Evidence[] = [];
  const checks: Check[] = records.map((record, index) => {
    const label = String(record.validator || record.name || `check-${index + 1}`);
    const category = classifyCheck(label);
    const stageKey = stageForCategory(category, label);
    const targetStage = run.stages.find((stage) => stage.key === stageKey);
    if (!targetStage) throw new Error(`Run has no ${stageKey} stage.`);
    const evidenceId = `${run.id}-validation-${index + 1}`;
    const command = Array.isArray(record.command) ? record.command.join(" ") : record.command;
    evidence.push({
      id: evidenceId,
      runId: run.id,
      type: category === "test" ? "test" : category === "security" ? "security" : "validation",
      title: `${label} result`,
      source: "imported",
      createdAt: timestamp,
      summary: `${normalizeStatus(record.status)} result imported from validation-results.json`,
      content: JSON.stringify(record, null, 2),
      artifactName: "validation-results.json",
    });
    return {
      id: `${run.id}-check-${index + 1}`,
      runId: run.id,
      stageId: targetStage.id,
      key: canonicalCheckKey(label),
      label,
      category,
      actor: "deterministic",
      status: normalizeStatus(record.status),
      command,
      durationSeconds: record.duration_seconds,
      summary: (record.errors || []).join("; ") || (record.warnings || []).join("; ") || "Completed without reported findings.",
      output: JSON.stringify({ errors: record.errors || [], warnings: record.warnings || [] }, null, 2),
      evidenceIds: [evidenceId],
    };
  });
  const stages = run.stages.map((stage) => {
    const stageChecks = checks.filter((check) => check.stageId === stage.id);
    if (!stageChecks.length) return stage;
    const statuses = stageChecks.map((check) => check.status);
    const status: WorkStatus = statuses.includes("failed") ? "failed" : statuses.includes("warning") ? "warning" : statuses.every((item) => item === "passed") ? "passed" : "unknown";
    return {
      ...stage,
      status,
      startedAt: timestamp,
      endedAt: timestamp,
      output: `${stageChecks.length} results imported`,
      decision: status === "passed" ? `${stage.label} passed` : `${stage.label} requires attention`,
      checkIds: stageChecks.map((check) => check.id),
      evidenceIds: stageChecks.flatMap((check) => check.evidenceIds),
      failureReason: status === "failed" ? stageChecks.filter((check) => check.status === "failed").map((check) => check.label).join(", ") : undefined,
    };
  });
  const attention = stages.find((stage) => stage.status === "failed") || stages.find((stage) => stage.status === "warning");
  const next = attention || stages.find((stage) => ["pending", "not-run", "unknown"].includes(stage.status)) || stages.at(-1)!;
  const runStatus: WorkStatus = attention?.status === "failed" ? "failed" : attention?.status === "warning" ? "warning" : "pending";
  return { run: { ...run, stages, currentStage: next.key, status: runStatus }, checks, evidence };
}

export function releaseReadiness(
  run: WorkflowRun,
  checks: Check[],
  evidence: Evidence[],
  version = "draft",
  policy: GovernancePolicy = policies[0],
  decisions: Decision[] = [],
  artifacts?: EngineeringArtifact[],
): ReleaseManifest {
  const runChecks = checks.filter((check) => check.runId === run.id);
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (run.stages.some((stage) => stage.status === "failed")) blockers.push("A workflow stage has failed.");
  if (runChecks.some((check) => check.status === "failed")) blockers.push("One or more deterministic checks failed.");
  for (const stage of run.stages.filter((item) => !["release", "retrospective"].includes(item.key) && ["not-run", "pending", "unknown"].includes(item.status))) {
    blockers.push(`${stage.label} has no completed evidence.`);
  }
  const checkKeys = new Set(runChecks.filter((check) => ["passed", "warning"].includes(check.status)).map((check) => check.key));
  for (const required of policy.requiredChecks.filter((key) => !checkKeys.has(key))) blockers.push(`Required check is missing: ${required}.`);
  if (runChecks.some((check) => check.status === "warning")) {
    if (policy.blockOnWarning) blockers.push("The selected policy blocks release while a check has a warning.");
    else warnings.push("Validation warnings require an explicit human decision.");
  }
  const verifiedEvidence = evidence.filter((item) => item.runId === run.id && item.source === "verified" && ["validation", "test", "security"].includes(item.type));
  if (verifiedEvidence.length === 0) blockers.push("No verified validation evidence is attached to this run.");
  if (artifacts) {
    const runArtifacts = artifacts.filter((item) => item.requirementId === run.requirementId);
    for (const required of policy.requiredArtifacts || []) {
      const artifact = runArtifacts.find((item) => item.fileName === required);
      if (!artifact) blockers.push(`Required artifact is missing: ${required}.`);
      else if (artifact.status === "draft") blockers.push(`Required artifact still needs confirmation: ${required}.`);
    }
  }
  const releaseApproved = decisions.some((item) => item.runId === run.id && item.type === "release-approval" && item.decision === "approved");
  if (policy.requireHumanReleaseApproval && !releaseApproved) blockers.push("Release owner approval is required.");
  const status: ReleaseManifest["status"] = blockers.length ? "blocked" : warnings.length ? "conditional" : "ready";
  return {
    id: `${run.id}-release`,
    runId: run.id,
    version,
    status,
    blockers: [...new Set(blockers)],
    warnings,
    acceptedRisks: releaseApproved ? [...warnings] : [],
    checkIds: runChecks.map((check) => check.id),
    evidenceIds: evidence.filter((item) => item.runId === run.id).map((item) => item.id),
    generatedAt: new Date().toISOString(),
  };
}

export function projectProgress(requirement?: Requirement, plan?: ExecutionPlan, run?: WorkflowRun) {
  if (!requirement) return { percent: 0, label: "Define requirement", next: "Add the first requirement" };
  if (requirement.status !== "confirmed") return { percent: 15, label: "Requirement draft", next: "Review and confirm the requirement" };
  if (!plan) return { percent: 28, label: "Requirement confirmed", next: "Create an engineering plan" };
  if (plan.status !== "approved") return { percent: 40, label: "Plan draft", next: "Review and approve the plan" };
  if (!run) return { percent: 50, label: "Plan approved", next: "Start a governed run" };
  const complete = run.stages.filter((stage) => stage.status === "passed").length;
  return { percent: Math.round((complete / run.stages.length) * 100), label: run.status, next: run.status === "failed" ? "Resolve the failed check" : "Add the next required evidence" };
}
