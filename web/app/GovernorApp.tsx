"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { artifactOrder, buildCodexPrompt, checkRepositoryPaths, createTaskArtifacts, evaluateArtifacts, projectContextArtifact } from "./lib/governance.mjs";
import { createZip, inspectZip, zipLimits } from "./lib/zip.mjs";
import { clearProjects, loadProjects, saveProject } from "./lib/storage";

type Language = "zh" | "en";
type Theme = "system" | "dark" | "light";
type View = "dashboard" | "project" | "task" | "artifacts" | "prompt" | "repository" | "validation" | "metrics" | "releases" | "history" | "settings";
type Status = "pass" | "fail" | "warning" | "unknown" | "not-run";

type TaskInput = {
  id: string;
  type: string;
  title: string;
  background: string;
  problem: string;
  goal: string;
  constraints: string;
  acceptance: string;
  risk: string;
  affectedFiles: string;
  rollback: string;
};

type TaskPackage = TaskInput & {
  artifacts: Record<string, string>;
  updatedAt: string;
  revisions: Array<{ at: string; artifact: string; content: string }>;
};

type Project = {
  id: string;
  name: string;
  description: string;
  stack: string;
  softwareType: string;
  environment: string;
  stage: string;
  teamSize: string;
  security: string;
  privacy: string;
  compliance: string;
  performance: string;
  reliability: string;
  release: string;
  process: string;
  aiAssisted: boolean;
  tasks: TaskPackage[];
  activeTaskId: string;
  updatedAt: string;
};

type Finding = { level: "critical" | "warning" | "passed"; title: string; detail: string };

const copy = {
  zh: {
    dashboard: "概览", project: "新建项目", task: "新建任务", artifacts: "工程工件", prompt: "Prompt Builder",
    repository: "仓库检查", validation: "验证结果", metrics: "治理指标", releases: "下载与发布", history: "历史", settings: "设置",
    local: "本地模式", newProject: "创建第一个治理项目", continue: "继续", back: "返回", create: "生成项目", save: "保存",
    export: "导出 ZIP", noProject: "还没有本地项目", loadExample: "载入示例", currentTask: "当前任务", readiness: "发布准备度",
    language: "语言", theme: "主题", clear: "清除本地数据", help: "帮助", docs: "治理准则", projectLabel: "当前项目",
  },
  en: {
    dashboard: "Dashboard", project: "New Project", task: "New Task", artifacts: "Artifacts", prompt: "Prompt Builder",
    repository: "Repository Check", validation: "Validation", metrics: "Metrics", releases: "Downloads", history: "History", settings: "Settings",
    local: "Local mode", newProject: "Create your first governed project", continue: "Continue", back: "Back", create: "Generate project", save: "Save",
    export: "Export ZIP", noProject: "No local project yet", loadExample: "Load example", currentTask: "Current task", readiness: "Release readiness",
    language: "Language", theme: "Theme", clear: "Clear local data", help: "Help", docs: "Governor canon", projectLabel: "Current project",
  },
};

const nav: Array<{ id: View; icon: string }> = [
  { id: "dashboard", icon: "⌂" }, { id: "project", icon: "+" }, { id: "task", icon: "◇" }, { id: "artifacts", icon: "▤" },
  { id: "prompt", icon: "›_" }, { id: "repository", icon: "⌕" }, { id: "validation", icon: "✓" }, { id: "metrics", icon: "⌁" },
  { id: "releases", icon: "⇩" }, { id: "history", icon: "↺" }, { id: "settings", icon: "⚙" },
];

const projectDefaults = {
  name: "", description: "", stack: "TypeScript / React", softwareType: "Web application", environment: "Web", stage: "Planning",
  teamSize: "1-5", security: "Medium", privacy: "Medium", compliance: "None specified", performance: "p95 under 500 ms",
  reliability: "Graceful failure and documented rollback", release: "Staged", process: "Agile", aiAssisted: true,
};

const taskDefaults: TaskInput = {
  id: "TASK-001", type: "Feature", title: "", background: "", problem: "", goal: "", constraints: "Minimal reversible change.",
  acceptance: "The requested behavior is observable and regression evidence passes.", risk: "Incorrect assumptions may cause behavior or security regressions.",
  affectedFiles: "", rollback: "Disable or revert the isolated change and restore the previous behavior.",
};

function now() { return new Date().toISOString(); }
function identifier(prefix: string) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function slug(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "") || "governed-project"; }

function download(name: string, data: BlobPart, type = "text/plain;charset=utf-8") {
  const href = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name.replace(/[\\/:*?"<>|]/g, "-");
  anchor.click();
  URL.revokeObjectURL(href);
}

function statusLabel(status: Status) {
  return status === "not-run" ? "NOT RUN" : status.toUpperCase();
}

function MarkdownPreview({ content }: { content: string }) {
  return <div className="markdown-preview">{content.split("\n").map((line, index) => {
    if (line.startsWith("```")) return <div key={index} className="code-divider" />;
    if (line.startsWith("    ")) return <code key={index}>{line.slice(4) || " "}</code>;
    if (line.startsWith("### ")) return <h3 key={index}>{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={index}>{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={index}>{line.slice(2)}</h1>;
    if (line.startsWith("- [x] ")) return <p key={index}>☑ {line.slice(6)}</p>;
    if (line.startsWith("- [ ] ")) return <p key={index}>☐ {line.slice(6)}</p>;
    if (line.startsWith("- ")) return <p key={index} className="bullet">{line.slice(2)}</p>;
    if (line.startsWith("|")) return <div key={index} className="table-line">{line}</div>;
    if (/^\d+\. /.test(line)) return <p key={index} className="numbered">{line}</p>;
    return <p key={index}>{line || "\u00a0"}</p>;
  })}</div>;
}

function StatusBadge({ status, source }: { status: Status; source?: string }) {
  return <span className={`status status-${status}`} title={source || statusLabel(status)}><i />{statusLabel(status)}</span>;
}

function MetricCard({ label, value, detail, tone = "blue" }: { label: string; value: string | number; detail?: string; tone?: string }) {
  return <article className={`metric-card tone-${tone} reveal`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</article>;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "field field-wide" : "field"}><span>{label}</span>{children}</label>;
}

export default function GovernorApp() {
  const [language, setLanguage] = useState<Language>("zh");
  const [theme, setTheme] = useState<Theme>("system");
  const [view, setView] = useState<View>("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [projectStep, setProjectStep] = useState(1);
  const [projectDraft, setProjectDraft] = useState(projectDefaults);
  const [taskDraft, setTaskDraft] = useState<TaskInput>(taskDefaults);
  const [selectedArtifact, setSelectedArtifact] = useState("REQUIREMENTS.md");
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
  const [notice, setNotice] = useState("");
  const [capabilityStatus, setCapabilityStatus] = useState<Status>("unknown");
  const [repoFindings, setRepoFindings] = useState<Finding[]>([]);
  const [repoName, setRepoName] = useState("");
  const [treeText, setTreeText] = useState("");
  const [promptOptions, setPromptOptions] = useState({ plan: true, tests: true, docs: true, finalReport: true, dependencies: false, architecture: false, minimal: true });
  const fileInput = useRef<HTMLInputElement>(null);
  const t = copy[language];
  const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0];
  const activeTask = activeProject?.tasks.find((task) => task.id === activeProject.activeTaskId) || activeProject?.tasks[0];
  const metrics = useMemo(() => evaluateArtifacts(activeTask?.artifacts || {}), [activeTask]);
  const generatedPrompt = useMemo(() => buildCodexPrompt(activeProject || {}, activeTask || taskDraft, promptOptions), [activeProject, activeTask, taskDraft, promptOptions]);

  useEffect(() => {
    loadProjects<Project>().then((stored) => {
      setProjects(stored.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      if (stored[0]) setActiveProjectId(stored[0].id);
    }).finally(() => setLoaded(true));
    fetch("/api/capabilities").then((response) => response.ok ? response.json() : Promise.reject()).then(() => setCapabilityStatus("pass")).catch(() => setCapabilityStatus("unknown"));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [theme, language]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  async function persist(project: Project) {
    await saveProject(project);
    setProjects((current) => [project, ...current.filter((item) => item.id !== project.id)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setActiveProjectId(project.id);
  }

  function makeTask(input: TaskInput, project: Partial<Project>): TaskPackage {
    return { ...input, id: input.id || identifier("TASK"), artifacts: createTaskArtifacts(project, input), updatedAt: now(), revisions: [] };
  }

  async function createProject(example = false) {
    const data = example ? {
      ...projectDefaults, name: "Northstar Portal", description: "A secure customer operations portal.", security: "High", privacy: "High", process: "Agile",
    } : projectDraft;
    if (!data.name.trim()) { flash(language === "zh" ? "请填写项目名称" : "Project name is required"); return; }
    const baseInput: TaskInput = { ...taskDefaults, id: "FOUNDATION-001", type: "Architecture Change", title: "Project governance foundation", problem: data.description || "The project needs a traceable engineering baseline.", goal: "Establish the project governance lifecycle and evidence baseline.", acceptance: "All selected governance artifacts are generated and reviewable." };
    const foundation = makeTask(baseInput, data);
    foundation.artifacts = { "PROJECT_CONTEXT.md": projectContextArtifact(data), ...foundation.artifacts };
    const project: Project = { ...data, id: identifier("project"), tasks: [foundation], activeTaskId: foundation.id, updatedAt: now() };
    await persist(project);
    setProjectStep(1);
    setProjectDraft(projectDefaults);
    setSelectedArtifact("PROJECT_CONTEXT.md");
    setView("dashboard");
    flash(language === "zh" ? "项目已保存在此浏览器" : "Project saved in this browser");
  }

  async function createTask() {
    if (!activeProject) { setView("project"); return; }
    if (!taskDraft.title.trim() || !taskDraft.goal.trim()) { flash(language === "zh" ? "请填写任务标题和目标" : "Task title and goal are required"); return; }
    const task = makeTask({ ...taskDraft, id: identifier("TASK") }, activeProject);
    const project = { ...activeProject, tasks: [task, ...activeProject.tasks], activeTaskId: task.id, updatedAt: now() };
    await persist(project);
    setTaskDraft(taskDefaults);
    setSelectedArtifact("REQUIREMENTS.md");
    setView("artifacts");
    flash(language === "zh" ? "Task Package 已生成" : "Task package generated");
  }

  async function updateArtifact(content: string) {
    if (!activeProject || !activeTask) return;
    const task = { ...activeTask, artifacts: { ...activeTask.artifacts, [selectedArtifact]: content }, updatedAt: now() };
    const project = { ...activeProject, tasks: activeProject.tasks.map((item) => item.id === task.id ? task : item), updatedAt: now() };
    await persist(project);
  }

  async function checkpointArtifact() {
    if (!activeProject || !activeTask) return;
    const content = activeTask.artifacts[selectedArtifact] || "";
    const task = { ...activeTask, revisions: [{ at: now(), artifact: selectedArtifact, content }, ...activeTask.revisions].slice(0, 20), updatedAt: now() };
    await persist({ ...activeProject, tasks: activeProject.tasks.map((item) => item.id === task.id ? task : item), updatedAt: now() });
    flash(language === "zh" ? "已创建本地版本" : "Local revision created");
  }

  async function restoreRevision(revision: TaskPackage["revisions"][number]) {
    setSelectedArtifact(revision.artifact);
    await updateArtifact(revision.content);
    setView("artifacts");
  }

  function exportTask() {
    if (!activeTask) return;
    download(`${slug(activeTask.title)}.zip`, createZip(activeTask.artifacts), "application/zip");
  }

  function exportProject() {
    if (!activeProject) return;
    const files: Record<string, string> = {
      "governor-project.json": JSON.stringify({ schema: 1, name: activeProject.name, exportedAt: now(), localOnly: true }, null, 2),
    };
    for (const task of activeProject.tasks) for (const [name, content] of Object.entries(task.artifacts)) files[`tasks/${slug(task.title)}/${name}`] = content;
    download(`${slug(activeProject.name)}-governance.zip`, createZip(files), "application/zip");
  }

  function downloadReport() {
    const report = { schema: 1, generatedAt: now(), evidence: "browser-static", project: activeProject?.name || null, task: activeTask?.title || null, metrics };
    download(`${slug(activeProject?.name || "project")}-validation.json`, JSON.stringify(report, null, 2), "application/json");
  }

  async function inspectArchive(file: File) {
    setRepoName(file.name);
    if (file.size > zipLimits.maxArchiveBytes) {
      setRepoFindings([{ level: "critical", title: "Archive limit exceeded", detail: `${file.size} bytes > ${zipLimits.maxArchiveBytes} bytes` }]);
      return;
    }
    try {
      const inspection = inspectZip(await file.arrayBuffer());
      const adoption = checkRepositoryPaths(inspection.entries.map((entry: { path: string }) => entry.path));
      const findings: Finding[] = inspection.issues.map((issue: string) => ({ level: "critical", title: "Archive safety", detail: issue }));
      findings.push(...adoption.missing.map((path: string) => ({ level: "warning" as const, title: "Missing governance artifact", detail: path })));
      findings.push(...adoption.passed.map((path: string) => ({ level: "passed" as const, title: "Adoption evidence", detail: path })));
      if (!findings.length) findings.push({ level: "passed", title: "Archive structure", detail: `${inspection.entries.length} safe UTF-8 entries` });
      setRepoFindings(findings);
    } catch {
      setRepoFindings([{ level: "critical", title: "Invalid ZIP", detail: "The archive could not be parsed safely." }]);
    }
  }

  function inspectTree() {
    const paths = treeText.split(/\r?\n/).map((line) => line.trim().replace(/^[├└│─\s]+/, "")).filter(Boolean);
    const result = checkRepositoryPaths(paths);
    setRepoName("pasted-directory-tree");
    setRepoFindings([
      ...result.missing.map((path: string) => ({ level: "warning" as const, title: "Missing governance artifact", detail: path })),
      ...result.passed.map((path: string) => ({ level: "passed" as const, title: "Adoption evidence", detail: path })),
    ]);
  }

  const validationGroups = [
    ["Context", activeTask?.artifacts["PROJECT_CONTEXT.md"] ? "pass" : activeProject ? "warning" : "unknown"],
    ["Requirements", activeTask?.artifacts["REQUIREMENTS.md"] ? "pass" : "fail"],
    ["Analysis", activeTask?.artifacts["ANALYSIS.md"] ? "pass" : "fail"],
    ["Design", activeTask?.artifacts["DESIGN.md"] && activeTask?.artifacts["ADR.md"] ? "pass" : "fail"],
    ["Implementation", "not-run"], ["Testing", activeTask?.artifacts["TEST_CASE_MATRIX.md"] ? "warning" : "fail"],
    ["Security", metrics.security], ["AI Evidence", metrics.aiEvidence], ["Risk", activeTask?.artifacts["RISK_REGISTER.md"] ? "pass" : "fail"],
    ["Deployment", activeTask?.artifacts["DEPLOYMENT_PLAN.md"] ? "warning" : "fail"], ["Maintenance", activeTask?.artifacts["MAINTENANCE_TASK.md"] ? "warning" : "fail"],
    ["Release", metrics.releaseReadiness],
  ] as Array<[string, Status]>;

  if (!loaded) return <main className="app-loading"><div className="brand-mark">SE</div><span>Loading workspace</span></main>;

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setView("dashboard")} aria-label="Codex SE Governor dashboard"><span className="brand-mark">SE</span><span><b>Codex SE Governor</b><small>Lifecycle Workspace</small></span></button>
      <div className="project-switcher"><span>{t.projectLabel}</span><select value={activeProjectId} onChange={(event) => setActiveProjectId(event.target.value)} aria-label={t.projectLabel}><option value="">{t.noProject}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div>
      <nav className="top-actions" aria-label="Global actions">
        <button className="icon-button" title={t.docs} onClick={() => setView("validation")}>?</button>
        <button className="icon-button" title={t.language} onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>{language === "zh" ? "EN" : "中"}</button>
        <button className="icon-button" title={t.theme} onClick={() => setTheme(theme === "system" ? "dark" : theme === "dark" ? "light" : "system")}>{theme === "system" ? "◐" : theme === "dark" ? "☾" : "☀"}</button>
        <span className="mode-pill"><i />{t.local}</span>
      </nav>
    </header>

    <aside className="sidebar"><nav aria-label="Workspace navigation">{nav.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} title={t[item.id]}><span className="nav-icon">{item.icon}</span><span>{t[item.id]}</span></button>)}</nav><div className="privacy-lock"><span>◎</span><p><b>Local-first</b><small>No repository code execution</small></p></div></aside>

    <main className="workspace">
      {view === "dashboard" && <section className="view dashboard-view">
        {!activeProject ? <div className="onboarding glass-panel reveal"><div className="eyebrow">SOFTWARE ENGINEERING LIFECYCLE</div><h1>{t.newProject}</h1><p>{language === "zh" ? "从项目上下文开始，建立可追踪、可验证、可回滚的工程任务。" : "Start with project context and build traceable, verifiable, reversible engineering work."}</p><div className="button-row"><button className="primary" onClick={() => setView("project")}>{t.newProject}<span>→</span></button><button className="secondary" onClick={() => createProject(true)}>{t.loadExample}</button></div><div className="onboarding-flow"><span>Context</span><i>→</i><span>Requirements</span><i>→</i><span>Evidence</span><i>→</i><span>Release</span></div></div> : <>
          <div className="view-heading reveal"><div><div className="eyebrow">{activeProject.stage} · {activeProject.process}</div><h1>{activeProject.name}</h1><p>{activeProject.description || "Governed engineering workspace"}</p></div><div className="button-row"><button className="secondary" onClick={() => setView("task")}>+ {t.task}</button><button className="primary" onClick={exportProject}>{t.export}<span>⇩</span></button></div></div>
          <div className="metric-grid"><MetricCard label="Artifact completion" value={`${metrics.artifactCompletion}%`} detail={`${artifactOrder.length - metrics.missing.length}/${artifactOrder.length} required`} tone="purple"/><MetricCard label="Requirements" value={metrics.requirements} detail={`${metrics.acceptance} acceptance criteria`} tone="blue"/><MetricCard label="Test traceability" value={`${metrics.traceability}%`} detail={`${metrics.tests} test IDs`} tone="gold"/><MetricCard label="Open risks" value={metrics.risks} detail="Review before release" tone="red"/></div>
          <div className="dashboard-grid"><article className="glass-panel task-focus reveal"><div className="panel-title"><span>{t.currentTask}</span><StatusBadge status={metrics.releaseReadiness as Status}/></div><h2>{activeTask?.title}</h2><p>{activeTask?.goal}</p><div className="lifecycle-track">{validationGroups.slice(0, 6).map(([label, status]) => <div key={label}><span className={`dot dot-${status}`} /><small>{label}</small></div>)}</div><div className="button-row"><button className="primary" onClick={() => setView("artifacts")}>{language === "zh" ? "继续编辑" : "Continue editing"}<span>→</span></button><button className="secondary" onClick={() => setView("prompt")}>Prompt</button></div></article>
          <article className="glass-panel readiness-panel reveal"><div className="panel-title"><span>{t.readiness}</span><span>{metrics.artifactCompletion}%</span></div><div className="ring" style={{ "--progress": `${metrics.artifactCompletion * 3.6}deg` } as React.CSSProperties}><strong>{metrics.releaseReadiness === "fail" ? "BLOCKED" : "REVIEW"}</strong><small>browser static</small></div><ul><li><StatusBadge status={metrics.security as Status}/><span>Security review</span></li><li><StatusBadge status={metrics.aiEvidence as Status}/><span>AI evidence</span></li><li><StatusBadge status={capabilityStatus}/><span>Sites API</span></li></ul></article></div>
        </>}
      </section>}

      {view === "project" && <section className="view"><div className="view-heading"><div><div className="eyebrow">PROJECT CONTEXT · {projectStep}/5</div><h1>{t.project}</h1></div><div className="step-indicator">{[1,2,3,4,5].map((step) => <span key={step} className={projectStep >= step ? "active" : ""}>{step}</span>)}</div></div><div className="wizard glass-panel reveal">
        {projectStep === 1 && <div className="form-grid"><Field label={language === "zh" ? "项目名称" : "Project name"} wide><input value={projectDraft.name} onChange={(e) => setProjectDraft({...projectDraft, name:e.target.value})} placeholder="Northstar Portal" /></Field><Field label={language === "zh" ? "项目简介" : "Description"} wide><textarea value={projectDraft.description} onChange={(e) => setProjectDraft({...projectDraft, description:e.target.value})} /></Field><Field label={language === "zh" ? "技术栈" : "Technology stack"}><input value={projectDraft.stack} onChange={(e) => setProjectDraft({...projectDraft, stack:e.target.value})}/></Field><Field label={language === "zh" ? "软件类型" : "Software type"}><select value={projectDraft.softwareType} onChange={(e) => setProjectDraft({...projectDraft, softwareType:e.target.value})}>{["Web application","Mobile application","Desktop software","Server software","Cloud software","Embedded software","AI / Agent","Library / CLI"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label={language === "zh" ? "项目阶段" : "Stage"}><select value={projectDraft.stage} onChange={(e) => setProjectDraft({...projectDraft, stage:e.target.value})}>{["Planning","Discovery","Development","Production","Maintenance"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label={language === "zh" ? "团队规模" : "Team size"}><select value={projectDraft.teamSize} onChange={(e) => setProjectDraft({...projectDraft, teamSize:e.target.value})}>{["1","1-5","6-15","16-50","50+"].map(x=><option key={x}>{x}</option>)}</select></Field></div>}
        {projectStep === 2 && <div className="selection-grid">{["Web","Mobile","Desktop","Server","Cloud","Embedded","AI / Agent","Data Science","Library","CLI"].map((item) => <button key={item} className={projectDraft.environment === item ? "selection active" : "selection"} onClick={() => setProjectDraft({...projectDraft, environment:item})}><span>{item.slice(0,2).toUpperCase()}</span><b>{item}</b></button>)}</div>}
        {projectStep === 3 && <div className="form-grid"><Field label="Security"><select value={projectDraft.security} onChange={(e)=>setProjectDraft({...projectDraft,security:e.target.value})}>{["Low","Medium","High","Critical"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Privacy"><select value={projectDraft.privacy} onChange={(e)=>setProjectDraft({...projectDraft,privacy:e.target.value})}>{["Low","Medium","High","Regulated"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Compliance" wide><input value={projectDraft.compliance} onChange={(e)=>setProjectDraft({...projectDraft,compliance:e.target.value})}/></Field><Field label="Performance"><input value={projectDraft.performance} onChange={(e)=>setProjectDraft({...projectDraft,performance:e.target.value})}/></Field><Field label="Reliability"><input value={projectDraft.reliability} onChange={(e)=>setProjectDraft({...projectDraft,reliability:e.target.value})}/></Field><Field label="Release"><select value={projectDraft.release} onChange={(e)=>setProjectDraft({...projectDraft,release:e.target.value})}>{["Staged","Continuous","Scheduled","Manual"].map(x=><option key={x}>{x}</option>)}</select></Field></div>}
        {projectStep === 4 && <div className="selection-grid process-grid">{["Agile","Waterfall","Spiral","V Model","Custom","System recommended"].map((item) => <button key={item} className={projectDraft.process === item ? "selection active" : "selection"} onClick={() => setProjectDraft({...projectDraft, process:item})}><span>↻</span><b>{item}</b><small>{item === "Agile" ? "Iterative feedback" : item === "Waterfall" ? "Stable requirements" : "Risk-based process"}</small></button>)}<label className="toggle-card"><input type="checkbox" checked={projectDraft.aiAssisted} onChange={(e)=>setProjectDraft({...projectDraft,aiAssisted:e.target.checked})}/><span/><b>AI-assisted development</b></label></div>}
        {projectStep === 5 && <div className="generation-review"><div className="review-summary"><span className="brand-mark">SE</span><div><h2>{projectDraft.name || "Untitled Project"}</h2><p>{projectDraft.softwareType} · {projectDraft.process} · {projectDraft.security} security</p></div></div><div className="artifact-manifest">{["Project context","Requirements","Analysis & design","Test evidence","Risk & security","Deployment & maintenance","Codex Skill prompt","Validation report"].map((item)=><div key={item}><span>✓</span>{item}</div>)}</div><div className="boundary-note"><b>Execution boundary</b><p>Static generation and inspection only. Uploaded code is never executed.</p></div></div>}
        <div className="wizard-actions"><button className="secondary" disabled={projectStep===1} onClick={()=>setProjectStep(Math.max(1,projectStep-1))}>{t.back}</button>{projectStep<5?<button className="primary" onClick={()=>setProjectStep(projectStep+1)}>{t.continue}<span>→</span></button>:<button className="primary" onClick={()=>createProject(false)}>{t.create}<span>✦</span></button>}</div>
      </div></section>}

      {view === "task" && <section className="view"><div className="view-heading"><div><div className="eyebrow">TASK PACKAGE</div><h1>{t.task}</h1><p>{activeProject?.name || t.noProject}</p></div></div><div className="task-builder glass-panel"><div className="task-types">{["Feature","Bug Fix","Refactor","Architecture Change","Security Review","Deployment","Maintenance"].map(type=><button key={type} onClick={()=>setTaskDraft({...taskDraft,type})} className={taskDraft.type===type?"active":""}><span>{type.slice(0,2).toUpperCase()}</span>{type}</button>)}</div><div className="form-grid"><Field label={language === "zh" ? "标题" : "Title"} wide><input value={taskDraft.title} onChange={e=>setTaskDraft({...taskDraft,title:e.target.value})}/></Field><Field label={language === "zh" ? "背景" : "Background"} wide><textarea value={taskDraft.background} onChange={e=>setTaskDraft({...taskDraft,background:e.target.value})}/></Field><Field label={language === "zh" ? "问题" : "Problem"}><textarea value={taskDraft.problem} onChange={e=>setTaskDraft({...taskDraft,problem:e.target.value})}/></Field><Field label={language === "zh" ? "目标" : "Goal"}><textarea value={taskDraft.goal} onChange={e=>setTaskDraft({...taskDraft,goal:e.target.value})}/></Field><Field label={language === "zh" ? "约束" : "Constraints"}><textarea value={taskDraft.constraints} onChange={e=>setTaskDraft({...taskDraft,constraints:e.target.value})}/></Field><Field label={language === "zh" ? "验收条件" : "Acceptance"}><textarea value={taskDraft.acceptance} onChange={e=>setTaskDraft({...taskDraft,acceptance:e.target.value})}/></Field><Field label={language === "zh" ? "风险" : "Risk"}><textarea value={taskDraft.risk} onChange={e=>setTaskDraft({...taskDraft,risk:e.target.value})}/></Field><Field label={language === "zh" ? "回滚要求" : "Rollback"}><textarea value={taskDraft.rollback} onChange={e=>setTaskDraft({...taskDraft,rollback:e.target.value})}/></Field></div><div className="wizard-actions"><span>{artifactOrder.length} artifacts</span><button className="primary" onClick={createTask}>{language === "zh" ? "生成 Task Package" : "Generate task package"}<span>✦</span></button></div></div></section>}

      {view === "artifacts" && <section className="view artifact-view"><div className="view-heading compact"><div><div className="eyebrow">{activeTask?.type || "TASK"}</div><h1>{activeTask?.title || t.artifacts}</h1></div><div className="button-row"><button className="secondary" onClick={checkpointArtifact}>↺ {language === "zh" ? "创建版本" : "Checkpoint"}</button><button className="primary" onClick={exportTask}>{t.export}<span>⇩</span></button></div></div>{activeTask?<div className="editor-shell"><aside className="file-list">{Object.keys(activeTask.artifacts).map(name=><button key={name} onClick={()=>setSelectedArtifact(name)} className={selectedArtifact===name?"active":""}><span>{name.endsWith(".md")?"M↓":"{}"}</span><b>{name}</b><i className={/TODO|TBD/i.test(activeTask.artifacts[name])?"warn":"ok"}/></button>)}</aside><div className="editor-panel"><div className="editor-toolbar"><div className="segmented"><button className={editorMode==="edit"?"active":""} onClick={()=>setEditorMode("edit")}>Edit</button><button className={editorMode==="preview"?"active":""} onClick={()=>setEditorMode("preview")}>Preview</button></div><span>{(activeTask.artifacts[selectedArtifact] || "").split("\n").length} lines</span><button className="icon-button" title="Download artifact" onClick={()=>download(selectedArtifact,activeTask.artifacts[selectedArtifact]||"")}>⇩</button></div>{editorMode==="edit"?<textarea className="artifact-editor" value={activeTask.artifacts[selectedArtifact]||""} onChange={e=>updateArtifact(e.target.value)} spellCheck={false}/>:<MarkdownPreview content={activeTask.artifacts[selectedArtifact]||""}/>}</div></div>:<EmptyState action={()=>setView("task")} label={t.task}/>}</section>}

      {view === "prompt" && <section className="view"><div className="view-heading"><div><div className="eyebrow">SOFTWARE-ENGINEERING-GOVERNOR</div><h1>{t.prompt}</h1></div><div className="button-row"><button className="secondary" onClick={()=>navigator.clipboard.writeText(generatedPrompt).then(()=>flash(language==="zh"?"已复制":"Copied"))}>Copy</button><button className="primary" onClick={()=>download(`${slug(activeTask?.title||"codex-task")}-prompt.md`,generatedPrompt)}>Markdown<span>⇩</span></button></div></div><div className="prompt-grid"><div className="glass-panel prompt-options"><h2>Execution policy</h2>{Object.entries({plan:"Engineering Plan",tests:"Run tests",docs:"Update docs",finalReport:"Final report",minimal:"Minimal change",dependencies:"Allow dependencies",architecture:"Allow architecture change"}).map(([key,label])=><label className="switch-row" key={key}><span>{label}</span><input type="checkbox" checked={promptOptions[key as keyof typeof promptOptions]} onChange={e=>setPromptOptions({...promptOptions,[key]:e.target.checked})}/><i/></label>)}</div><pre className="prompt-output">{generatedPrompt}</pre></div></section>}

      {view === "repository" && <section className="view"><div className="view-heading"><div><div className="eyebrow">STATIC INSPECTION · NO EXECUTION</div><h1>{t.repository}</h1><p>{repoName || `${zipLimits.maxArchiveBytes/1024/1024} MB · ${zipLimits.maxFiles} files`}</p></div>{repoFindings.length>0&&<button className="secondary" onClick={downloadReport}>{language==="zh"?"下载报告":"Download report"}</button>}</div><div className="repository-grid"><div className="glass-panel upload-panel" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const file=e.dataTransfer.files[0];if(file)inspectArchive(file)}}><input ref={fileInput} type="file" accept=".zip,application/zip" hidden onChange={e=>e.target.files?.[0]&&inspectArchive(e.target.files[0])}/><button className="upload-target" onClick={()=>fileInput.current?.click()}><span>⇧</span><b>{language==="zh"?"拖入或选择 ZIP":"Drop or choose ZIP"}</b><small>UTF-8 · path · adoption · release hygiene</small></button><div className="tree-input"><textarea value={treeText} onChange={e=>setTreeText(e.target.value)} placeholder={"AGENTS.md\ndocs/software-engineering/17_REVISION_MASTER_CHECKLIST.md\ntemplates/REQUIREMENTS_TEMPLATE.md"}/><button className="secondary" onClick={inspectTree}>{language==="zh"?"检查目录树":"Check tree"}</button></div></div><div className="glass-panel findings-panel"><div className="finding-summary"><div><strong>{repoFindings.filter(f=>f.level==="critical").length}</strong><span>Critical</span></div><div><strong>{repoFindings.filter(f=>f.level==="warning").length}</strong><span>Warning</span></div><div><strong>{repoFindings.filter(f=>f.level==="passed").length}</strong><span>Passed</span></div></div><div className="finding-list">{repoFindings.length?repoFindings.map((finding,index)=><article key={`${finding.detail}-${index}`} className={`finding ${finding.level}`}><span>{finding.level==="passed"?"✓":finding.level==="warning"?"!":"×"}</span><div><b>{finding.title}</b><p>{finding.detail}</p></div></article>):<div className="empty-findings"><span>⌕</span><p>{language==="zh"?"等待静态检查":"Awaiting static inspection"}</p></div>}</div></div></div></section>}

      {view === "validation" && <section className="view"><div className="view-heading"><div><div className="eyebrow">EVIDENCE PROVENANCE</div><h1>{t.validation}</h1><p>{language==="zh"?"状态不会从 UNKNOWN 自动提升为 PASS":"UNKNOWN evidence is never promoted to PASS"}</p></div><button className="secondary" onClick={downloadReport}>JSON ⇩</button></div><div className="validation-grid">{validationGroups.map(([label,status],index)=><article className="glass-panel validation-card reveal" key={label}><span className="validation-index">{String(index+1).padStart(2,"0")}</span><div><h2>{label}</h2><p>{status==="pass"?"Required artifact is present.":status==="warning"?"Evidence exists; execution remains pending.":status==="not-run"?"No trusted execution evidence was supplied.":status==="unknown"?"Evidence is unavailable.":"Required evidence is missing."}</p></div><StatusBadge status={status} source={status==="not-run"?"user code was not executed":"browser-static"}/></article>)}</div><div className="evidence-legend glass-panel"><span><i className="legend-browser"/>Browser static</span><span><i className="legend-server"/>Sites API</span><span><i className="legend-user"/>User attestation</span><span><i className="legend-unknown"/>Unavailable</span></div></section>}

      {view === "metrics" && <section className="view"><div className="view-heading"><div><div className="eyebrow">CURRENT PROJECT · BROWSER STATIC</div><h1>{t.metrics}</h1></div></div><div className="metric-grid"><MetricCard label="Artifact completion" value={`${metrics.artifactCompletion}%`} tone="purple"/><MetricCard label="Requirements" value={metrics.requirements} tone="blue"/><MetricCard label="Acceptance criteria" value={metrics.acceptance} tone="gold"/><MetricCard label="Test cases" value={metrics.tests} tone="blue"/></div><div className="metrics-detail"><article className="glass-panel chart-panel"><div className="panel-title"><span>Lifecycle coverage</span><b>{metrics.traceability}% traced</b></div>{[["Requirements",Math.min(100,metrics.requirements*20)],["Test traceability",metrics.traceability],["Risk coverage",Math.min(100,metrics.risks*25)],["Security review",metrics.security==="pass"?100:0],["AI evidence",metrics.aiEvidence==="pass"?100:0],["Release readiness",metrics.releaseReadiness==="warning"?72:20]].map(([label,value])=><div className="bar-row" key={label}><span>{label}</span><div><i style={{width:`${value}%`}}/></div><b>{value}%</b></div>)}</article><article className="glass-panel score-panel"><div className="score-orbit"><strong>{Math.round((metrics.artifactCompletion+metrics.traceability+(metrics.security==="pass"?100:0))/3)}</strong><span>governance score</span></div><ul><li><span>Missing required files</span><b>{metrics.missing.length}</b></li><li><span>Risk IDs</span><b>{metrics.risks}</b></li><li><span>Evidence source</span><b>Local</b></li></ul></article></div></section>}

      {view === "releases" && <section className="view"><div className="view-heading"><div><div className="eyebrow">UTF-8 SAFE EXPORT</div><h1>{t.releases}</h1></div></div><div className="release-grid"><button className="release-card glass-panel" onClick={exportTask}><span className="release-icon">T</span><div><h2>Task Package</h2><p>{activeTask?.title||t.noProject}</p><small>{Object.keys(activeTask?.artifacts||{}).length} Markdown files</small></div><i>⇩</i></button><button className="release-card glass-panel" onClick={exportProject}><span className="release-icon">G</span><div><h2>Governance Project</h2><p>{activeProject?.name||t.noProject}</p><small>All local task packages</small></div><i>⇩</i></button><button className="release-card glass-panel" onClick={downloadReport}><span className="release-icon">{`{}`}</span><div><h2>Validation Manifest</h2><p>Browser static evidence</p><small>JSON · explicit provenance</small></div><i>⇩</i></button><button className="release-card glass-panel" onClick={()=>download(`${slug(activeTask?.title||"task")}-prompt.md`,generatedPrompt)}><span className="release-icon">›_</span><div><h2>Codex Prompt</h2><p>Governor lifecycle instructions</p><small>Markdown</small></div><i>⇩</i></button></div><div className="glass-panel release-policy"><div><StatusBadge status={activeProject?"pass":"unknown"}/><span>UTF-8 paths</span></div><div><StatusBadge status="pass"/><span>No macOS artifacts</span></div><div><StatusBadge status="pass"/><span>No local absolute paths</span></div><div><StatusBadge status="pass"/><span>Stored ZIP entries</span></div></div></section>}

      {view === "history" && <section className="view"><div className="view-heading"><div><div className="eyebrow">INDEXEDDB · THIS DEVICE</div><h1>{t.history}</h1></div></div>{projects.length?<div className="history-list">{projects.map(project=><article className="glass-panel history-project" key={project.id}><button onClick={()=>{setActiveProjectId(project.id);setView("dashboard")}}><span className="brand-mark">{project.name.slice(0,2).toUpperCase()}</span><div><h2>{project.name}</h2><p>{project.tasks.length} tasks · {new Date(project.updatedAt).toLocaleString()}</p></div></button><div>{project.tasks.slice(0,3).map(task=><span key={task.id}>{task.type}: {task.title}</span>)}</div></article>)}</div>:<EmptyState action={()=>setView("project")} label={t.project}/>} {activeTask?.revisions.length?<div className="revision-list"><h2>Artifact revisions</h2>{activeTask.revisions.map(revision=><button key={`${revision.at}-${revision.artifact}`} onClick={()=>restoreRevision(revision)}><span>↺</span><b>{revision.artifact}</b><small>{new Date(revision.at).toLocaleString()}</small></button>)}</div>:null}</section>}

      {view === "settings" && <section className="view"><div className="view-heading"><div><div className="eyebrow">LOCAL-FIRST CONTROL</div><h1>{t.settings}</h1></div></div><div className="settings-grid"><article className="glass-panel settings-card"><h2>Appearance</h2><Field label={t.language}><select value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="zh">中文</option><option value="en">English</option></select></Field><Field label={t.theme}><select value={theme} onChange={e=>setTheme(e.target.value as Theme)}><option value="system">System</option><option value="dark">Dark</option><option value="light">Light</option></select></Field></article><article className="glass-panel settings-card"><h2>Privacy</h2><ul><li><span>Project storage</span><b>IndexedDB</b></li><li><span>Uploaded ZIP</span><b>Memory only</b></li><li><span>Server upload</span><b>Disabled</b></li><li><span>Code execution</span><b>Disabled</b></li></ul><button className="danger" onClick={()=>clearProjects().then(()=>{setProjects([]);setActiveProjectId("");flash(language==="zh"?"本地数据已清除":"Local data cleared")})}>{t.clear}</button></article><article className="glass-panel settings-card boundary-card"><h2>Capability boundary</h2><StatusBadge status={capabilityStatus}/><p>Sites hosts the interface and a read-only capability endpoint. Repository content remains on this device.</p><div className="legal-links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><div className="version-row"><span>Governor UI</span><b>1.0 MVP</b></div></article></div></section>}
    </main>

    <nav className="mobile-nav" aria-label="Mobile navigation">{nav.slice(0,5).map(item=><button key={item.id} className={view===item.id?"active":""} onClick={()=>setView(item.id)}><span>{item.icon}</span><small>{t[item.id]}</small></button>)}</nav>
    {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
  </div>;
}

function EmptyState({ action, label }: { action: () => void; label: string }) {
  return <div className="empty-state glass-panel"><span className="brand-mark">SE</span><h2>No active package</h2><button className="primary" onClick={action}>{label}<span>→</span></button></div>;
}
