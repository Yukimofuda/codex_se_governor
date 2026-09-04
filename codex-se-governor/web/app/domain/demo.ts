import { lifecycleBlueprint } from "./course-policy.ts";
import type { Check, EngineeringArtifact, Evidence, ExecutionPlan, Project, ReleaseManifest, Requirement, WorkflowRun, WorkspaceState } from "./model";

const timestamp = "2026-08-28T09:30:00.000Z";

export const demoProject: Project = {
  id: "demo-login-api",
  name: "Sample Login API",
  description: "为登录接口增加失败次数限制，降低密码暴力尝试风险。",
  softwareType: "Web API",
  stack: ["TypeScript", "Node.js", "PostgreSQL"],
  repository: "github.com/example/sample-login-api",
  branch: "feature/login-rate-limit",
  environment: "Demo recording",
  policyProfile: "strict",
  source: "recorded-demo",
  processModel: "agile",
  lifecycleStage: "production",
  teamSize: "small",
  releaseStrategy: "staged",
  aiAssisted: true,
  executionTarget: "evidence-import",
  qualityProfile: {
    security: "account-data",
    privacy: "personal-data",
    reliability: "business-critical",
    performance: "interactive",
    compliance: [],
  },
  createdAt: timestamp,
  updatedAt: "2026-08-28T09:47:12.000Z",
  demo: true,
};

export const demoRequirement: Requirement = {
  id: "REQ-DEMO-001",
  projectId: demoProject.id,
  kind: "security",
  title: "Limit repeated login failures",
  original: "Add rate limiting to the login endpoint.",
  stakeholders: ["Account holder", "Security owner", "Service operator"],
  userStory: {
    role: "account holder",
    goal: "have repeated password attempts limited",
    benefit: "my account is harder to attack without revealing whether it exists",
  },
  goal: "Reduce automated password guessing without revealing whether an account exists.",
  userProblem: "An attacker can currently make unlimited password attempts against one account or source address.",
  functional: [
    "FR-001 Count failed login attempts by account and source address within a rolling window.",
    "FR-002 Block additional attempts for 15 minutes after five failures.",
    "FR-003 Reset the account counter after a successful login.",
  ],
  nonFunctional: ["NFR-001 The control must not add more than 30 ms to the p95 login response time."],
  constraints: ["Use the existing cache service; do not add a new runtime dependency."],
  acceptanceCriteria: [
    "AC-001 The sixth failed attempt within ten minutes is rejected.",
    "AC-002 A successful login resets the account failure counter.",
    "AC-003 Responses do not reveal whether the account exists.",
  ],
  acceptanceDetails: [
    { id: "AC-001", kind: "boundary", context: "five failed attempts occur within ten minutes", action: "a sixth attempt is submitted", expected: "the attempt is rejected for the configured cooling period" },
    { id: "AC-002", kind: "regression", context: "an account has previous failures", action: "the user signs in successfully", expected: "the account failure counter is reset" },
    { id: "AC-003", kind: "security", context: "an unknown or known account is submitted", action: "authentication fails", expected: "the public response does not disclose account existence" },
  ],
  qualityScenarios: [
    { id: "QS-SEC-001", attribute: "security", title: "Enumeration-resistant throttling", condition: "Repeated attempts target an account or source address", expectedResponse: "Apply the same public response and bounded throttling policy", verification: "Security review and adversarial tests", source: "project-profile", status: "confirmed" },
    { id: "QS-PERF-001", attribute: "performance", title: "Login interaction latency", condition: "Normal login load is replayed before and after the change", expectedResponse: "No material regression from the measured baseline", verification: "p95 comparison in the same test environment", source: "project-profile", status: "confirmed" },
  ],
  security: ["Rate-limit both account and source address to reduce bypass and denial-of-service risk."],
  performance: ["Measure p95 login latency before and after the change."],
  outOfScope: ["Replacing the authentication provider."],
  additionalContext: "This is recorded demo data. It is not a live repository execution.",
  status: "confirmed",
  source: "recorded-demo",
  updatedAt: timestamp,
};

export const demoPlan: ExecutionPlan = {
  id: "PLAN-DEMO-001",
  projectId: demoProject.id,
  requirementId: demoRequirement.id,
  status: "approved",
  createdAt: timestamp,
  updatedAt: "2026-08-28T09:32:00.000Z",
  phases: lifecycleBlueprint.map((phase, index) => ({
    id: phase.key,
    name: phase.name.en,
    tasks: [{
      id: `P${index + 1}`,
      title: phase.key === "implementation" ? "Add the rate-limit policy behind a feature flag" : phase.purpose.en,
      owner: phase.actor,
      input: index === 0 ? "Recorded project profile" : lifecycleBlueprint[index - 1].artifactNames.join(", "),
      expectedOutput: phase.artifactNames.join(", "),
      check: phase.completion.en,
      dependency: index === 0 ? undefined : `P${index}`,
      risk: phase.risk.en,
      status: phase.key === "security" ? "warning" : phase.key === "release" || phase.key === "retrospective" ? "pending" : "passed",
    }],
  })),
};

export const demoChecks: Check[] = [
  { id: "CHK-DEMO-BUILD", runId: "RUN-DEMO-002", stageId: "STG-DEMO-VALIDATION", key: "build", label: "Build", category: "build", actor: "deterministic", status: "passed", command: "npm run build", durationSeconds: 12.4, summary: "Production build completed.", output: "Build completed with exit code 0.", evidenceIds: ["EVD-DEMO-BUILD"] },
  { id: "CHK-DEMO-UNIT", runId: "RUN-DEMO-002", stageId: "STG-DEMO-TESTING", key: "unit-tests", label: "Unit tests", category: "test", actor: "deterministic", status: "passed", command: "npm test -- login-rate-limit", durationSeconds: 8.7, summary: "18 tests passed, including boundary and reset cases.", output: "18 passed; 0 failed; 0 skipped.", evidenceIds: ["EVD-DEMO-TEST"] },
  { id: "CHK-DEMO-SEC", runId: "RUN-DEMO-002", stageId: "STG-DEMO-SECURITY", key: "security-review", label: "Security review", category: "security", actor: "human", status: "warning", durationSeconds: 6.2, summary: "Source-address counters need proxy-header validation before release.", output: "Reviewer: Security owner\nDecision: warning\nAction: trust only the configured reverse-proxy header.", evidenceIds: ["EVD-DEMO-SEC"] },
  { id: "CHK-DEMO-POLICY", runId: "RUN-DEMO-002", stageId: "STG-DEMO-VALIDATION", key: "policy-check", label: "Governance policy", category: "policy", actor: "deterministic", status: "passed", command: "python3 scripts/run_full_validation.py --standard", durationSeconds: 21.1, summary: "Required artifacts and traceability are present.", output: "PASS: standard validation", evidenceIds: ["EVD-DEMO-POLICY"] },
  { id: "CHK-DEMO-FAILED", runId: "RUN-DEMO-001", stageId: "STG-DEMO-FAILED-TEST", key: "unit-tests", label: "Unit tests", category: "test", actor: "deterministic", status: "failed", command: "npm test -- login-rate-limit", durationSeconds: 7.1, summary: "The reset-after-success case failed.", output: "Expected counter=0, received counter=4.", evidenceIds: ["EVD-DEMO-FAILED"] },
];

export const demoEvidence: Evidence[] = [
  { id: "EVD-DEMO-CONTEXT", runId: "RUN-DEMO-002", type: "artifact", title: "Project context", source: "recorded-demo", createdAt: timestamp, summary: "Web API, account data, staged release, strict governance.", content: "Software type: Web API\nSecurity: account data\nReliability: business critical\nProcess: agile", artifactName: "PROJECT_CONTEXT.md" },
  { id: "EVD-DEMO-REQ", runId: "RUN-DEMO-002", type: "requirement", title: "Confirmed requirement snapshot", source: "recorded-demo", createdAt: timestamp, summary: "Requirement, constraints and acceptance criteria approved.", content: JSON.stringify(demoRequirement, null, 2), artifactName: "REQUIREMENTS.json" },
  { id: "EVD-DEMO-STORY", runId: "RUN-DEMO-002", type: "artifact", title: "User story", source: "recorded-demo", createdAt: "2026-08-28T09:31:20.000Z", summary: "Account-holder outcome and three acceptance criteria confirmed.", content: "As an account holder, I want repeated password attempts limited so that my account is harder to attack.", artifactName: "USER_STORY.md" },
  { id: "EVD-DEMO-ANALYSIS", runId: "RUN-DEMO-002", type: "artifact", title: "Domain analysis", source: "recorded-demo", createdAt: "2026-08-28T09:31:28.000Z", summary: "Account, source-address, rolling-window and proxy trust boundaries analyzed.", content: "Entities: Account, AttemptWindow\nBoundaries: Login endpoint, trusted proxy\nFailure mode: legitimate-user lockout", artifactName: "ANALYSIS.md" },
  { id: "EVD-DEMO-DESIGN", runId: "RUN-DEMO-002", type: "artifact", title: "Design and ADR", source: "recorded-demo", createdAt: "2026-08-28T09:31:36.000Z", summary: "Existing cache service selected with feature-flag rollback.", content: "Decision: reuse the existing cache service.\nAlternative rejected: database counter.\nRollback: disable the feature flag.", artifactName: "ADR.md" },
  { id: "EVD-DEMO-RISK", runId: "RUN-DEMO-002", type: "artifact", title: "Risk and quality review", source: "recorded-demo", createdAt: "2026-08-28T09:31:44.000Z", summary: "Lockout, proxy spoofing and latency risks have owners and tests.", content: "R-001 legitimate-user lockout\nR-002 untrusted proxy header\nR-003 cache latency", artifactName: "RISK_REGISTER.md" },
  { id: "EVD-DEMO-PLAN", runId: "RUN-DEMO-002", type: "plan", title: "Approved execution plan", source: "recorded-demo", createdAt: "2026-08-28T09:32:00.000Z", summary: "Fourteen-stage plan with artifacts, checks and risks.", content: JSON.stringify(demoPlan, null, 2), artifactName: "PLAN.json" },
  { id: "EVD-DEMO-IMPL", runId: "RUN-DEMO-002", type: "diff", title: "Implementation diff", source: "recorded-demo", createdAt: "2026-08-28T09:38:46.000Z", summary: "Feature-flagged rate-limit policy implemented in commit 7f3a21b.", content: "Recorded diff reference: 7f3a21b", artifactName: "IMPLEMENTATION_LOG.md" },
  { id: "EVD-DEMO-BUILD", runId: "RUN-DEMO-002", type: "validation", title: "Build log", source: "recorded-demo", createdAt: "2026-08-28T09:39:10.000Z", summary: "Build passed in 12.4 seconds.", content: "Build completed with exit code 0.", artifactName: "build.log" },
  { id: "EVD-DEMO-TEST", runId: "RUN-DEMO-002", type: "test", title: "Test report", source: "recorded-demo", createdAt: "2026-08-28T09:42:08.000Z", summary: "18 requirement-linked tests passed.", content: "FR-001: 8 passed\nFR-002: 6 passed\nFR-003: 4 passed", artifactName: "test-results.txt" },
  { id: "EVD-DEMO-SEC", runId: "RUN-DEMO-002", type: "security", title: "Security review decision", source: "recorded-demo", createdAt: "2026-08-28T09:45:22.000Z", summary: "One proxy trust warning remains open.", content: "Validate the source IP header against the configured trusted proxy list before release.", artifactName: "SECURITY_REVIEW.md" },
  { id: "EVD-DEMO-DOCS", runId: "RUN-DEMO-002", type: "artifact", title: "Deployment and maintenance plan", source: "recorded-demo", createdAt: "2026-08-28T09:46:00.000Z", summary: "Staged rollout, monitoring and rollback steps documented.", content: "Deploy behind a 10% feature flag, monitor rejection rate, disable on false-positive threshold.", artifactName: "DEPLOYMENT_PLAN.md" },
  { id: "EVD-DEMO-POLICY", runId: "RUN-DEMO-002", type: "validation", title: "Governor validation result", source: "recorded-demo", createdAt: "2026-08-28T09:43:40.000Z", summary: "Standard governance validation passed.", content: "PASS", artifactName: "validation-results.json" },
  { id: "EVD-DEMO-FAILED", runId: "RUN-DEMO-001", type: "test", title: "Failed test output", source: "recorded-demo", createdAt: "2026-08-27T16:14:00.000Z", summary: "Successful login did not reset the failure counter.", content: "Expected counter=0, received counter=4.", artifactName: "test-results.txt" },
];

const stageEvidence: Partial<Record<WorkflowRun["stages"][number]["key"], string[]>> = {
  context: ["EVD-DEMO-CONTEXT"],
  requirements: ["EVD-DEMO-REQ"],
  "user-story": ["EVD-DEMO-STORY"],
  analysis: ["EVD-DEMO-ANALYSIS"],
  design: ["EVD-DEMO-DESIGN"],
  "risk-quality": ["EVD-DEMO-RISK"],
  planning: ["EVD-DEMO-PLAN"],
  implementation: ["EVD-DEMO-IMPL"],
  validation: ["EVD-DEMO-BUILD", "EVD-DEMO-POLICY"],
  testing: ["EVD-DEMO-TEST"],
  security: ["EVD-DEMO-SEC"],
  documentation: ["EVD-DEMO-DOCS"],
};

const stageChecks: Partial<Record<WorkflowRun["stages"][number]["key"], string[]>> = {
  validation: ["CHK-DEMO-BUILD", "CHK-DEMO-POLICY"],
  testing: ["CHK-DEMO-UNIT"],
  security: ["CHK-DEMO-SEC"],
};

const demoStages: WorkflowRun["stages"] = lifecycleBlueprint.map((phase, index) => {
  const complete = !["release", "retrospective"].includes(phase.key);
  const status = phase.key === "security" ? "warning" : complete ? "passed" : phase.key === "release" ? "pending" : "not-run";
  return {
    id: `STG-DEMO-${phase.key.toUpperCase()}`,
    key: phase.key,
    label: phase.name.en,
    status,
    actor: phase.actor,
    startedAt: complete ? new Date(Date.parse(timestamp) + index * 52_000).toISOString() : undefined,
    endedAt: complete ? new Date(Date.parse(timestamp) + index * 52_000 + 32_000).toISOString() : undefined,
    input: index === 0 ? "Recorded project profile" : lifecycleBlueprint[index - 1].artifactNames.join(", "),
    output: complete ? phase.artifactNames.join(", ") : "",
    decision: phase.key === "security" ? "One proxy-trust warning must be resolved" : phase.key === "release" ? "Blocked by unresolved security warning" : phase.key === "retrospective" ? "Starts after release decision" : phase.completion.en,
    checkIds: stageChecks[phase.key] || [],
    evidenceIds: stageEvidence[phase.key] || [],
  };
});

export const demoRuns: WorkflowRun[] = [
  { id: "RUN-DEMO-002", projectId: demoProject.id, requirementId: demoRequirement.id, planId: demoPlan.id, sequence: 2, commit: "7f3a21b", status: "warning", currentStage: "security", stages: demoStages, startedAt: timestamp, kind: "recorded-demo" },
  { id: "RUN-DEMO-001", projectId: demoProject.id, requirementId: demoRequirement.id, planId: demoPlan.id, sequence: 1, commit: "d31bf08", status: "failed", currentStage: "testing", stages: demoStages.map((stage) => stage.key === "testing" ? { ...stage, id: "STG-DEMO-FAILED-TEST", status: "failed", checkIds: ["CHK-DEMO-FAILED"], evidenceIds: ["EVD-DEMO-FAILED"], decision: "Implementation returned for correction", failureReason: "Reset-after-success regression" } : stage.key === "security" || stage.key === "release" ? { ...stage, status: "not-run", checkIds: [], evidenceIds: [], decision: "Blocked by failed tests" } : stage), startedAt: "2026-08-27T16:02:00.000Z", endedAt: "2026-08-27T16:14:03.000Z", kind: "recorded-demo" },
];

export const demoRelease: ReleaseManifest = {
  id: "REL-DEMO-002",
  runId: "RUN-DEMO-002",
  version: "demo-0.2.0",
  status: "blocked",
  blockers: ["Validate the source-address proxy header before release."],
  warnings: ["Security review has one unresolved warning."],
  acceptedRisks: [],
  checkIds: demoChecks.filter((check) => check.runId === "RUN-DEMO-002").map((check) => check.id),
  evidenceIds: demoEvidence.filter((item) => item.runId === "RUN-DEMO-002").map((item) => item.id),
  generatedAt: "2026-08-28T09:47:12.000Z",
};

export const demoArtifacts: EngineeringArtifact[] = demoEvidence
  .filter((item) => item.runId === "RUN-DEMO-002" && item.artifactName)
  .map((item) => ({
    id: `ART-${item.id}`,
    projectId: demoProject.id,
    requirementId: demoRequirement.id,
    runId: item.runId,
    stageKey: (Object.entries(stageEvidence).find(([, ids]) => ids?.includes(item.id))?.[0] || "documentation") as EngineeringArtifact["stageKey"],
    fileName: item.artifactName!,
    title: item.title,
    status: "verified",
    source: "recorded-demo",
    content: item.content,
    updatedAt: item.createdAt,
  }));

export function initialWorkspace(): WorkspaceState {
  return {
    schemaVersion: 5,
    projects: [demoProject],
    requirements: [demoRequirement],
    plans: [demoPlan],
    runs: demoRuns,
    checks: demoChecks,
    evidence: demoEvidence,
    decisions: [],
    releases: [demoRelease],
    artifacts: demoArtifacts,
    activeProjectId: "",
    activeRunId: "",
    onboardingComplete: false,
  };
}
