"use client";

import { ArrowRight, Check, GitPullRequestArrow, Pencil, Play, RefreshCw, Save, ShieldAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
import { lifecycleBlueprint } from "../../domain/course-policy";
import type { ExecutionPlan, PlanTask, WorkflowStage } from "../../domain/model";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { ActorBadge, StatusBadge } from "../ui/StatusBadge";
import type { WorkspacePageProps } from "../workspace-types";
import { stageText, text } from "../workspace-types";

function phaseLabel(language: WorkspacePageProps["language"], id: string, name: string) {
  return stageText(language, { key: id as WorkflowStage["key"], label: name });
}

function updateSelectedTask(plan: ExecutionPlan, phaseId: string, patch: Partial<PlanTask>): ExecutionPlan {
  return {
    ...plan,
    phases: plan.phases.map((phase) => phase.id === phaseId ? { ...phase, tasks: phase.tasks.map((task, index) => index === 0 ? { ...task, ...patch } : task) } : phase),
    updatedAt: new Date().toISOString(),
  };
}

export function PlanPage({ language, workspace, project, navigate, onGenerate, onApprove, onSave, onStartRun }: WorkspacePageProps & {
  onGenerate: () => void;
  onApprove: (plan: ExecutionPlan) => void;
  onSave: (plan: ExecutionPlan) => void;
  onStartRun: (plan: ExecutionPlan) => void;
}) {
  const requirement = workspace.requirements.filter((item) => item.projectId === project?.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const plan = workspace.plans.find((item) => item.projectId === project?.id && item.requirementId === requirement?.id);
  const [selectedPhaseId, setSelectedPhaseId] = useState(plan?.phases[0]?.id || "context");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(plan);

  const activePlan = editing && draft ? draft : plan;
  const phase = activePlan?.phases.find((item) => item.id === selectedPhaseId) || activePlan?.phases[0];
  const task = phase?.tasks[0];
  const definition = lifecycleBlueprint.find((item) => item.key === phase?.id);
  const invalidCount = useMemo(() => activePlan?.phases.reduce((count, item) => count + item.tasks.filter((entry) => !entry.title.trim() || !entry.input.trim() || !entry.expectedOutput.trim() || !entry.check.trim() || !entry.risk.trim()).length, 0) || 0, [activePlan]);

  if (!project) return <EmptyState icon={GitPullRequestArrow} title={text(language, "先选择项目", "Select a project")} description={text(language, "计划必须连接到项目和已确认需求。", "A plan must connect to a project and confirmed requirement.")} actions={<button className="primary-button" onClick={() => navigate("projects")}>{text(language, "查看项目", "View projects")}</button>} />;
  if (!requirement || requirement.status !== "confirmed") return <div><PageHeader eyebrow={project.name} title={text(language, "先确认需求", "Confirm the requirement first")} description={text(language, "计划只接受项目负责人确认过的目标、约束和验收条件。", "Planning only uses goals, constraints, and acceptance criteria confirmed by the project owner.")} /><EmptyState icon={GitPullRequestArrow} title={text(language, "缺少已确认需求", "Confirmed requirement required")} description={text(language, "返回需求页完成问题、验收和质量场景。", "Complete the problem, acceptance, and quality scenarios in Requirements.")} actions={<button className="primary-button" onClick={() => navigate("requirements")}>{text(language, "完成需求", "Complete requirement")}</button>} /></div>;
  if (!plan) return <div><PageHeader eyebrow={`${project.name} / ${requirement.id}`} title={text(language, "建立工程计划", "Create engineering plan")} description={requirement.title} /><EmptyState icon={GitPullRequestArrow} title={text(language, "将需求展开为 14 个工程阶段", "Expand the requirement into 14 engineering stages")} description={text(language, "每个阶段明确输入、交付物、完成检查、责任来源和主要风险。", "Each stage defines its input, output, completion check, actor, and primary risk.")} actions={<button className="primary-button" onClick={onGenerate}>{text(language, "生成计划草稿", "Create plan draft")}</button>} /></div>;

  const existingRun = workspace.runs.find((item) => item.planId === plan.id);
  const canEdit = plan.status === "draft" && !existingRun;
  const setTask = (patch: Partial<PlanTask>) => task && activePlan && setDraft(updateSelectedTask(activePlan, phase!.id, patch));
  const beginEdit = () => { setDraft(plan); setEditing(true); };
  const cancel = () => { setDraft(plan); setEditing(false); };
  const save = () => { if (!draft || invalidCount) return; onSave({ ...draft, status: "draft" }); setEditing(false); };

  return <div className="plan-workspace">
    <PageHeader eyebrow={`${project.name} / ${requirement.id}`} title={text(language, "工程计划", "Engineering plan")} description={requirement.title} actions={<>
      <StatusBadge status={plan.status === "approved" ? "passed" : "pending"} label={plan.status === "approved" ? text(language, "已批准", "Approved") : text(language, "待审核", "Review required")} language={language} />
      {canEdit && !editing && <button className="secondary-button" onClick={beginEdit}><Pencil />{text(language, "编辑阶段", "Edit stages")}</button>}
      {canEdit && !editing && <button className="icon-button" onClick={onGenerate} title={text(language, "恢复建议计划", "Restore suggested plan")} aria-label={text(language, "恢复建议计划", "Restore suggested plan")}><RefreshCw /></button>}
      {editing ? <><button className="secondary-button" onClick={cancel}><X />{text(language, "取消", "Cancel")}</button><button className="primary-button" disabled={Boolean(invalidCount)} onClick={save}><Save />{text(language, "保存修改", "Save changes")}</button></> : canEdit ? <button className="primary-button" disabled={Boolean(invalidCount)} onClick={() => onApprove(plan)}><Check />{text(language, "批准此计划", "Approve plan")}</button> : !existingRun && plan.status === "approved" ? <button className="primary-button" onClick={() => onStartRun(plan)}><Play />{text(language, "开始治理运行", "Start governed run")}</button> : existingRun ? <button className="secondary-button" onClick={() => navigate("run")}>{text(language, "查看运行", "Open run")}<ArrowRight /></button> : null}
    </>} />

    <div className="plan-overview-strip">
      <div><span>{text(language, "阶段", "Stages")}</span><strong>{plan.phases.length}</strong></div>
      <div><span>{text(language, "强制检查点", "Completion checks")}</span><strong>{plan.phases.filter((item) => item.tasks[0]?.check).length}</strong></div>
      <div><span>{text(language, "责任来源", "Actors")}</span><strong>{new Set(plan.phases.map((item) => item.tasks[0]?.owner)).size}</strong></div>
      <div className={invalidCount ? "warning" : "ready"}><span>{text(language, "信息缺口", "Incomplete stages")}</span><strong>{invalidCount}</strong></div>
    </div>

    <div className="plan-master-detail">
      <nav className="plan-stage-nav" aria-label={text(language, "计划阶段", "Plan stages")}>
        {activePlan?.phases.map((item, index) => <button key={item.id} className={phase?.id === item.id ? "active" : ""} aria-pressed={phase?.id === item.id} onClick={() => setSelectedPhaseId(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{phaseLabel(language, item.id, item.name)}</b><small>{item.tasks[0]?.expectedOutput}</small></div><StatusBadge status={item.tasks[0]?.status || "pending"} language={language} /></button>)}
      </nav>

      {phase && task && <section className="plan-stage-inspector">
        <header><div><span className="section-label">{text(language, "阶段", "Stage")} {activePlan!.phases.findIndex((item) => item.id === phase.id) + 1}</span><h2>{phaseLabel(language, phase.id, phase.name)}</h2><p>{definition ? text(language, definition.purpose.zh, definition.purpose.en) : task.title}</p></div><ActorBadge actor={task.owner} language={language} /></header>
        <div className="plan-stage-fields">
          <label><span>{text(language, "本阶段要完成的工作", "Work to complete")}</span>{editing ? <textarea rows={3} value={task.title} onChange={(event) => setTask({ title: event.target.value })} /> : <p>{task.title}</p>}</label>
          <label><span>{text(language, "开始前需要", "Required input")}</span>{editing ? <textarea rows={3} value={task.input} onChange={(event) => setTask({ input: event.target.value })} /> : <p>{task.input}</p>}</label>
          <label><span>{text(language, "应产生的工程工件", "Expected artifact")}</span>{editing ? <textarea rows={3} value={task.expectedOutput} onChange={(event) => setTask({ expectedOutput: event.target.value })} /> : <p className="mono">{task.expectedOutput}</p>}</label>
          <label><span>{text(language, "怎样判定完成", "Completion condition")}</span>{editing ? <textarea rows={3} value={task.check} onChange={(event) => setTask({ check: event.target.value })} /> : <p>{task.check}</p>}</label>
          <label className="risk-field"><span><ShieldAlert />{text(language, "本阶段主要风险", "Primary risk")}</span>{editing ? <textarea rows={3} value={task.risk} onChange={(event) => setTask({ risk: event.target.value })} /> : <p>{task.risk}</p>}</label>
          <div className="dependency-field"><span>{text(language, "依赖上一阶段", "Dependency")}</span><code>{task.dependency || text(language, "无", "None")}</code></div>
        </div>
      </section>}
    </div>

    <footer className="plan-decision-bar"><div><b>{plan.status === "approved" ? text(language, "此计划已锁定为运行依据", "This plan is locked as the run basis") : text(language, "批准代表什么", "What approval means")}</b><p>{plan.status === "approved" ? text(language, "若需求或范围改变，请建立新计划，不要覆盖历史运行。", "Create a new plan if requirement scope changes; do not overwrite run history.") : text(language, "负责人确认阶段顺序、交付工件、检查方法和风险足以指导实现。", "The owner confirms that stage order, artifacts, checks, and risks are sufficient to guide implementation.")}</p></div>{invalidCount > 0 && <span className="validation-message"><ShieldAlert />{invalidCount} {text(language, "个阶段信息不完整", "incomplete stages")}</span>}</footer>
  </div>;
}
