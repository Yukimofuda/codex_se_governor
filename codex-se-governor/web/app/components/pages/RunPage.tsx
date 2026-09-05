"use client";

import { ArrowRight, Check, CheckCircle2, CircleStop, Clock3, FileClock, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { lifecycleBlueprint } from "../../domain/course-policy";
import type { WorkflowRun } from "../../domain/model";
import { selectedRun } from "../../domain/workspace-context";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { ActorBadge, SourceBadge, StatusBadge } from "../ui/StatusBadge";
import type { WorkspacePageProps } from "../workspace-types";
import { recordText, stageText, text } from "../workspace-types";

const artifactStages = new Set(["user-story", "analysis", "design", "risk-quality", "documentation", "retrospective"]);

export function RunPage({ language, workspace, project, navigate, initialStageId, localRunnerConfigured, onSelectRun, onAttestImplementation, onExecuteCodex, onCancelCodex, onRetry }: WorkspacePageProps & {
  initialStageId?: string;
  localRunnerConfigured: boolean;
  onSelectRun: (run: WorkflowRun) => void;
  onAttestImplementation: (run: WorkflowRun, reference: string) => void;
  onExecuteCodex: (run: WorkflowRun) => Promise<unknown>;
  onCancelCodex: (run: WorkflowRun) => Promise<void>;
  onRetry: (run: WorkflowRun) => void;
}) {
  const runs = useMemo(() => workspace.runs.filter((item) => item.projectId === project?.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [workspace.runs, project?.id]);
  const run = selectedRun(workspace);
  const [selectedStageId, setSelectedStageId] = useState(initialStageId || run?.stages.find((stage) => stage.key === run.currentStage)?.id || run?.stages[0]?.id || "");
  const [reference, setReference] = useState("");
  const [executionConfirmed, setExecutionConfirmed] = useState(false);
  const [runnerBusy, setRunnerBusy] = useState(false);
  const [runnerError, setRunnerError] = useState("");

  if (!project) return <EmptyState icon={FileClock} title={text(language, "先选择项目", "Select a project")} description={text(language, "每次运行都属于一个项目和一份已批准计划。", "Every run belongs to a project and an approved plan.")} actions={<button className="primary-button" onClick={() => navigate("projects")}>{text(language, "查看项目", "View projects")}</button>} />;
  if (!run) return <div><PageHeader eyebrow={project.name} title={text(language, "尚未开始运行", "No run yet")} description={text(language, "批准计划后，系统会建立独立的阶段、检查、证据和决定记录。", "Approve a plan to create an independent record of stages, checks, evidence, and decisions.")} /><EmptyState icon={FileClock} title={text(language, "等待已批准计划", "Waiting for an approved plan")} description={text(language, "进入计划页检查每个阶段并开始运行。", "Open Plan, inspect every stage, and start the run.")} actions={<button className="primary-button" onClick={() => navigate("plan")}>{text(language, "查看计划", "Open plan")}</button>} /></div>;

  const stage = run.stages.find((item) => item.id === selectedStageId) || run.stages.find((item) => item.key === run.currentStage) || run.stages[0];
  const definition = lifecycleBlueprint.find((item) => item.key === stage.key);
  const stageChecks = workspace.checks.filter((item) => stage.checkIds.includes(item.id));
  const stageEvidence = workspace.evidence.filter((item) => stage.evidenceIds.includes(item.id));
  const stageArtifacts = workspace.artifacts.filter((item) => item.requirementId === run.requirementId && item.stageKey === stage.key);
  const resolvedRun = run.status === "failed" ? runs.find((item) => item.sequence > run.sequence) : undefined;
  const implementationPending = stage.key === "implementation" && ["pending", "not-run", "failed"].includes(stage.status) && run.kind === "workspace";
  const completed = run.stages.filter((item) => item.status === "passed").length;

  const execute = async () => {
    setRunnerBusy(true); setRunnerError("");
    try { await onExecuteCodex(run); }
    catch (cause) { setRunnerError(cause instanceof Error ? cause.message : text(language, "本地 Codex 运行失败。", "The local Codex run failed.")); }
    finally { setRunnerBusy(false); }
  };

  return <div className="run-workspace">
    <PageHeader eyebrow={`${project.name} / Run #${run.sequence}`} title={text(language, "工程运行", "Engineering run")} description={`${run.commit || text(language, "等待实现引用", "Awaiting implementation reference")} · ${new Date(run.startedAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")}`} actions={<><StatusBadge status={run.status} language={language} />{run.kind === "recorded-demo" && <SourceBadge source="recorded-demo" language={language} />}{run.status === "failed" && run.kind === "workspace" && <button className="primary-button" onClick={() => onRetry(run)}><RotateCcw />{text(language, "建立修复运行", "Create correction run")}</button>}</>} />

    <div className="run-summary-bar">
      <div><span>{text(language, "当前阶段", "Current stage")}</span><strong>{stageText(language, run.stages.find((item) => item.key === run.currentStage) || run.stages[0])}</strong></div>
      <div><span>{text(language, "生命周期", "Lifecycle")}</span><strong>{completed}/{run.stages.length}</strong></div>
      <div><span>{text(language, "检查结果", "Check results")}</span><strong>{workspace.checks.filter((item) => item.runId === run.id).length}</strong></div>
      <div><span>{text(language, "证据记录", "Evidence records")}</span><strong>{workspace.evidence.filter((item) => item.runId === run.id).length}</strong></div>
      <div><span>{text(language, "执行方式", "Execution")}</span><strong>{run.kind === "recorded-demo" ? text(language, "录制示例", "Recorded demo") : run.executionTarget === "local-codex" ? "Codex CLI" : text(language, "结果导入", "Evidence import")}</strong></div>
    </div>

    {resolvedRun && <div className="resolution-banner"><div><RotateCcw /><span><b>{text(language, "此运行在失败检查后结束", "This run stopped after a failed check")}</b><small>{text(language, "后续修复运行保留了独立结果，可直接对比。", "A later correction run preserves its own comparable results.")}</small></span></div><button className="secondary-button" onClick={() => onSelectRun(resolvedRun)}>{text(language, "查看修复运行", "Open correction run")}<ArrowRight /></button></div>}

    <div className="run-master-detail">
      <nav className="run-stage-nav" aria-label={text(language, "运行阶段", "Run stages")}>
        {run.stages.map((item, index) => <button key={item.id} className={`${item.id === stage.id ? "active" : ""} ${item.key === run.currentStage ? "current" : ""}`} onClick={() => setSelectedStageId(item.id)} aria-current={item.key === run.currentStage ? "step" : undefined} aria-pressed={item.id === stage.id}><span className="stage-index">{item.status === "passed" ? <Check /> : String(index + 1).padStart(2, "0")}</span><div><b>{stageText(language, item)}</b><small>{item.key === run.currentStage ? text(language, "当前阶段", "Current stage") : item.status === "passed" ? text(language, "证据已完成", "Evidence complete") : item.status === "failed" ? text(language, "需要修复", "Needs correction") : text(language, "尚未开始", "Not started")}</small></div><StatusBadge status={item.status} language={language} /></button>)}
      </nav>

      <section className="stage-workbench">
        <header className="stage-workbench-head"><div><span className="section-label">{text(language, "阶段", "Stage")} {run.stages.findIndex((item) => item.id === stage.id) + 1}</span><h2>{stageText(language, stage)}</h2><p>{definition ? text(language, definition.purpose.zh, definition.purpose.en) : stage.decision}</p></div><div className="badge-row"><ActorBadge actor={stage.actor} language={language} /><StatusBadge status={stage.status} language={language} /></div></header>

        <div className="stage-contract">
          <div><span>{text(language, "开始前需要", "Input")}</span><p>{stage.input ? recordText(language, stage.input) : "—"}</p></div>
          <div><span>{text(language, "完成后留下", "Output")}</span><p className="mono">{stage.output || definition?.artifactNames.join(", ") || text(language, "尚未产生", "Not produced")}</p></div>
          <div><span>{text(language, "完成判定", "Completion")}</span><p>{definition ? text(language, definition.completion.zh, definition.completion.en) : stage.decision}</p></div>
          <div><span>{text(language, "主要风险", "Primary risk")}</span><p>{definition ? text(language, definition.risk.zh, definition.risk.en) : stage.failureReason || "—"}</p></div>
        </div>

        {stage.failureReason && <div className="stage-failure"><b>{text(language, "为什么停止", "Why it stopped")}</b><p>{recordText(language, stage.failureReason)}</p></div>}

        {implementationPending && <section className="execution-panel">
          <div className="execution-panel-head"><div><span className="section-label">Codex CLI</span><h3>{text(language, "执行已批准的工程计划", "Execute the approved engineering plan")}</h3></div><StatusBadge status={run.status === "running" ? "running" : "pending"} language={language} /></div>
          {project.executionTarget === "local-codex" ? <>
            <div className="execution-facts"><p><CheckCircle2 />{text(language, "Codex 只在启动 runner 时指定的目录内工作。", "Codex works only in the folder selected when the runner starts.")}</p><p><CheckCircle2 />{text(language, "输入包含已确认需求、14 阶段计划和治理策略。", "Input includes the confirmed requirement, 14-stage plan, and governance policy.")}</p><p><CheckCircle2 />{text(language, "运行结束后仍需导入构建、测试和安全检查结果。", "Build, test, and security results must still be imported after execution.")}</p></div>
            {!localRunnerConfigured ? <button className="primary-button" onClick={() => navigate("settings")}>{text(language, "连接本地 runner", "Connect local runner")}<ArrowRight /></button> : run.status === "running" ? <button className="danger-button" onClick={() => void onCancelCodex(run)}><CircleStop />{text(language, "停止本地运行", "Stop local run")}</button> : <><label className="execution-confirm"><input type="checkbox" checked={executionConfirmed} onChange={(event) => setExecutionConfirmed(event.target.checked)} /><span>{text(language, "我已检查需求与计划，并确认目标代码目录可以写入。", "I reviewed the requirement and plan and confirm that the target code folder may be modified.")}</span></label><button className="primary-button" disabled={!executionConfirmed || runnerBusy} onClick={() => void execute()}><Play />{runnerBusy ? text(language, "Codex 正在执行…", "Codex is running…") : text(language, "开始 Codex 实现", "Start Codex implementation")}</button></>}
          </> : <div className="implementation-intake"><p>{text(language, "此项目采用结果导入。请填写与后续检查相同的提交、分支或变更单号。", "This project uses evidence import. Enter the same commit, branch, or change reference used by later checks.")}</p><label><span>{text(language, "实现版本", "Implementation version")}</span><input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="commit 7f3a21b / PR #42" /></label><button className="primary-button" disabled={!reference.trim()} onClick={() => { onAttestImplementation(run, reference.trim()); setSelectedStageId(run.stages.find((item) => item.key === "validation")?.id || selectedStageId); setReference(""); }}>{text(language, "关联实现并进入验证", "Attach implementation and continue")}<ArrowRight /></button></div>}
          {runnerError && <div className="inline-error" role="alert">{runnerError}</div>}
        </section>}

        {artifactStages.has(stage.key) && stage.status !== "passed" && <div className="stage-action"><div><FileClock /><span><b>{text(language, "本阶段需要确认工程工件", "This stage needs confirmed artifacts")}</b><small>{definition?.artifactNames.join(", ")}</small></span></div><button className="primary-button" onClick={() => navigate("evidence")}>{text(language, "打开工件", "Open artifacts")}<ArrowRight /></button></div>}
        {["validation", "testing", "security"].includes(stage.key) && stage.status !== "passed" && <div className="stage-action"><div><ShieldCheck /><span><b>{text(language, "导入或查看对应检查", "Import or inspect the required checks")}</b><small>{text(language, "机器结果需要包含命令、退出状态、耗时和原始输出。", "Machine evidence includes command, exit status, duration, and raw output.")}</small></span></div><button className="primary-button" onClick={() => navigate("checks")}>{text(language, "打开检查", "Open checks")}<ArrowRight /></button></div>}
        {stage.key === "release" && <div className="stage-action"><div><ShieldCheck /><span><b>{text(language, "根据当前证据计算发布判断", "Calculate release readiness from current evidence")}</b><small>{text(language, "未知、未运行和草稿不会计为通过。", "Unknown, not-run, and draft states never count as passed.")}</small></span></div><button className="primary-button" onClick={() => navigate("release")}>{text(language, "查看发布", "Open release")}<ArrowRight /></button></div>}

        <div className="stage-linked-data">
          <section><header><h3>{text(language, "本阶段工件", "Stage artifacts")}</h3><span>{stageArtifacts.length}</span></header>{stageArtifacts.length ? <ul>{stageArtifacts.map((item) => <li key={item.id}><span><b>{item.fileName}</b><small>{item.status}</small></span><StatusBadge status={item.status === "draft" ? "pending" : "passed"} language={language} /></li>)}</ul> : <div className="inline-empty"><Clock3 /><span>{text(language, "没有关联工件", "No linked artifact")}</span></div>}</section>
          <section><header><h3>{text(language, "本阶段检查", "Stage checks")}</h3><span>{stageChecks.length}</span></header>{stageChecks.length ? <ul>{stageChecks.map((item) => <li key={item.id}><span><b>{recordText(language, item.label)}</b><small>{recordText(language, item.summary)}</small></span><StatusBadge status={item.status} language={language} /></li>)}</ul> : <div className="inline-empty"><Clock3 /><span>{text(language, "没有检查结果", "No check result")}</span></div>}</section>
          <section><header><h3>{text(language, "关联证据", "Evidence")}</h3><span>{stageEvidence.length}</span></header>{stageEvidence.length ? <ul>{stageEvidence.map((item) => <li key={item.id}><span><b>{recordText(language, item.title)}</b><small>{recordText(language, item.summary)}</small></span><SourceBadge source={item.source} language={language} /></li>)}</ul> : <div className="inline-empty"><Clock3 /><span>{text(language, "没有证据记录", "No evidence record")}</span></div>}</section>
        </div>
      </section>
    </div>
  </div>;
}
