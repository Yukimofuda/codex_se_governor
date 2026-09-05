import assert from "node:assert/strict";
import test from "node:test";
import { selectedRequirement, selectedRun, selectRequirementContext } from "../app/domain/workspace-context.ts";

function workspace() {
  return {
    activeProjectId: "project-a", activeRunId: "run-a",
    requirements: [
      { id: "req-a", projectId: "project-a", updatedAt: "2026-09-01" },
      { id: "req-b", projectId: "project-a", updatedAt: "2026-09-05" },
      { id: "req-c", projectId: "project-b", updatedAt: "2026-09-06" },
    ],
    runs: [
      { id: "run-a", requirementId: "req-a", projectId: "project-a", startedAt: "2026-09-01" },
      { id: "run-c", requirementId: "req-c", projectId: "project-b", startedAt: "2026-09-06" },
    ],
  };
}

test("legacy workspaces derive requirement context from their selected run", () => {
  assert.equal(selectedRequirement(workspace()).id, "req-a");
  assert.equal(selectedRun(workspace()).id, "run-a");
});

test("a newer draft never inherits another requirement's run", () => {
  const next = selectRequirementContext(workspace(), "req-b");
  assert.equal(next.activeRequirementId, "req-b");
  assert.equal(next.activeRunId, "");
  assert.equal(selectedRun(next), undefined);
  assert.equal(selectedRequirement(next).id, "req-b");
  const prior = selectRequirementContext(next, "req-a");
  assert.equal(selectedRun(prior).id, "run-a");
});

test("context cannot select requirements or stale runs from another project", () => {
  const current = workspace();
  assert.equal(selectRequirementContext(current, "req-c"), current);
  assert.equal(selectedRun({ ...current, activeRequirementId: "req-b", activeRunId: "run-c" }), undefined);
  assert.equal(selectedRequirement({ ...current, activeRequirementId: "req-c" }), undefined);
});

test("missing legacy selection falls back deterministically within the active project", () => {
  const current = { ...workspace(), activeRunId: "", activeRequirementId: "" };
  assert.equal(selectedRequirement(current).id, "req-b");
  assert.equal(selectedRun(current), undefined);
});
