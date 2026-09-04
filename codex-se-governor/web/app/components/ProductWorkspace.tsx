"use client";

import { useEffect, useMemo, useState } from "react";
import { buildArtifactDrafts, compileCodexExecutionBrief } from "../domain/artifacts";
import { defaultQualityProfile, qualityScenariosForProject } from "../domain/course-policy";
import { createPlan, createRun, importValidationManifest, makeId, projectPolicy, releaseReadiness } from "../domain/governance";
import { demoArtifacts, demoChecks, demoEvidence, demoPlan, demoProject, demoRelease, demoRequirement, demoRuns, initialWorkspace } from "../domain/demo";
import type { Decision, EngineeringArtifact, Evidence, ExecutionPlan, Language, PolicyProfile, Project, Requirement, ValidationManifestInput, WorkflowRun, WorkflowStage, WorkspaceState } from "../domain/model";
import { clearWorkspace, loadWorkspace, saveWorkspace } from "../lib/storage";
import { cancelLocalRunnerRun, readLocalRunnerRun, startLocalRunner, type LocalRunnerConfig } from "../lib/local-runner";
import { AppShell } from "./AppShell";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ChecksPage } from "./pages/ChecksPage";
import { EvidencePage } from "./pages/EvidencePage";
import { HistoryPage } from "./pages/HistoryPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PlanPage } from "./pages/PlanPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ReleasePage } from "./pages/ReleasePage";
import { RequirementsPage } from "./pages/RequirementsPage";
import { RunPage } from "./pages/RunPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { ViewId } from "./workspace-types";

type Theme = "system" | "light" | "dark";

const views = new Set<ViewId>(["overview", "projects", "requirements", "plan", "run", "checks", "evidence", "release", "history", "settings"]);

function withCurrentDemo(workspace: WorkspaceState): WorkspaceState {
  return {
    ...workspace,
    projects: [demoProject, ...workspace.projects.filter((item) => item.id !== demoProject.id)],
    requirements: [demoRequirement, ...workspace.requirements.filter((item) => item.projectId !== demoProject.id)],
    plans: [demoPlan, ...workspace.plans.filter((item) => item.projectId !== demoProject.id)],
    runs: [...demoRuns, ...workspace.runs.filter((item) => item.projectId !== demoProject.id)],
    checks: [...demoChecks, ...workspace.checks.filter((item) => !item.id.startsWith("CHK-DEMO"))],
    evidence: [...demoEvidence, ...workspace.evidence.filter((item) => !item.id.startsWith("EVD-DEMO"))],
    releases: [demoRelease, ...workspace.releases.filter((item) => item.runId !== "RUN-DEMO-002")],
    artifacts: [...demoArtifacts, ...(workspace.artifacts || []).filter((item) => item.projectId !== demoProject.id)],
  };
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    source: project.source || (project.repository ? "github-public" : "blank"),
    processModel: project.processModel || "agile",
    lifecycleStage: project.lifecycleStage || "development",
    teamSize: project.teamSize || "small",
    releaseStrategy: project.releaseStrategy || "staged",
    aiAssisted: project.aiAssisted ?? true,
    executionTarget: project.executionTarget || "evidence-import",
    qualityProfile: project.qualityProfile || defaultQualityProfile,
  };
}

function migrateWorkspace(value: unknown): WorkspaceState | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Partial<WorkspaceState> & { schemaVersion?: number };
  if (![4, 5].includes(stored.schemaVersion || 0) || !Array.isArray(stored.projects)) return null;
  return withCurrentDemo({
    ...initialWorkspace(),
    ...stored,
    schemaVersion: 5,
    projects: stored.projects.map(normalizeProject),
    artifacts: Array.isArray(stored.artifacts) ? stored.artifacts : [],
  } as WorkspaceState);
}

function emptyRequirement(project: Project): Requirement {
  return {
    id: makeId("REQ"), projectId: project.id, kind: "feature", title: "", original: "", stakeholders: [], userStory: { role: "", goal: "", benefit: "" }, goal: "", userProblem: "",
    functional: [], nonFunctional: [], constraints: [], acceptanceCriteria: [], security: [], performance: [],
    acceptanceDetails: [], qualityScenarios: qualityScenariosForProject(project), assumptions: [], conflicts: [],
    outOfScope: [], additionalContext: "", status: "draft", source: "user", updatedAt: new Date().toISOString(),
  };
}

export default function ProductWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(initialWorkspace);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ViewId>("overview");
  const [language, setLanguage] = useState<Language>("zh");
  const [theme, setTheme] = useState<Theme>("system");
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [focusedStageId, setFocusedStageId] = useState("");
  const [localRunner, setLocalRunner] = useState<LocalRunnerConfig>({ endpoint: "http://127.0.0.1:4777", token: "" });

  useEffect(() => {
    queueMicrotask(() => {
      const hash = window.location.hash.replace("#", "") as ViewId;
      if (views.has(hash)) setView(hash);
      const storedLanguage = localStorage.getItem("governor-language");
      const storedTheme = localStorage.getItem("governor-theme");
      if (storedLanguage === "zh" || storedLanguage === "en") setLanguage(storedLanguage);
      if (storedTheme === "system" || storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
    });
    loadWorkspace<WorkspaceState>().then((stored) => {
      const migrated = migrateWorkspace(stored);
      if (migrated) setWorkspace(migrated);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    localStorage.setItem("governor-language", language);
    localStorage.setItem("governor-theme", theme);
  }, [theme, language]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => void saveWorkspace(workspace), 180);
    return () => clearTimeout(timer);
  }, [workspace, ready]);

  const project = useMemo(() => workspace.projects.find((item) => item.id === workspace.activeProjectId), [workspace.projects, workspace.activeProjectId]);
  const navigate = (target: ViewId) => {
    setView(target);
    window.history.replaceState(null, "", `#${target}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const flash = (message: string) => { setNotice(message); setTimeout(() => setNotice(""), 3200); };
  const updateWorkspace = (transform: (current: WorkspaceState) => WorkspaceState) => setWorkspace((current) => transform(current));

  const selectProject = (id: string) => {
    const latestRun = workspace.runs.filter((item) => item.projectId === id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
    updateWorkspace((current) => ({ ...current, activeProjectId: id, activeRunId: latestRun?.id || "", onboardingComplete: Boolean(id) }));
    setFocusedStageId(latestRun?.stages.find((stage) => stage.key === latestRun.currentStage)?.id || "");
  };
  const createProject = (draft: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const timestamp = new Date().toISOString();
    const next: Project = normalizeProject({ ...draft, id: makeId("project"), createdAt: timestamp, updatedAt: timestamp });
    updateWorkspace((current) => ({ ...current, projects: [next, ...current.projects], activeProjectId: next.id, activeRunId: "", onboardingComplete: true }));
    setCreateOpen(false); navigate("requirements"); flash(language === "zh" ? "项目已创建" : "Project created");
  };
  const newRequirement = () => {
    if (!project) { setCreateOpen(true); return; }
    const requirement = emptyRequirement(project);
    updateWorkspace((current) => ({ ...current, requirements: [requirement, ...current.requirements] }));
    navigate("requirements");
  };
  const saveRequirement = (requirement: Requirement) => {
    updateWorkspace((current) => {
      const owner = current.projects.find((item) => item.id === requirement.projectId);
      const artifacts = requirement.status === "confirmed" && owner
        ? buildArtifactDrafts(owner, requirement)
        : current.artifacts.filter((item) => item.requirementId === requirement.id);
      return {
        ...current,
        requirements: [requirement, ...current.requirements.filter((item) => item.id !== requirement.id)],
        artifacts: requirement.status === "confirmed"
          ? [...artifacts, ...current.artifacts.filter((item) => item.requirementId !== requirement.id)]
          : current.artifacts,
      };
    });
    flash(requirement.status === "confirmed" ? (language === "zh" ? "需求已确认" : "Requirement confirmed") : (language === "zh" ? "需求已保存" : "Requirement saved"));
  };
  const assistRequirement = async (requirement: Requirement): Promise<Requirement> => {
    const response = await fetch("/api/governance/assist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ operation: "structure-requirement", input: { title: requirement.title, original: requirement.original, project: project?.description } }) });
    const body = await response.json() as { ok?: boolean; error?: string; result?: Partial<Requirement> };
    if (!response.ok || !body.result) throw new Error(body.error || (language === "zh" ? "AI 服务未返回可用结果。" : "The AI provider returned no usable result."));
    const arrays: Array<keyof Pick<Requirement, "functional" | "nonFunctional" | "constraints" | "acceptanceCriteria" | "security" | "performance" | "outOfScope" | "stakeholders" | "assumptions" | "conflicts">> = ["functional", "nonFunctional", "constraints", "acceptanceCriteria", "security", "performance", "outOfScope", "stakeholders", "assumptions", "conflicts"];
    const safe: Partial<Requirement> = {};
    for (const key of arrays) if (Array.isArray(body.result[key])) safe[key] = (body.result[key] as string[]).map(String).slice(0, 20) as never;
    for (const key of ["title", "goal", "userProblem", "additionalContext"] as const) if (typeof body.result[key] === "string") safe[key] = body.result[key]!.slice(0, 5000);
    if (body.result.userStory && typeof body.result.userStory === "object") {
      const story = body.result.userStory as Record<string, unknown>;
      safe.userStory = { role: String(story.role || "").slice(0, 300), goal: String(story.goal || "").slice(0, 600), benefit: String(story.benefit || "").slice(0, 600) };
    }
    if (Array.isArray(safe.acceptanceCriteria)) safe.acceptanceDetails = safe.acceptanceCriteria.map((item, index) => ({ id: `AC-${String(index + 1).padStart(3, "0")}`, kind: index === 0 ? "normal" : index === 1 ? "boundary" : index === 2 ? "failure" : index === 3 ? "security" : "regression", context: "", action: "", expected: String(item).replace(/^AC-\d{3}\s*[:.-]?\s*/i, "") }));
    const updated = { ...requirement, ...safe, source: "ai-assisted" as const, status: "draft" as const, updatedAt: new Date().toISOString() };
    saveRequirement(updated);
    return updated;
  };
  const generatePlan = () => {
    if (!project) return;
    const requirement = workspace.requirements.filter((item) => item.projectId === project.id && item.status === "confirmed").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (!requirement) { navigate("requirements"); return; }
    updateWorkspace((current) => ({ ...current, plans: [createPlan(project, requirement), ...current.plans.filter((item) => item.requirementId !== requirement.id)] }));
  };
  const savePlan = (plan: ExecutionPlan) => {
    updateWorkspace((current) => ({ ...current, plans: current.plans.map((item) => item.id === plan.id ? plan : item) }));
    flash(language === "zh" ? "计划已保存，等待批准" : "Plan saved and ready for approval");
  };
  const approvePlan = (plan: ExecutionPlan) => updateWorkspace((current) => ({ ...current, plans: current.plans.map((item) => item.id === plan.id ? { ...item, status: "approved", updatedAt: new Date().toISOString() } : item) }));
  const startRun = (plan: ExecutionPlan, sequence = 1) => {
    const run = createRun(plan, new Date().toISOString(), sequence);
    run.executionTarget = project?.executionTarget || "evidence-import";
    const requirement = workspace.requirements.find((item) => item.id === run.requirementId);
    const requirementEvidence: Evidence = { id: `${run.id}-requirement`, runId: run.id, type: "requirement", title: "Confirmed requirement snapshot", source: "attested", createdAt: run.startedAt, summary: requirement?.title || "Confirmed requirement", content: JSON.stringify(requirement, null, 2), artifactName: "REQUIREMENT.json" };
    const contextEvidence: Evidence = { id: `${run.id}-context`, runId: run.id, type: "artifact", title: "Confirmed project context", source: "attested", createdAt: run.startedAt, summary: project?.description || "Confirmed project context", content: JSON.stringify(project, null, 2), artifactName: "PROJECT_CONTEXT.json" };
    const planEvidence: Evidence = { id: `${run.id}-plan`, runId: run.id, type: "plan", title: "Approved lifecycle plan", source: "attested", createdAt: run.startedAt, summary: `Approved ${plan.phases.length}-stage plan`, content: JSON.stringify(plan, null, 2), artifactName: "PLAN.json" };
    run.stages = run.stages.map((stage) => stage.key === "context" ? { ...stage, evidenceIds: [contextEvidence.id] } : stage.key === "requirements" ? { ...stage, evidenceIds: [requirementEvidence.id] } : stage);
    updateWorkspace((current) => ({
      ...current,
      runs: [run, ...current.runs],
      evidence: [contextEvidence, requirementEvidence, planEvidence, ...current.evidence],
      artifacts: current.artifacts.map((item) => item.requirementId === run.requirementId ? { ...item, runId: run.id } : item),
      activeRunId: run.id,
    }));
    navigate("run");
  };
  const retryRun = (failedRun: WorkflowRun) => {
    const plan = workspace.plans.find((item) => item.id === failedRun.planId);
    if (!plan) return;
    const sequence = Math.max(0, ...workspace.runs.filter((item) => item.projectId === failedRun.projectId).map((item) => item.sequence)) + 1;
    startRun(plan, sequence);
    flash(language === "zh" ? `已建立修复运行 #${sequence}` : `Correction run #${sequence} created`);
  };
  const selectRun = (run: WorkflowRun) => {
    setFocusedStageId(run.stages.find((stage) => stage.key === run.currentStage)?.id || run.stages[0]?.id || "");
    updateWorkspace((current) => ({ ...current, activeRunId: run.id }));
  };
  const openRunStage = (runId: string, stage: WorkflowStage) => {
    updateWorkspace((current) => ({ ...current, activeRunId: runId }));
    setFocusedStageId(stage.id);
    navigate("run");
  };
  const attestImplementation = (run: WorkflowRun, reference: string) => {
    const timestamp = new Date().toISOString();
    const evidence: Evidence = { id: `${run.id}-implementation-${Date.now()}`, runId: run.id, type: "diff", title: "Implementation reference", source: "attested", createdAt: timestamp, summary: reference, content: `Implementation reference: ${reference}`, artifactName: "IMPLEMENTATION_REFERENCE.txt" };
    const updated: WorkflowRun = { ...run, commit: reference, currentStage: "validation", stages: run.stages.map((stage) => stage.key === "implementation" ? { ...stage, status: "passed", startedAt: stage.startedAt || timestamp, endedAt: timestamp, output: reference, decision: "Implementation submitted for validation", evidenceIds: [...stage.evidenceIds, evidence.id] } : stage) };
    updateWorkspace((current) => ({ ...current, runs: current.runs.map((item) => item.id === run.id ? updated : item), evidence: [evidence, ...current.evidence] }));
  };
  const executeWithLocalCodex = async (run: WorkflowRun) => {
    const owner = workspace.projects.find((item) => item.id === run.projectId);
    const requirement = workspace.requirements.find((item) => item.id === run.requirementId);
    const plan = workspace.plans.find((item) => item.id === run.planId);
    if (!owner || !requirement || !plan) throw new Error(language === "zh" ? "当前运行缺少项目、需求或计划。" : "This run is missing its project, requirement, or plan.");
    if (!localRunner.token.trim()) {
      navigate("settings");
      throw new Error(language === "zh" ? "请先在设置中连接本地 Codex runner。" : "Connect the local Codex runner in Settings first.");
    }
    const started = await startLocalRunner(localRunner, { prompt: compileCodexExecutionBrief(owner, requirement, plan), mode: "implement" });
    const timestamp = new Date().toISOString();
    updateWorkspace((current) => ({ ...current, runs: current.runs.map((item) => item.id !== run.id ? item : {
      ...item,
      status: "running",
      currentStage: "implementation",
      runnerRunId: started.id,
      stages: item.stages.map((stage) => stage.key === "implementation" ? { ...stage, status: "running", startedAt: timestamp, decision: "Codex CLI is executing the approved plan" } : stage),
    }) }));
    let result = started;
    while (result.status === "running") {
      await new Promise((resolve) => setTimeout(resolve, 900));
      result = await readLocalRunnerRun(localRunner, started.id);
    }
    const endedAt = result.endedAt || new Date().toISOString();
    const success = result.status === "passed";
    const evidence: Evidence = {
      id: `${run.id}-local-runner-${Date.now()}`,
      runId: run.id,
      type: "log",
      title: "Local Codex execution log",
      source: "local-runner",
      createdAt: endedAt,
      summary: success ? "Codex CLI completed the approved engineering brief." : `Codex CLI ended with ${result.status}.`,
      content: result.output || result.error || "No runner output was returned.",
      artifactName: "CODEX_EXECUTION.jsonl",
    };
    updateWorkspace((current) => ({
      ...current,
      evidence: [evidence, ...current.evidence],
      runs: current.runs.map((item) => item.id !== run.id ? item : {
        ...item,
        status: success ? "pending" : "failed",
        currentStage: success ? "validation" : "implementation",
        stages: item.stages.map((stage) => stage.key === "implementation" ? {
          ...stage,
          status: success ? "passed" : "failed",
          endedAt,
          output: success ? "Local Codex execution completed" : "Local Codex execution failed",
          decision: success ? "Implementation requires deterministic validation" : "Implementation stopped before validation",
          failureReason: success ? undefined : result.error || `Runner status: ${result.status}`,
          evidenceIds: [...stage.evidenceIds, evidence.id],
        } : stage),
      }),
    }));
    return result;
  };
  const cancelLocalCodex = async (run: WorkflowRun) => {
    if (!run.runnerRunId) return;
    await cancelLocalRunnerRun(localRunner, run.runnerRunId);
    const timestamp = new Date().toISOString();
    updateWorkspace((current) => ({ ...current, runs: current.runs.map((item) => item.id !== run.id ? item : {
      ...item,
      status: "failed",
      stages: item.stages.map((stage) => stage.key === "implementation" ? { ...stage, status: "failed", endedAt: timestamp, decision: "Local execution cancelled by the user", failureReason: "Cancelled by user" } : stage),
    }) }));
  };
  const importManifest = (run: WorkflowRun, input: ValidationManifestInput) => {
    const imported = importValidationManifest(input, run);
    updateWorkspace((current) => ({ ...current, runs: current.runs.map((item) => item.id === run.id ? imported.run : item), checks: [...imported.checks, ...current.checks.filter((item) => item.runId !== run.id || item.actor !== "deterministic")], evidence: [...imported.evidence, ...current.evidence] }));
    flash(language === "zh" ? "验证结果已关联到当前运行" : "Validation results attached to the run");
  };
  const saveArtifact = (artifact: EngineeringArtifact, confirm = false) => {
    const timestamp = new Date().toISOString();
    const next = { ...artifact, status: confirm ? "confirmed" as const : artifact.status, source: confirm ? "human" as const : artifact.source, updatedAt: timestamp };
    updateWorkspace((current) => {
      const run = current.runs
        .filter((item) => item.requirementId === artifact.requirementId && item.projectId === artifact.projectId)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
      if (!confirm || !run) return { ...current, artifacts: current.artifacts.map((item) => item.id === artifact.id ? next : item) };
      const stageArtifacts = current.artifacts.map((item) => item.id === artifact.id ? next : item).filter((item) => item.requirementId === artifact.requirementId && item.stageKey === artifact.stageKey);
      const stageComplete = stageArtifacts.length > 0 && stageArtifacts.every((item) => item.status !== "draft");
      const evidence: Evidence = {
        id: `${run.id}-${artifact.id}-confirmation`,
        runId: run.id,
        type: "artifact",
        title: `${artifact.fileName} owner confirmation`,
        source: "attested",
        createdAt: timestamp,
        summary: `${artifact.fileName} was reviewed and confirmed by the project owner.`,
        content: next.content,
        artifactName: artifact.fileName,
      };
      return {
        ...current,
        artifacts: current.artifacts.map((item) => item.id === artifact.id ? next : item),
        evidence: [evidence, ...current.evidence.filter((item) => item.id !== evidence.id)],
        runs: current.runs.map((item) => item.id !== run.id ? item : {
          ...item,
          currentStage: item.currentStage === artifact.stageKey && stageComplete ? (item.stages[item.stages.findIndex((stage) => stage.key === artifact.stageKey) + 1]?.key || item.currentStage) : item.currentStage,
          stages: item.stages.map((stage) => stage.key === artifact.stageKey && stageComplete ? { ...stage, status: "passed", startedAt: stage.startedAt || timestamp, endedAt: timestamp, output: stageArtifacts.map((entry) => entry.fileName).join(", "), decision: "Required artifacts confirmed by owner", evidenceIds: [...new Set([...stage.evidenceIds, evidence.id])] } : stage),
        }),
      };
    });
    flash(confirm ? (language === "zh" ? "工件已确认并关联到当前运行" : "Artifact confirmed and attached to the run") : (language === "zh" ? "工件草稿已保存" : "Artifact draft saved"));
  };
  const saveAdoption = (run: WorkflowRun, preview: { score: number; missing: string[]; passed: string[]; source: string; archiveIssues?: string[] }) => {
    const stage = run.stages.find((item) => item.key === "validation"); if (!stage) return;
    const evidence: Evidence = { id: `${run.id}-adoption-${Date.now()}`, runId: run.id, type: "validation", title: "Repository adoption report", source: "verified", createdAt: new Date().toISOString(), summary: `${preview.score}% adopted from ${preview.source}`, content: JSON.stringify(preview, null, 2), artifactName: "repository-adoption.json" };
    const check = { id: `${run.id}-adoption-check`, runId: run.id, stageId: stage.id, key: "repository-adoption", label: "Repository adoption", category: "policy" as const, actor: "deterministic" as const, status: (preview.missing.length || preview.archiveIssues?.length ? "warning" : "passed") as "warning" | "passed", summary: preview.missing.length ? `${preview.missing.length} core files missing.` : "Core governance files are present.", output: JSON.stringify(preview, null, 2), evidenceIds: [evidence.id] };
    updateWorkspace((current) => ({ ...current, checks: [check, ...current.checks.filter((item) => item.id !== check.id)], evidence: [evidence, ...current.evidence] }));
    flash(language === "zh" ? "仓库检查已保存" : "Repository check saved");
  };
  const generateRelease = (run: WorkflowRun) => updateWorkspace((current) => {
    const owner = current.projects.find((item) => item.id === run.projectId);
    const policy = owner ? projectPolicy(owner) : projectPolicy(demoProject);
    const manifest = releaseReadiness(run, current.checks, current.evidence, `run-${run.sequence}`, policy, current.decisions, current.artifacts);
    return { ...current, releases: [manifest, ...current.releases.filter((item) => item.runId !== run.id)] };
  });
  const approveRelease = (run: WorkflowRun) => updateWorkspace((current) => {
    const timestamp = new Date().toISOString();
    const owner = current.projects.find((item) => item.id === run.projectId);
    const policy = owner ? projectPolicy(owner) : projectPolicy(demoProject);
    const decision: Decision = { id: `${run.id}-release-approval`, runId: run.id, type: "release-approval", actor: "human", decision: "approved", reason: "Project owner approved the release decision shown in the workspace.", createdAt: timestamp };
    const decisionEvidence: Evidence = { id: `${run.id}-release-decision`, runId: run.id, type: "decision", title: "Release owner decision", source: "attested", createdAt: timestamp, summary: "Release decision approved by the project owner.", content: JSON.stringify(decision, null, 2), artifactName: "RELEASE_DECISION.json" };
    const evidence = [decisionEvidence, ...current.evidence.filter((item) => item.id !== decisionEvidence.id)];
    const decisions = [decision, ...current.decisions.filter((item) => item.id !== decision.id)];
    const manifest = releaseReadiness(run, current.checks, evidence, `run-${run.sequence}`, policy, decisions, current.artifacts);
    const updatedRun: WorkflowRun = { ...run, currentStage: "release", status: manifest.status === "ready" ? "passed" : "warning", endedAt: timestamp, stages: run.stages.map((stage) => stage.key === "release" ? { ...stage, status: manifest.status === "ready" ? "passed" : "warning", startedAt: stage.startedAt || timestamp, endedAt: timestamp, output: manifest.id, decision: manifest.status === "ready" ? "Release approved" : "Release approved with accepted warnings", evidenceIds: [...stage.evidenceIds, decisionEvidence.id] } : stage) };
    return { ...current, runs: current.runs.map((item) => item.id === run.id ? updatedRun : item), decisions, evidence, releases: [manifest, ...current.releases.filter((item) => item.runId !== run.id)] };
  });
  const changePolicy = (target: Project, profile: PolicyProfile) => updateWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === target.id ? { ...item, policyProfile: profile, updatedAt: new Date().toISOString() } : item) }));
  const resetWorkspace = async () => {
    await clearWorkspace();
    setWorkspace(initialWorkspace());
    navigate("overview");
    flash(language === "zh" ? "本地项目数据已清除" : "Local project data cleared");
  };

  const common = { language, workspace, project, navigate };
  let page: React.ReactNode;
  if (view === "projects") page = <ProjectsPage {...common} onCreate={() => setCreateOpen(true)} onSelect={selectProject} />;
  else if (view === "requirements") page = <RequirementsPage key={workspace.requirements.find((item) => item.projectId === project?.id)?.id || project?.id || "none"} {...common} onCreate={newRequirement} onSave={saveRequirement} onAssist={assistRequirement} />;
  else if (view === "plan") page = <PlanPage {...common} onGenerate={generatePlan} onApprove={approvePlan} onSave={savePlan} onStartRun={startRun} />;
  else if (view === "run") page = <RunPage key={`${workspace.activeRunId || project?.id || "none"}:${focusedStageId}`} {...common} initialStageId={focusedStageId} localRunnerConfigured={Boolean(localRunner.token.trim())} onSelectRun={selectRun} onAttestImplementation={attestImplementation} onExecuteCodex={executeWithLocalCodex} onCancelCodex={cancelLocalCodex} onRetry={retryRun} />;
  else if (view === "checks") page = <ChecksPage {...common} onImportManifest={importManifest} onSaveAdoption={saveAdoption} />;
  else if (view === "evidence") page = <EvidencePage {...common} onSaveArtifact={saveArtifact} />;
  else if (view === "release") page = <ReleasePage {...common} onGenerate={generateRelease} onApprove={approveRelease} onOpenStage={openRunStage} />;
  else if (view === "history") page = <HistoryPage {...common} onSelectRun={selectRun} />;
  else if (view === "settings") page = <SettingsPage {...common} localRunner={localRunner} onLocalRunner={setLocalRunner} onPolicyChange={changePolicy} onClearWorkspace={resetWorkspace} theme={theme} onTheme={setTheme} />;
  else page = <OverviewPage {...common} onOpenDemo={() => selectProject(demoProject.id)} onCreateProject={() => setCreateOpen(true)} onSelectRun={(id) => { const run = workspace.runs.find((item) => item.id === id); if (run) selectRun(run); }} onOpenStage={openRunStage} />;

  return <>
    <AppShell view={view} language={language} projects={workspace.projects} activeProjectId={workspace.activeProjectId} onNavigate={navigate} onSelectProject={selectProject} onCreateProject={() => setCreateOpen(true)} onNewRequirement={newRequirement} onLanguage={setLanguage}>
      {!ready ? <div className="app-loading"><span /><p>{language === "zh" ? "正在打开工作区…" : "Opening workspace…"}</p></div> : page}
    </AppShell>
    <CreateProjectDialog open={createOpen} language={language} onOpenChange={setCreateOpen} onCreate={createProject} />
    {notice && <div className="toast" role="status">{notice}</div>}
  </>;
}
