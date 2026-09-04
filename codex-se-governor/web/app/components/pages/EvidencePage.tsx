"use client";

import { Archive, Check, Download, Eye, FilePenLine, FileSearch, PackageOpen, Save } from "lucide-react";
import { useMemo, useState } from "react";
import type { EngineeringArtifact, EvidenceSource } from "../../domain/model";
import { createZip } from "../../lib/zip.mjs";
import { EmptyState } from "../ui/EmptyState";
import { MarkdownPreview } from "../ui/MarkdownPreview";
import { PageHeader } from "../ui/PageHeader";
import { SourceBadge, StatusBadge } from "../ui/StatusBadge";
import type { WorkspacePageProps } from "../workspace-types";
import { recordText, stageText, text } from "../workspace-types";

function safeName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, "-");
}

function downloadBytes(name: string, content: BlobPart, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeName(name);
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function artifactSource(source: EngineeringArtifact["source"]): EvidenceSource {
  if (source === "recorded-demo") return "recorded-demo";
  if (source === "deterministic") return "verified";
  if (source === "human") return "attested";
  if (source === "ai-assisted") return "ai-assisted";
  return "unknown";
}

function ArtifactEditor({ language, artifact, readOnly, onSave }: { language: WorkspacePageProps["language"]; artifact: EngineeringArtifact; readOnly: boolean; onSave: (artifact: EngineeringArtifact, confirm?: boolean) => void }) {
  const [content, setContent] = useState(artifact.content);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const changed = content !== artifact.content;
  const current = { ...artifact, content };
  return <section className="artifact-inspector">
    <header><div><span className="section-label">{stageText(language, { key: artifact.stageKey, label: artifact.stageKey })}</span><h2>{artifact.fileName}</h2><p>{artifact.status === "draft" ? text(language, "系统已根据项目与需求生成草稿，确认前不会计为完成证据。", "This draft comes from project and requirement data and does not count as completed evidence until confirmed.") : text(language, "此版本已作为当前工程流程的确认记录。", "This version is recorded as confirmed evidence for the current workflow.")}</p></div><div className="badge-row"><SourceBadge source={artifactSource(artifact.source)} language={language} /><StatusBadge status={artifact.status === "draft" ? "pending" : "passed"} label={artifact.status === "verified" ? text(language, "已验证", "Verified") : artifact.status === "confirmed" ? text(language, "已确认", "Confirmed") : text(language, "草稿", "Draft")} language={language} /></div></header>
    <div className="artifact-toolbar"><div className="segmented-control"><button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")} disabled={readOnly}><FilePenLine />{text(language, "编辑", "Edit")}</button><button className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}><Eye />{text(language, "预览", "Preview")}</button></div><button className="icon-button" onClick={() => downloadBytes(artifact.fileName, content)} aria-label={text(language, "下载工件", "Download artifact")} title={text(language, "下载工件", "Download artifact")}><Download /></button></div>
    {mode === "edit" && !readOnly ? <textarea className="artifact-editor" value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} aria-label={text(language, "工件 Markdown 内容", "Artifact Markdown content")} /> : <MarkdownPreview content={content} />}
    {!readOnly && <footer><span>{changed ? text(language, "有未保存修改", "Unsaved changes") : artifact.status === "draft" ? text(language, "请检查内容后再确认", "Review before confirming") : text(language, "内容已保存", "Saved")}</span><button className="secondary-button" disabled={!changed || !content.trim()} onClick={() => onSave(current)}><Save />{text(language, "保存草稿", "Save draft")}</button><button className="primary-button" disabled={!content.trim()} onClick={() => onSave(current, true)}><Check />{text(language, "确认并关联到运行", "Confirm for this run")}</button></footer>}
  </section>;
}

export function EvidencePage({ language, workspace, project, navigate, onSaveArtifact }: WorkspacePageProps & { onSaveArtifact: (artifact: EngineeringArtifact, confirm?: boolean) => void }) {
  const [mode, setMode] = useState<"artifacts" | "evidence">("artifacts");
  const run = workspace.runs.find((item) => item.id === workspace.activeRunId) || workspace.runs.filter((item) => item.projectId === project?.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const artifacts = useMemo(() => workspace.artifacts.filter((item) => item.projectId === project?.id).sort((a, b) => a.stageKey.localeCompare(b.stageKey) || a.fileName.localeCompare(b.fileName)), [workspace.artifacts, project?.id]);
  const evidence = useMemo(() => workspace.evidence.filter((item) => item.runId === run?.id), [workspace.evidence, run?.id]);
  const [selectedArtifactId, setSelectedArtifactId] = useState(artifacts[0]?.id || "");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(evidence[0]?.id || "");
  const selectedArtifact = artifacts.find((item) => item.id === selectedArtifactId) || artifacts[0];
  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId) || evidence[0];

  if (!project) return <EmptyState icon={FileSearch} title={text(language, "先选择项目", "Select a project")} description={text(language, "工程工件和运行证据按项目隔离保存。", "Engineering artifacts and run evidence are isolated by project.")} actions={<button className="primary-button" onClick={() => navigate("projects")}>{text(language, "查看项目", "View projects")}</button>} />;
  const exportArtifacts = () => {
    const files = Object.fromEntries(artifacts.map((item) => [item.fileName, item.content]));
    downloadBytes(`${project.name}-engineering-artifacts.zip`, createZip(files), "application/zip");
  };

  return <div className="evidence-workspace">
    <PageHeader eyebrow={project.name} title={text(language, "工件与证据", "Artifacts & evidence")} description={text(language, "工程工件说明计划做什么；运行证据记录实际发生了什么。两者不会混为一谈。", "Artifacts define intended engineering work; run evidence records what actually happened. They remain distinct.")} actions={<><div className="segmented-control" role="group" aria-label={text(language, "工件与证据视图", "Artifact and evidence views")}><button aria-pressed={mode === "artifacts"} className={mode === "artifacts" ? "active" : ""} onClick={() => setMode("artifacts")}>{text(language, "工程工件", "Artifacts")}</button><button aria-pressed={mode === "evidence"} className={mode === "evidence" ? "active" : ""} onClick={() => setMode("evidence")}>{text(language, "运行证据", "Run evidence")}</button></div>{mode === "artifacts" && artifacts.length > 0 && <button className="secondary-button" onClick={exportArtifacts}><PackageOpen />{text(language, "导出工件 ZIP", "Export artifact ZIP")}</button>}</>} />

    {mode === "artifacts" ? (!artifacts.length ? <EmptyState icon={Archive} title={text(language, "还没有工程工件", "No engineering artifacts yet")} description={text(language, "确认需求后，系统会生成与生命周期对应的可编辑工件。", "Confirm a requirement to create editable artifacts mapped to the lifecycle.")} actions={<button className="primary-button" onClick={() => navigate("requirements")}>{text(language, "完成需求", "Complete requirement")}</button>} /> : <div className="artifact-layout">
      <aside className="artifact-list"><header><div><span className="section-label">Artifact set</span><h2>{artifacts.length} {text(language, "份工件", "artifacts")}</h2></div><span>{artifacts.filter((item) => item.status !== "draft").length}/{artifacts.length}</span></header><ul>{artifacts.map((item) => <li key={item.id}><button className={selectedArtifact?.id === item.id ? "active" : ""} aria-pressed={selectedArtifact?.id === item.id} onClick={() => setSelectedArtifactId(item.id)}><span><b>{item.fileName}</b><small>{stageText(language, { key: item.stageKey, label: item.stageKey })}</small></span><StatusBadge status={item.status === "draft" ? "pending" : "passed"} language={language} /></button></li>)}</ul></aside>
      {selectedArtifact && <ArtifactEditor key={`${selectedArtifact.id}-${selectedArtifact.updatedAt}`} language={language} artifact={selectedArtifact} readOnly={Boolean(project.demo)} onSave={onSaveArtifact} />}
    </div>) : (!run || !evidence.length ? <EmptyState icon={FileSearch} title={text(language, "当前运行还没有证据", "No evidence for this run")} description={text(language, "开始运行并完成阶段后，这里会保留输入、输出、检查和决定。", "Start a run and complete stages to retain inputs, outputs, checks, and decisions here.")} actions={<button className="secondary-button" onClick={() => navigate("run")}>{text(language, "查看运行", "Open run")}</button>} /> : <div className="evidence-layout">
      <aside className="evidence-list"><header><div><span className="section-label">Run #{run.sequence}</span><h2>{evidence.length} {text(language, "项证据", "evidence items")}</h2></div></header><ul>{evidence.map((item) => <li key={item.id}><button className={selectedEvidence?.id === item.id ? "active" : ""} aria-pressed={selectedEvidence?.id === item.id} onClick={() => setSelectedEvidenceId(item.id)}><span><b>{recordText(language, item.title)}</b><small>{item.type} · {new Date(item.createdAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")}</small></span><SourceBadge source={item.source} language={language} /></button></li>)}</ul></aside>
      <section className="evidence-inspector">{selectedEvidence && <><header><div><span className="section-label">{selectedEvidence.type}</span><h2>{recordText(language, selectedEvidence.title)}</h2><p>{recordText(language, selectedEvidence.summary)}</p></div><div className="badge-row"><SourceBadge source={selectedEvidence.source} language={language} /><button className="icon-button" onClick={() => downloadBytes(selectedEvidence.artifactName || `${selectedEvidence.id}.txt`, selectedEvidence.content)} aria-label={text(language, "下载证据", "Download evidence")}><Download /></button></div></header><div className="log-viewer evidence-content"><div><span>{selectedEvidence.artifactName || text(language, "原始记录", "Raw record")}</span><small>{text(language, "只读", "Read only")}</small></div><pre>{selectedEvidence.content}</pre></div></>}</section>
    </div>)}
  </div>;
}
