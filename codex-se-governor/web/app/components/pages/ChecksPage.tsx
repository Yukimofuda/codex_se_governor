"use client";

import { CheckSquare2, FileJson2, FolderSearch2, Info, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { checkRepositoryPaths } from "../../lib/governance.mjs";
import { fetchPublicGithubTree } from "../../lib/repository";
import { inspectZip } from "../../lib/zip.mjs";
import type { ValidationManifestInput, WorkflowRun } from "../../domain/model";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { ActorBadge, StatusBadge } from "../ui/StatusBadge";
import type { WorkspacePageProps } from "../workspace-types";
import { recordText, text } from "../workspace-types";

type AdoptionPreview = { score: number; missing: string[]; passed: string[]; source: string; archiveIssues?: string[] };

export function ChecksPage({ language, workspace, project, navigate, onImportManifest, onSaveAdoption }: WorkspacePageProps & {
  onImportManifest: (run: WorkflowRun, input: ValidationManifestInput) => void;
  onSaveAdoption: (run: WorkflowRun, preview: AdoptionPreview) => void;
}) {
  const runs = workspace.runs.filter((item) => item.projectId === project?.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const run = runs.find((item) => item.id === workspace.activeRunId) || runs[0];
  const checks = useMemo(() => workspace.checks.filter((item) => item.runId === run?.id), [workspace.checks, run?.id]);
  const [selectedId, setSelectedId] = useState(checks[0]?.id || "");
  const selected = checks.find((item) => item.id === selectedId) || checks[0];
  const [mode, setMode] = useState<"results" | "repository">("results");
  const [repositoryMode, setRepositoryMode] = useState<"zip" | "github" | "paths">("zip");
  const [github, setGithub] = useState("");
  const [paths, setPaths] = useState("");
  const [preview, setPreview] = useState<AdoptionPreview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const importManifestFile = async (file?: File) => {
    if (!file || !run) return;
    setError("");
    try { onImportManifest(run, JSON.parse(await file.text()) as ValidationManifestInput); }
    catch (cause) { setError(cause instanceof Error ? cause.message : text(language, "无法读取验证清单。", "Could not read the validation manifest.")); }
  };
  const inspectArchive = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      const result = inspectZip(new Uint8Array(await file.arrayBuffer()));
      const adoption = checkRepositoryPaths(result.entries.map((entry: { path: string }) => entry.path));
      setPreview({ ...adoption, source: file.name, archiveIssues: result.issues });
    } catch (cause) { setError(cause instanceof Error ? cause.message : text(language, "无法检查压缩包。", "Could not inspect the archive.")); }
  };
  const inspectGithub = async () => {
    setBusy(true); setError("");
    try { const result = await fetchPublicGithubTree(github); setPreview({ ...checkRepositoryPaths(result.paths), source: `${result.owner}/${result.repo}@${result.branch}` }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : text(language, "无法读取公开仓库。", "Could not read the public repository.")); }
    finally { setBusy(false); }
  };
  const inspectPaths = () => {
    const values = paths.split(/\r?\n/).map((item) => item.trim().replace(/^\.\//, "")).filter(Boolean);
    if (!values.length) { setError(text(language, "请粘贴至少一个文件路径。", "Paste at least one file path.")); return; }
    setPreview({ ...checkRepositoryPaths(values), source: text(language, "粘贴的文件清单", "Pasted file list") });
  };

  if (!project) return <EmptyState icon={CheckSquare2} title={text(language, "先选择一个项目", "Select a project first")} description={text(language, "检查结果必须关联到项目和运行。", "Checks must be associated with a project and run.")} actions={<button className="primary-button" onClick={() => navigate("projects")}>{text(language, "查看项目", "View projects")}</button>} />;
  return <div>
    <PageHeader eyebrow={`${project.name} · ${text(language, "检查", "Checks")}`} title={text(language, "检查结果", "Checks")} description={text(language, "机器检查、AI 审查和人工决定使用不同标记，避免把判断来源混在一起。", "Machine checks, AI reviews, and human decisions use distinct labels so their sources remain clear.")} actions={<div className="segmented-control" role="group" aria-label={text(language, "检查视图", "Check views")}><button aria-pressed={mode === "results"} className={mode === "results" ? "active" : ""} onClick={() => setMode("results")}>{text(language, "运行结果", "Run results")}</button><button aria-pressed={mode === "repository"} className={mode === "repository" ? "active" : ""} onClick={() => setMode("repository")}>{text(language, "仓库接入检查", "Repository adoption")}</button></div>} />
    {mode === "results" ? <>
      {!run ? <EmptyState icon={CheckSquare2} title={text(language, "还没有运行", "No run yet")} description={text(language, "开始工作流后，可以在这里导入或查看检查结果。", "Start a run to import and inspect validation results.")} actions={<button className="primary-button" onClick={() => navigate("plan")}>{text(language, "前往计划", "Open plan")}</button>} /> : <div className="checks-layout">
        <section className="workspace-panel checks-list">
          <div className="panel-heading"><div><p className="section-label">Run #{run.sequence}</p><h2>{text(language, "检查", "Checks")}</h2></div><span>{checks.length}</span></div>
          {checks.length ? <ul>{checks.map((check) => <li key={check.id}><button className={selected?.id === check.id ? "selected" : ""} aria-pressed={selected?.id === check.id} onClick={() => setSelectedId(check.id)}><span><b>{recordText(language, check.label)}</b><small>{check.category}</small></span><StatusBadge status={check.status} language={language} /></button></li>)}</ul> : <div className="inline-empty"><Info /><span>{text(language, "此运行还没有检查结果。", "This run has no check results yet.")}</span></div>}
          {run.kind !== "recorded-demo" && <label className="file-action"><FileJson2 /><span><b>{text(language, "导入验证清单", "Import validation manifest")}</b><small>validation-results.json</small></span><input type="file" accept="application/json,.json" onChange={(event) => void importManifestFile(event.target.files?.[0])} /></label>}
        </section>
        <section className="workspace-panel check-inspector">
          {selected ? <><div className="panel-heading"><div><p className="section-label">{selected.category}</p><h2>{recordText(language, selected.label)}</h2></div><div className="badge-row"><ActorBadge actor={selected.actor} language={language} /><StatusBadge status={selected.status} language={language} /></div></div><p className="check-summary">{recordText(language, selected.summary)}</p><dl className="check-facts"><div><dt>{text(language, "命令", "Command")}</dt><dd className="mono">{selected.command || text(language, "未提供", "Not provided")}</dd></div><div><dt>{text(language, "耗时", "Duration")}</dt><dd>{selected.durationSeconds == null ? "—" : `${selected.durationSeconds}s`}</dd></div><div><dt>{text(language, "证据数量", "Evidence")}</dt><dd>{selected.evidenceIds.length}</dd></div></dl><div className="log-viewer"><div><span>{text(language, "输出", "Output")}</span><small>{selected.actor === "deterministic" ? text(language, "确定性结果", "Deterministic result") : text(language, "审查记录", "Review record")}</small></div><pre>{selected.output || text(language, "没有原始输出。", "No raw output.")}</pre></div></> : <EmptyState icon={CheckSquare2} title={text(language, "选择一项检查", "Select a check")} description={text(language, "检查详情会显示命令、来源、耗时、结果和证据。", "Check details show command, source, duration, result, and evidence.")} />}
        </section>
      </div>}
      {error && <div className="inline-error" role="alert">{error}</div>}
    </> : <div className="repository-check-layout">
      <section className="workspace-panel repository-input">
        <div className="panel-heading"><div><p className="section-label">Adoption</p><h2>{text(language, "检查治理文件是否接入", "Check governance adoption")}</h2></div><FolderSearch2 /></div>
        <div className="segmented-control wide" role="group" aria-label={text(language, "仓库输入方式", "Repository input method")}><button aria-pressed={repositoryMode === "zip"} className={repositoryMode === "zip" ? "active" : ""} onClick={() => setRepositoryMode("zip")}>ZIP</button><button aria-pressed={repositoryMode === "github"} className={repositoryMode === "github" ? "active" : ""} onClick={() => setRepositoryMode("github")}>GitHub</button><button aria-pressed={repositoryMode === "paths"} className={repositoryMode === "paths" ? "active" : ""} onClick={() => setRepositoryMode("paths")}>{text(language, "文件清单", "File list")}</button></div>
        {repositoryMode === "zip" && <label className="drop-zone"><Upload /><b>{text(language, "选择项目 ZIP", "Choose project ZIP")}</b><span>{text(language, "检查目录结构、必需文件和压缩包污染。", "Check directory structure, required files, and archive hygiene.")}</span><input type="file" accept=".zip,application/zip" onChange={(event) => void inspectArchive(event.target.files?.[0])} /></label>}
        {repositoryMode === "github" && <div className="form-stack"><label><span>{text(language, "公开 GitHub 仓库", "Public GitHub repository")}</span><input value={github} onChange={(event) => setGithub(event.target.value)} placeholder="https://github.com/org/repo" /></label><button className="primary-button" onClick={() => void inspectGithub()} disabled={busy || !github.trim()}>{busy ? text(language, "正在读取…", "Reading…") : text(language, "读取文件清单", "Read file list")}</button></div>}
        {repositoryMode === "paths" && <div className="form-stack"><label><span>{text(language, "每行一个仓库相对路径", "One repository-relative path per line")}</span><textarea rows={12} value={paths} onChange={(event) => setPaths(event.target.value)} placeholder={"AGENTS.md\ndocs/software-engineering/17_REVISION_MASTER_CHECKLIST.md\nscripts/se_gate.py"} /></label><button className="primary-button" onClick={inspectPaths}>{text(language, "检查文件清单", "Check file list")}</button></div>}
        {error && <div className="inline-error" role="alert">{error}</div>}
      </section>
      <section className="workspace-panel repository-result">
        {preview ? <><div className="panel-heading"><div><p className="section-label">{preview.source}</p><h2>{preview.score}% {text(language, "已接入", "adopted")}</h2></div><StatusBadge status={preview.missing.length || preview.archiveIssues?.length ? "warning" : "passed"} language={language} /></div><div className="adoption-meter"><i style={{ width: `${preview.score}%` }} /></div>{preview.archiveIssues?.length ? <div className="result-group"><h3>{text(language, "压缩包问题", "Archive issues")}</h3><ul>{preview.archiveIssues.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}<div className="result-group"><h3>{text(language, "缺少的核心文件", "Missing core files")}</h3>{preview.missing.length ? <ul>{preview.missing.map((item) => <li className="mono" key={item}>{item}</li>)}</ul> : <p>{text(language, "核心治理文件齐全。", "Core governance files are present.")}</p>}</div>{run && <button className="primary-button full" onClick={() => onSaveAdoption(run, preview)}>{text(language, "保存为当前运行的检查证据", "Save as check evidence")}</button>}</> : <EmptyState icon={FolderSearch2} title={text(language, "等待项目文件", "Waiting for project files")} description={text(language, "选择一种输入方式后，这里会列出已找到和缺失的治理文件。", "Choose an input method to see present and missing governance files.")} />}
      </section>
    </div>}
  </div>;
}
