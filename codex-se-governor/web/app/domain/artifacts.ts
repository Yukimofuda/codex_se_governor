import { projectChoiceEffects, requiredProjectArtifacts, requiredProjectChecks } from "./course-policy";
import { createTraceableTaskArtifacts, traceableProjectContextArtifact } from "../lib/governance.mjs";
import type { EngineeringArtifact, ExecutionPlan, Project, Requirement, WorkflowStage } from "./model";

const stageByFile: Record<string, WorkflowStage["key"]> = {
  "PROJECT_CONTEXT.md": "context",
  "REQUIREMENTS.md": "requirements",
  "USER_STORY.md": "user-story",
  "ANALYSIS.md": "analysis",
  "DESIGN.md": "design",
  "ADR.md": "design",
  "RISK_REGISTER.md": "risk-quality",
  "QUALITY_ATTRIBUTE_SCENARIOS.md": "risk-quality",
  "PROCESS_COMPLIANCE_REPORT.md": "planning",
  "AI_USAGE_REVIEW.md": "implementation",
  "TEST_PLAN.md": "testing",
  "TEST_CASE_MATRIX.md": "testing",
  "SECURITY_REVIEW.md": "security",
  "DEPLOYMENT_PLAN.md": "documentation",
  "MAINTENANCE_TASK.md": "documentation",
  "RETROSPECTIVE.md": "retrospective",
  "FINAL_REPORT.md": "documentation",
};

function taskType(kind: Requirement["kind"]): string {
  return {
    feature: "Feature",
    "bug-fix": "Bug Fix",
    refactor: "Refactor",
    architecture: "Architecture Change",
    security: "Security Review",
    deployment: "Deployment",
    maintenance: "Maintenance",
  }[kind];
}

function projectInput(project: Project) {
  const effects = projectChoiceEffects(project);
  return {
    name: project.name,
    stack: project.stack.join(", "),
    softwareType: project.softwareType,
    environment: project.environment,
    stage: project.lifecycleStage,
    teamSize: project.teamSize,
    process: project.processModel,
    release: project.releaseStrategy,
    aiAssisted: project.aiAssisted,
    security: project.qualityProfile?.security,
    privacy: project.qualityProfile?.privacy,
    performance: project.qualityProfile?.performance,
    reliability: project.qualityProfile?.reliability,
    compliance: project.qualityProfile?.compliance.join(", "),
    qualityControls: effects.flatMap((effect) => effect.controls.map((item) => item.en)),
    releaseBlocks: effects.flatMap((effect) => effect.releaseBlocks.map((item) => item.en)),
    requiredChecks: requiredProjectChecks(project),
    requiredArtifacts: requiredProjectArtifacts(project),
  };
}

function taskInput(requirement: Requirement) {
  return {
    id: requirement.id,
    type: taskType(requirement.kind),
    title: requirement.title,
    problem: requirement.userProblem,
    goal: requirement.goal,
    acceptance: requirement.acceptanceCriteria.join("; "),
    stakeholders: requirement.stakeholders,
    userStory: requirement.userStory,
    functional: requirement.functional,
    nonFunctional: requirement.nonFunctional,
    acceptanceDetails: requirement.acceptanceDetails,
    qualityScenarios: requirement.qualityScenarios,
    assumptions: requirement.assumptions,
    conflicts: requirement.conflicts,
    securityRequirements: requirement.security,
    performanceRequirements: requirement.performance,
    outOfScope: requirement.outOfScope,
    additionalContext: requirement.additionalContext,
    constraints: requirement.constraints.join("; "),
    risk: requirement.qualityScenarios?.map((item) => item.title).join("; ") || "Confirm project-specific risk before implementation.",
    rollback: "Restore the previous implementation and validation evidence if accepted criteria regress.",
  };
}

export function buildArtifactDrafts(project: Project, requirement: Requirement, timestamp = new Date().toISOString()): EngineeringArtifact[] {
  const files = {
    "PROJECT_CONTEXT.md": traceableProjectContextArtifact(projectInput(project)),
    ...createTraceableTaskArtifacts(projectInput(project), taskInput(requirement)),
  } as Record<string, string>;
  return Object.entries(files).map(([fileName, content], index) => ({
    id: `${requirement.id}-artifact-${index + 1}`,
    projectId: project.id,
    requirementId: requirement.id,
    stageKey: stageByFile[fileName] || "documentation",
    fileName,
    title: fileName.replace(/\.md$/i, "").replaceAll("_", " "),
    status: fileName === "REQUIREMENTS.md" ? "confirmed" : "draft",
    source: "template",
    content,
    updatedAt: timestamp,
  }));
}

export function compileCodexExecutionBrief(project: Project, requirement: Requirement, plan: ExecutionPlan): string {
  const quality = project.qualityProfile;
  const phases = plan.phases.map((phase, index) => {
    const task = phase.tasks[0];
    return `${index + 1}. ${phase.name}\n   Output: ${task?.expectedOutput || "Required stage evidence"}\n   Check: ${task?.check || "Owner review"}\n   Risk: ${task?.risk || "Confirm before execution"}`;
  }).join("\n");
  return `Use the software-engineering-governor skill.

Project: ${project.name}
Repository branch: ${project.branch}
Software type: ${project.softwareType}
Process model: ${project.processModel || "agile"}
Governance policy: ${project.policyProfile}
Security profile: ${quality?.security || "account-data"}
Privacy profile: ${quality?.privacy || "personal-data"}
Reliability profile: ${quality?.reliability || "business-critical"}
Performance profile: ${quality?.performance || "baseline-first"}

Confirmed requirement
ID: ${requirement.id}
Title: ${requirement.title}
Goal: ${requirement.goal}
User problem: ${requirement.userProblem}
Functional requirements:
${requirement.functional.map((item) => `- ${item}`).join("\n")}
Acceptance criteria:
${requirement.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}
Constraints:
${requirement.constraints.map((item) => `- ${item}`).join("\n") || "- None confirmed"}

Approved lifecycle
${phases}

Execution rules
- Read AGENTS.md, the relevant source, and tests before editing.
- Treat generated artifacts as drafts until reviewed.
- Make the smallest reversible implementation.
- Do not add a dependency or change architecture without an explicit decision.
- Run requirement-linked normal, boundary, failure, security, and regression tests.
- Preserve raw commands and results as evidence.
- Stop on a failed mandatory check; never convert unknown or not-run into pass.
- Return the Final Engineering Report required by AGENTS.md.
`;
}
