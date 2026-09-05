import type { WorkspaceState } from "./model";

export function selectedRequirement(workspace: WorkspaceState) {
  const requirements = workspace.requirements.filter((item) => item.projectId === workspace.activeProjectId);
  if (workspace.activeRequirementId) return requirements.find((item) => item.id === workspace.activeRequirementId);
  const run = workspace.runs.find((item) => item.id === workspace.activeRunId && item.projectId === workspace.activeProjectId);
  return requirements.find((item) => item.id === run?.requirementId)
    || [...requirements].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function selectedRun(workspace: WorkspaceState) {
  const requirement = selectedRequirement(workspace);
  if (workspace.activeRequirementId && !requirement) return undefined;
  const runs = workspace.runs.filter((item) => item.projectId === workspace.activeProjectId && (!requirement || item.requirementId === requirement.id));
  return runs.find((item) => item.id === workspace.activeRunId)
    || [...runs].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export function selectRequirementContext(workspace: WorkspaceState, id: string): WorkspaceState {
  const requirement = workspace.requirements.find((item) => item.id === id && item.projectId === workspace.activeProjectId);
  if (!requirement) return workspace;
  const run = workspace.runs.filter((item) => item.requirementId === id && item.projectId === requirement.projectId).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  return { ...workspace, activeRequirementId: id, activeRunId: run?.id || "" };
}
