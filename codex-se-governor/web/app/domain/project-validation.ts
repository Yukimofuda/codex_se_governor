import type { Project } from "./model";

export type ProjectDraft = Omit<Project, "id" | "createdAt" | "updatedAt">;

export type ProjectField = "name" | "description" | "stack" | "repository" | "branch" | "localWorkspaceName" | "customRequiredChecks";

export function validateProjectDraft(draft: ProjectDraft, step: 1 | 2 | 3 | 4): ProjectField[] {
  const missing: ProjectField[] = [];
  if (step === 1) {
    if (!draft.name.trim()) missing.push("name");
    if (!draft.description.trim()) missing.push("description");
    if (draft.stack.length === 0) missing.push("stack");
    if (draft.source === "github-public" && !draft.repository) missing.push("repository");
    if (draft.repository && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/i.test(draft.repository)) missing.push("repository");
    if (draft.source === "local-codex" && !draft.localWorkspaceName?.trim()) missing.push("localWorkspaceName");
  }
  if (step === 2) {
    if (!draft.branch.trim()) missing.push("branch");
  }
  if (step === 4 && draft.policyProfile === "custom" && !draft.customRequiredChecks?.length) missing.push("customRequiredChecks");
  return missing;
}
