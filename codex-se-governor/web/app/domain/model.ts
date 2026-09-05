export type Language = "zh" | "en";
export type ActorKind = "deterministic" | "ai" | "human" | "external";
export type EvidenceSource = "verified" | "imported" | "local-runner" | "recorded-demo" | "attested" | "ai-assisted" | "cached" | "unknown";
export type WorkStatus = "passed" | "failed" | "warning" | "running" | "pending" | "skipped" | "not-run" | "unknown";
export type RequirementStatus = "draft" | "confirmed";
export type PlanStatus = "draft" | "approved";
export type ReleaseStatus = "ready" | "conditional" | "blocked" | "unknown";
export type PolicyProfile = "standard" | "strict" | "custom";
export type ProjectSource = "blank" | "github-public" | "local-codex" | "recorded-demo";
export type ExecutionTarget = "hosted-assist" | "local-codex" | "evidence-import";
export type ProcessModel = "agile" | "waterfall" | "spiral" | "v-model" | "custom";
export type SecurityProfile = "public-content" | "account-data" | "sensitive-data";
export type PrivacyProfile = "no-personal-data" | "personal-data" | "sensitive-personal-data";
export type ReliabilityProfile = "recoverable" | "business-critical" | "high-availability";
export type PerformanceProfile = "baseline-first" | "interactive" | "latency-critical";

export type ProjectQualityProfile = {
  security: SecurityProfile;
  privacy: PrivacyProfile;
  reliability: ReliabilityProfile;
  performance: PerformanceProfile;
  compliance: string[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  softwareType: string;
  stack: string[];
  repository?: string;
  branch: string;
  environment: string;
  policyProfile: PolicyProfile;
  source?: ProjectSource;
  processModel?: ProcessModel;
  lifecycleStage?: "discovery" | "development" | "production" | "maintenance";
  teamSize?: "solo" | "small" | "medium" | "large";
  releaseStrategy?: "manual" | "staged" | "continuous";
  aiAssisted?: boolean;
  executionTarget?: ExecutionTarget;
  localWorkspaceName?: string;
  qualityProfile?: ProjectQualityProfile;
  customRequiredChecks?: string[];
  createdAt: string;
  updatedAt: string;
  demo?: boolean;
};

export type QualityScenario = {
  id: string;
  attribute: "security" | "privacy" | "reliability" | "performance" | "maintainability";
  title: string;
  condition: string;
  expectedResponse: string;
  verification: string;
  source: "project-profile" | "user" | "ai-assisted";
  status: "draft" | "confirmed";
};

export type AcceptanceCriterion = {
  id: string;
  kind: "normal" | "boundary" | "failure" | "security" | "regression";
  context: string;
  action: string;
  expected: string;
};

export type Requirement = {
  id: string;
  projectId: string;
  kind: "feature" | "bug-fix" | "refactor" | "architecture" | "security" | "deployment" | "maintenance";
  title: string;
  original: string;
  stakeholders?: string[];
  userStory?: { role: string; goal: string; benefit: string };
  goal: string;
  userProblem: string;
  functional: string[];
  nonFunctional: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  acceptanceDetails?: AcceptanceCriterion[];
  qualityScenarios?: QualityScenario[];
  assumptions?: string[];
  conflicts?: string[];
  security: string[];
  performance: string[];
  outOfScope: string[];
  additionalContext: string;
  status: RequirementStatus;
  source: "user" | "ai-assisted" | "recorded-demo";
  updatedAt: string;
};

export type PlanTask = {
  id: string;
  title: string;
  owner: ActorKind;
  input: string;
  expectedOutput: string;
  check: string;
  dependency?: string;
  risk: string;
  status: WorkStatus;
};

export type PlanPhase = {
  id: string;
  name: string;
  tasks: PlanTask[];
};

export type ExecutionPlan = {
  id: string;
  projectId: string;
  requirementId: string;
  status: PlanStatus;
  phases: PlanPhase[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStage = {
  id: string;
  key:
    | "context"
    | "requirements"
    | "user-story"
    | "analysis"
    | "design"
    | "risk-quality"
    | "planning"
    | "implementation"
    | "validation"
    | "testing"
    | "security"
    | "documentation"
    | "release"
    | "retrospective";
  label: string;
  status: WorkStatus;
  actor: ActorKind;
  startedAt?: string;
  endedAt?: string;
  input: string;
  output: string;
  decision: string;
  checkIds: string[];
  evidenceIds: string[];
  failureReason?: string;
};

export type WorkflowRun = {
  id: string;
  projectId: string;
  requirementId: string;
  planId: string;
  sequence: number;
  commit?: string;
  status: WorkStatus;
  currentStage: WorkflowStage["key"];
  stages: WorkflowStage[];
  startedAt: string;
  endedAt?: string;
  kind: "workspace" | "recorded-demo";
  executionTarget?: ExecutionTarget;
  runnerRunId?: string;
};

export type Check = {
  id: string;
  runId: string;
  stageId: string;
  key: string;
  label: string;
  category: "build" | "quality" | "test" | "security" | "policy" | "architecture";
  actor: ActorKind;
  status: WorkStatus;
  command?: string;
  durationSeconds?: number;
  summary: string;
  output: string;
  evidenceIds: string[];
};

export type Evidence = {
  id: string;
  runId: string;
  type: "requirement" | "plan" | "diff" | "test" | "validation" | "security" | "log" | "decision" | "artifact" | "release";
  title: string;
  source: EvidenceSource;
  createdAt: string;
  summary: string;
  content: string;
  artifactName?: string;
};

export type EngineeringArtifact = {
  id: string;
  projectId: string;
  requirementId: string;
  runId?: string;
  stageKey: WorkflowStage["key"];
  fileName: string;
  title: string;
  status: "draft" | "confirmed" | "verified";
  source: "template" | "ai-assisted" | "human" | "deterministic" | "recorded-demo";
  content: string;
  updatedAt: string;
};

export type Decision = {
  id: string;
  runId: string;
  type: "plan-approval" | "risk-acceptance" | "release-approval";
  actor: "human" | "policy";
  decision: "approved" | "rejected" | "accepted";
  reason: string;
  createdAt: string;
};

export type ReleaseManifest = {
  id: string;
  runId: string;
  version: string;
  status: ReleaseStatus;
  blockers: string[];
  warnings: string[];
  acceptedRisks: string[];
  checkIds: string[];
  evidenceIds: string[];
  generatedAt: string;
};

export type GovernancePolicy = {
  id: PolicyProfile;
  name: string;
  description: string;
  requiredChecks: Check["key"][];
  requiredArtifacts?: string[];
  requiredApprovals?: string[];
  blockOnWarning: boolean;
  requireHumanReleaseApproval: boolean;
};

export type WorkspaceState = {
  schemaVersion: 5;
  projects: Project[];
  requirements: Requirement[];
  plans: ExecutionPlan[];
  runs: WorkflowRun[];
  checks: Check[];
  evidence: Evidence[];
  decisions: Decision[];
  releases: ReleaseManifest[];
  artifacts: EngineeringArtifact[];
  activeProjectId: string;
  activeRequirementId?: string;
  activeRunId: string;
  onboardingComplete: boolean;
};

export type ValidationManifestInput = {
  governor_version?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  total_duration_seconds?: number;
  validators?: Array<{
    validator?: string;
    name?: string;
    status?: string;
    duration_seconds?: number;
    command?: string | string[];
    errors?: string[];
    warnings?: string[];
    evidence?: Record<string, unknown>;
  }>;
  results?: ValidationManifestInput["validators"];
};
