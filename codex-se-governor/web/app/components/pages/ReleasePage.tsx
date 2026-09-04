import { AlertTriangle, Archive, Check, CheckCircle2, Download, ShieldAlert } from "lucide-react";
import { projectPolicy } from "../../domain/governance";
import type { ReleaseManifest, WorkflowRun, WorkStatus } from "../../domain/model";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { StatusBadge } from "../ui/StatusBadge";
import type { WorkspacePageProps } from "../workspace-types";
import { findingText, text } from "../workspace-types";

function downloadManifest(manifest: ReleaseManifest) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `release-manifest-${manifest.version}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ReleasePage({ language, workspace, project, navigate, onGenerate, onApprove }: WorkspacePageProps & { onGenerate: (run: WorkflowRun) => void; onApprove: (run: WorkflowRun) => void }) {
  const run = workspace.runs.find((item) => item.id === workspace.activeRunId) || workspace.runs.filter((item) => item.projectId === project?.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const manifest = workspace.releases.find((item) => item.runId === run?.id);
  if (!project) return <EmptyState icon={Archive} title={text(language, "先选择项目", "Select a project")} description={text(language, "发布判断必须来自一个项目的运行证据。", "A release decision must come from one project's run evidence.")} actions={<button className="primary-button" onClick={() => navigate("projects")}>{text(language, "查看项目", "View projects")}</button>} />;
  if (!run) return <div><PageHeader eyebrow={project.name} title={text(language, "没有可评估的运行", "No run to evaluate")} description={text(language, "完成需求和计划并开始运行后，才能计算发布准备度。", "Complete requirements and planning and start a run before calculating release readiness.")} /><EmptyState icon={Archive} title={text(language, "先开始工程运行", "Start an engineering run first")} description={text(language, "发布页只汇总当前运行的实际工件、检查和决定。", "Release summarizes only the current run's actual artifacts, checks, and decisions.")} actions={<button className="primary-button" onClick={() => navigate("plan")}>{text(language, "查看计划", "Open plan")}</button>} /></div>;

  const policy = projectPolicy(project);
  const requirement = workspace.requirements.find((item) => item.id === run.requirementId);
  const artifacts = workspace.artifacts.filter((item) => item.requirementId === run.requirementId);
  const checks = workspace.checks.filter((item) => item.runId === run.id);
  const evidence = workspace.evidence.filter((item) => item.runId === run.id);
  const decision = workspace.decisions.find((item) => item.runId === run.id && item.type === "release-approval" && item.decision === "approved");
  const requiredArtifacts = policy.requiredArtifacts || [];
  const confirmedArtifacts = requiredArtifacts.filter((name) => artifacts.some((item) => item.fileName === name && item.status !== "draft")).length;
  const requiredChecks = policy.requiredChecks;
  const passedChecks = requiredChecks.filter((key) => checks.some((item) => item.key === key && item.status === "passed")).length;
  const securityStatus = run.stages.find((item) => item.key === "security")?.status || "not-run";
  const rows: Array<{ label: string; value: string; status: WorkStatus; action: string; target: "requirements" | "evidence" | "checks" | "run" }> = [
    { label: text(language, "需求基线", "Requirement baseline"), value: requirement?.status === "confirmed" ? text(language, "已确认", "Confirmed") : text(language, "未确认", "Not confirmed"), status: requirement?.status === "confirmed" ? "passed" : "failed", action: text(language, "查看需求", "Open requirements"), target: "requirements" },
    { label: text(language, "必需工件", "Required artifacts"), value: `${confirmedArtifacts}/${requiredArtifacts.length}`, status: confirmedArtifacts === requiredArtifacts.length ? "passed" : "pending", action: text(language, "检查工件", "Review artifacts"), target: "evidence" },
    { label: text(language, "强制机器检查", "Mandatory machine checks"), value: `${passedChecks}/${requiredChecks.length}`, status: passedChecks === requiredChecks.length ? "passed" : checks.some((item) => item.status === "failed") ? "failed" : "not-run", action: text(language, "检查结果", "Open checks"), target: "checks" },
    { label: text(language, "安全审查", "Security review"), value: securityStatus === "passed" ? text(language, "通过", "Passed") : text(language, "未完成", "Incomplete"), status: securityStatus, action: text(language, "查看安全阶段", "Open security stage"), target: "run" },
    { label: text(language, "发布负责人决定", "Release owner decision"), value: decision ? text(language, "已批准", "Approved") : text(language, "待批准", "Pending"), status: decision ? "passed" : "pending", action: text(language, "查看运行", "Open run"), target: "run" },
  ];
  const nonApprovalBlockers = (manifest?.blockers || []).filter((item) => item !== "Release owner approval is required.");
  const canApprove = Boolean(manifest && !decision && nonApprovalBlockers.length === 0);

  return <div className="release-workspace">
    <PageHeader eyebrow={`${project.name} / Run #${run.sequence}`} title={text(language, "发布准备度", "Release readiness")} description={text(language, "结论由当前需求、工件、机器检查、安全审查和负责人决定共同计算。", "The decision combines the current requirement, artifacts, machine checks, security review, and owner approval.")} actions={<>{manifest && <button className="secondary-button" onClick={() => downloadManifest(manifest)}><Download />{text(language, "下载清单", "Download manifest")}</button>}<button className="secondary-button" onClick={() => onGenerate(run)}>{manifest ? text(language, "重新计算", "Recalculate") : text(language, "计算发布状态", "Calculate readiness")}</button>{canApprove && <button className="primary-button" onClick={() => onApprove(run)}><Check />{text(language, "批准发布决定", "Approve release decision")}</button>}</>} />

    <section className={`release-decision ${manifest?.status || "unknown"}`}>
      <div className="verdict-icon">{manifest?.status === "ready" ? <CheckCircle2 /> : manifest?.status === "conditional" ? <AlertTriangle /> : <ShieldAlert />}</div>
      <div><span className="section-label">Decision</span><h2>{manifest ? manifest.status.toUpperCase() : text(language, "尚未计算", "NOT CALCULATED")}</h2><p>{!manifest ? text(language, "点击“计算发布状态”读取当前运行的真实记录。", "Calculate readiness to read the current run's actual records.") : manifest.status === "ready" ? text(language, "所有强制条件和负责人批准均已具备。", "All mandatory conditions and owner approval are present.") : manifest.status === "conditional" ? text(language, "存在已知警告，需要明确接受后才能发布。", "Known warnings require explicit acceptance before release.") : text(language, "下方阻断项未解决，当前版本不能发布。", "The blockers below prevent release.")}</p></div>
      <div className="release-evidence-count"><strong>{evidence.length}</strong><span>{text(language, "项证据参与判断", "evidence items used")}</span></div>
    </section>

    <div className="release-layout">
      <section className="release-gates">
        <header><div><span className="section-label">Required gates</span><h2>{text(language, "发布条件", "Release conditions")}</h2></div><span>{policy.name}</span></header>
        <div>{rows.map((row) => <article key={row.label}><div><b>{row.label}</b><small>{row.value}</small></div><StatusBadge status={row.status} /><button className="text-button" onClick={() => navigate(row.target)}>{row.action}</button></article>)}</div>
      </section>
      <section className="release-findings">
        <header><div><span className="section-label">Decision basis</span><h2>{text(language, "阻断与警告", "Blockers and warnings")}</h2></div></header>
        {!manifest ? <p className="muted">{text(language, "计算后将列出每个未满足条件及其来源。", "Calculate readiness to list every unmet condition and its source.")}</p> : <>
          <div className="finding-group"><h3>{text(language, "阻断项", "Blockers")} <span>{manifest.blockers.length}</span></h3>{manifest.blockers.length ? <ul>{manifest.blockers.map((item) => <li key={item}><ShieldAlert /><span>{findingText(language, item)}</span></li>)}</ul> : <p>{text(language, "没有阻断项。", "No blockers.")}</p>}</div>
          <div className="finding-group"><h3>{text(language, "警告", "Warnings")} <span>{manifest.warnings.length}</span></h3>{manifest.warnings.length ? <ul>{manifest.warnings.map((item) => <li key={item}><AlertTriangle /><span>{findingText(language, item)}</span></li>)}</ul> : <p>{text(language, "没有警告。", "No warnings.")}</p>}</div>
          <footer><span>{manifest.checkIds.length} checks</span><span>{manifest.evidenceIds.length} evidence</span><span>{new Date(manifest.generatedAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")}</span></footer>
        </>}
      </section>
    </div>
  </div>;
}
