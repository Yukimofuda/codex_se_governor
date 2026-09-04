import { AlertTriangle, ArrowRight, Check, CheckCircle2, CircleGauge, Play, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { projectChoiceEffects } from "../../domain/course-policy";
import { projectPolicy, projectProgress } from "../../domain/governance";
import { EmptyState } from "../ui/EmptyState";
import { SourceBadge, StatusBadge } from "../ui/StatusBadge";
import type { WorkflowStage } from "../../domain/model";
import type { ViewId, WorkspacePageProps } from "../workspace-types";
import { findingText, recordText, stageText, text } from "../workspace-types";

type Action = { title: string; detail: string; result: string; label: string; target: ViewId };

export function OverviewPage({ language, workspace, project, navigate, onOpenDemo, onCreateProject, onSelectRun, onOpenStage }: WorkspacePageProps & { onOpenDemo: () => void; onCreateProject: () => void; onSelectRun: (runId: string) => void; onOpenStage: (runId: string, stage: WorkflowStage) => void }) {
  const [showAllStages, setShowAllStages] = useState(false);
  if (!project) return <div className="first-run">
    <section className="first-run-copy">
      <span className="product-kicker">{text(language, "开始使用", "GET STARTED")}</span>
      <h1>{text(language, "先建立项目，再定义第一项需求", "Create a project, then define its first requirement")}</h1>
      <p>{text(language, "填写代码来源、技术栈和质量要求。创建后，需求、计划、运行记录、检查结果与发布判断会归入同一个项目。", "Set the code source, stack, and quality requirements. Requirements, plans, runs, checks, and release decisions will then stay together in one project.")}</p>
      <div className="onboarding-actions"><button className="primary-button" onClick={onCreateProject}><Plus />{text(language, "创建项目", "Create project")}</button><button className="secondary-button" onClick={onOpenDemo}><Play />{text(language, "查看登录限流示例", "Explore login rate-limit demo")}</button></div>
      <div className="first-run-note"><ShieldCheck /><span>{text(language, "需要让 Codex 修改代码时，在项目设置中连接本机 Runner 并确认工作目录。", "To let Codex modify code, connect the local Runner in project settings and approve its working directory.")}</span></div>
    </section>
    <section className="first-run-guide">
      <header><span className="section-label">{text(language, "工作区流程", "WORKSPACE FLOW")}</span><h2>{text(language, "从需求到发布判断", "From requirement to release decision")}</h2><p>{text(language, "每一步都有明确输入、产物和完成条件。", "Each step has defined inputs, outputs, and completion criteria.")}</p></header>
      <ol className="first-run-flow">
        <li><span>01</span><div><b>{text(language, "确定项目边界", "Define project boundaries")}</b><p>{text(language, "记录代码来源、技术栈、开发方式与治理级别。", "Record the code source, stack, delivery process, and governance level.")}</p></div></li>
        <li><span>02</span><div><b>{text(language, "确认需求", "Confirm requirements")}</b><p>{text(language, "明确功能、验收场景、约束和质量要求。", "Define behavior, acceptance scenarios, constraints, and quality requirements.")}</p></div></li>
        <li><span>03</span><div><b>{text(language, "批准计划并运行", "Approve the plan and run")}</b><p>{text(language, "按阶段执行 Codex、机器检查和人工审批。", "Run Codex, machine checks, and human approvals by stage.")}</p></div></li>
        <li><span>04</span><div><b>{text(language, "审查发布依据", "Review release evidence")}</b><p>{text(language, "根据测试、安全、风险和回滚证据作出决定。", "Decide from test, security, risk, and rollback evidence.")}</p></div></li>
      </ol>
    </section>
  </div>;

  const requirements = workspace.requirements.filter((item) => item.projectId === project.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const requirement = requirements[0];
  const plan = workspace.plans.find((item) => item.projectId === project.id && item.requirementId === requirement?.id);
  const runs = workspace.runs.filter((item) => item.projectId === project.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const run = runs.find((item) => item.id === workspace.activeRunId) || runs[0];
  const release = workspace.releases.find((item) => item.runId === run?.id);
  const artifacts = workspace.artifacts.filter((item) => item.projectId === project.id && (!requirement || item.requirementId === requirement.id));
  const checks = workspace.checks.filter((item) => item.runId === run?.id);
  const policy = projectPolicy(project);
  const progress = projectProgress(requirement, plan, run);
  const effects = projectChoiceEffects(project);
  const currentStage = run?.stages.find((item) => item.key === run.currentStage);
  const currentStageIndex = run?.stages.findIndex((item) => item.key === run.currentStage) ?? -1;
  const blockers = release?.blockers || (run?.status === "failed" ? ["A workflow stage has failed."] : []);

  let action: Action;
  if (!requirement) action = { title: text(language, "定义第一项需求", "Define the first requirement"), detail: text(language, "说明用户问题、目标和不可破坏的现有行为。", "Capture the user problem, target outcome, and behavior that must not break."), result: text(language, "产生可追踪的 FR、验收场景和质量要求", "Creates traceable FRs, acceptance scenarios, and quality requirements"), label: text(language, "建立需求", "Create requirement"), target: "requirements" };
  else if (requirement.status !== "confirmed") action = { title: text(language, "完成并确认需求", "Complete and confirm the requirement"), detail: text(language, "需求草稿还不能用于计划；补全问题、验收和质量场景。", "The draft cannot enter planning yet; complete the problem, acceptance, and quality scenarios."), result: text(language, "确认后生成工程工件草稿和 14 阶段计划", "Confirmation creates artifact drafts and a 14-stage plan"), label: text(language, "继续需求", "Complete requirement"), target: "requirements" };
  else if (!plan) action = { title: text(language, "生成工程计划", "Create the engineering plan"), detail: text(language, "把已确认需求展开为责任明确的生命周期阶段。", "Expand the confirmed requirement into accountable lifecycle stages."), result: text(language, "每个阶段明确输入、工件、检查和风险", "Each stage gains inputs, artifacts, checks, and risks"), label: text(language, "建立计划", "Create plan"), target: "plan" };
  else if (plan.status !== "approved") action = { title: text(language, "审核并批准计划", "Review and approve the plan"), detail: text(language, "逐阶段检查交付内容和完成条件，确认后才可执行。", "Inspect each stage's output and completion condition before execution."), result: text(language, "批准后锁定本次运行的执行依据", "Approval locks the execution basis for this run"), label: text(language, "审核计划", "Review plan"), target: "plan" };
  else if (!run) action = { title: text(language, "开始治理运行", "Start a governed run"), detail: text(language, "为本次需求建立独立的阶段、检查和证据记录。", "Create an independent stage, check, and evidence record for this requirement."), result: text(language, "后续结果不会覆盖历史运行", "Later results will not overwrite prior runs"), label: text(language, "开始运行", "Start run"), target: "plan" };
  else if (run.status === "failed") action = { title: text(language, "处理失败并创建修复运行", "Resolve the failure in a correction run"), detail: currentStage?.failureReason || text(language, "打开失败阶段查看命令、输出和关联证据。", "Open the failed stage to inspect commands, output, and evidence."), result: text(language, "修复结果以新运行保留，便于前后对比", "The correction is preserved as a new comparable run"), label: text(language, "查看失败阶段", "Inspect failure"), target: "run" };
  else action = { title: stageText(language, currentStage || { key: "validation", label: "Validation" }), detail: currentStage?.decision ? recordText(language, currentStage.decision) : text(language, "当前阶段等待所需工件或检查结果。", "This stage is waiting for its required artifact or check result."), result: currentStage?.key === "validation" || currentStage?.key === "testing" ? text(language, "导入与当前提交对应的机器检查清单", "Import machine results for the current commit") : text(language, "完成的工件会关联到当前运行并更新阶段状态", "Confirmed artifacts attach to the run and update its stage"), label: currentStage?.key === "validation" || currentStage?.key === "testing" ? text(language, "打开检查", "Open checks") : text(language, "打开当前阶段", "Open stage"), target: currentStage?.key === "validation" || currentStage?.key === "testing" ? "checks" : "run" };

  const stagePassed = run?.stages.filter((item) => item.status === "passed").length || 0;
  const requiredArtifacts = policy.requiredArtifacts || [];
  const confirmedArtifacts = artifacts.filter((item) => requiredArtifacts.includes(item.fileName) && item.status !== "draft").length;
  const requiredChecksPassed = policy.requiredChecks.filter((key) => checks.some((item) => item.key === key && item.status === "passed")).length;

  return <div className="overview-workspace">
    <header className="project-heading">
      <div><div className="project-heading-meta"><span>{project.softwareType}</span><span>{project.processModel}</span><span>{project.branch}</span>{project.demo && <SourceBadge source="recorded-demo" language={language} />}</div><h1>{project.name}</h1><p>{project.description}</p></div>
      <button className="primary-button" onClick={() => navigate(run ? "run" : requirement ? "plan" : "requirements")}><Play />{run ? text(language, "打开当前运行", "Open current run") : text(language, "开始工程流程", "Start engineering flow")}</button>
    </header>

    <div className="overview-status-row">
      <button onClick={() => navigate("run")} aria-label={text(language, "查看当前运行阶段", "Open the current run stage")}><span>{text(language, "当前阶段", "Current stage")}</span><strong>{run ? stageText(language, currentStage || run.stages[0]) : text(language, "尚未运行", "Not started")}<ArrowRight /></strong><small>{run ? `${stagePassed}/${run.stages.length} ${text(language, "阶段完成", "stages complete")}` : text(language, "先确认需求和计划", "Confirm requirement and plan first")}</small></button>
      <button onClick={() => navigate("evidence")} aria-label={text(language, "查看必需工件", "Open required artifacts")}><span>{text(language, "必需工件", "Required artifacts")}</span><strong>{confirmedArtifacts}/{requiredArtifacts.length}<ArrowRight /></strong><small>{artifacts.filter((item) => item.status === "draft").length} {text(language, "份草稿待确认", "drafts need review")}</small></button>
      <button onClick={() => navigate("checks")} aria-label={text(language, "查看强制检查", "Open required checks")}><span>{text(language, "强制检查", "Required checks")}</span><strong>{requiredChecksPassed}/{policy.requiredChecks.length}<ArrowRight /></strong><small>{checks.filter((item) => item.status === "failed").length ? text(language, "存在失败项", "Failures present") : text(language, "按当前运行统计", "For the current run")}</small></button>
      <button onClick={() => navigate("release")} aria-label={text(language, "查看发布判断", "Open release decision")}><span>{text(language, "发布判断", "Release decision")}</span><strong>{release ? (language === "zh" ? ({ ready: "可发布", conditional: "有条件通过", blocked: "已阻断", unknown: "未知" } as const)[release.status] : release.status.toUpperCase()) : text(language, "未评估", "NOT EVALUATED")}<ArrowRight /></strong><small>{blockers.length} {text(language, "项阻断", "blockers")}</small></button>
    </div>

    <div className="overview-primary-grid">
      <section className="next-work">
        <div className="next-work-marker"><span>{progress.percent}%</span><i style={{ width: `${progress.percent}%` }} /></div>
        <div className="next-work-body"><span className="section-label">{text(language, "下一步", "Next action")}</span><h2>{action.title}</h2><p>{action.detail}</p><div className="action-effect"><CheckCircle2 /><span>{action.result}</span></div></div>
        <button className="primary-button" onClick={() => navigate(action.target)}>{action.label}<ArrowRight /></button>
      </section>

      <section className="attention-list">
        <header><div><span className="section-label">{text(language, "需要处理", "Needs attention")}</span><h2>{blockers.length ? text(language, "发布阻断项", "Release blockers") : text(language, "当前没有发布阻断", "No current release blockers")}</h2></div>{blockers.length ? <AlertTriangle /> : <ShieldCheck />}</header>
        {blockers.length ? <ul>{blockers.slice(0, 4).map((item) => <li key={item}><AlertTriangle /><span>{findingText(language, item)}</span></li>)}</ul> : <p>{text(language, "继续当前阶段；新的机器检查或人工决定会实时更新这里。", "Continue the current stage; new machine checks and human decisions update this list.")}</p>}
        <button className="text-button" onClick={() => navigate("release")}>{text(language, "查看完整发布依据", "Inspect release basis")}<ArrowRight /></button>
      </section>
    </div>

    <section className={`lifecycle-overview ${showAllStages ? "expanded" : ""}`}>
      <header><div><span className="section-label">{text(language, "软件工程生命周期", "Software engineering lifecycle")}</span><h2>{run ? `Run #${run.sequence}` : text(language, "尚未建立运行", "No run created")}</h2></div>{run && <StatusBadge status={run.status} language={language} />}</header>
      {run ? <><ol>{run.stages.map((stage, index) => <li key={stage.id} className={`${stage.key === run.currentStage ? "current" : ""} ${stage.status === "failed" || Math.abs(index - currentStageIndex) <= 1 ? "mobile-priority" : ""} status-${stage.status}`}><button onClick={() => onOpenStage(run.id, stage)} aria-label={`${text(language, "打开阶段", "Open stage")}：${stageText(language, stage)}`}><span className="stage-number">{stage.status === "passed" ? <Check /> : index + 1}</span><b>{stageText(language, stage)}</b><small>{stage.status === "passed" ? text(language, "已完成", "Complete") : stage.status === "failed" ? text(language, "需修复", "Failed") : stage.key === run.currentStage ? text(language, "当前", "Current") : text(language, "等待", "Waiting")}</small></button></li>)}</ol><button className="lifecycle-toggle" onClick={() => setShowAllStages((value) => !value)}>{showAllStages ? text(language, "只看当前阶段", "Show current stages") : text(language, `查看全部 ${run.stages.length} 个阶段`, `View all ${run.stages.length} stages`)}</button></> : <EmptyState icon={CircleGauge} title={text(language, "运行尚未开始", "Run has not started")} description={text(language, "确认需求和计划后，14 个阶段会在这里显示真实状态。", "Confirm the requirement and plan to track all 14 stages here.")} />}
    </section>

    <div className="overview-secondary-grid">
      <section className="policy-impact">
        <header><div><span className="section-label">{text(language, "项目规则", "Project controls")}</span><h2>{text(language, "生效中的质量与流程要求", "Active quality and process requirements")}</h2></div><span className="policy-badge">{policy.id === "strict" ? text(language, "严格策略", "Strict policy") : policy.id === "standard" ? text(language, "标准策略", "Standard policy") : text(language, "自定义策略", "Custom policy")}</span></header>
        <div>{effects.map((effect) => <article key={effect.id}><b>{language === "zh" ? effect.name.zh : effect.name.en}</b><p>{language === "zh" ? effect.controls[0]?.zh : effect.controls[0]?.en}</p><details><summary>{text(language, `查看 ${effect.checks.length} 项检查与 ${effect.artifacts.length} 份工件`, `View ${effect.checks.length} checks and ${effect.artifacts.length} artifacts`)}</summary><div><span>{text(language, "检查", "Checks")}</span><code>{effect.checks.join(", ") || "—"}</code><span>{text(language, "工件", "Artifacts")}</span><code>{effect.artifacts.join(", ") || "—"}</code></div></details></article>)}</div>
        <button className="text-button" onClick={() => navigate("settings")}>{text(language, "查看治理策略", "Review governance policy")}<ArrowRight /></button>
      </section>

      <section className="recent-activity">
        <header><div><span className="section-label">{text(language, "运行历史", "Run history")}</span><h2>{text(language, "最近运行", "Recent runs")}</h2></div><button className="text-button" onClick={() => navigate("history")}>{text(language, "全部", "All")}<ArrowRight /></button></header>
        {runs.length ? <div>{runs.slice(0, 4).map((item) => <button key={item.id} onClick={() => { onSelectRun(item.id); navigate("run"); }}><span><b>Run #{item.sequence}</b><small>{item.commit || text(language, "无提交引用", "No commit reference")}</small></span><span>{new Date(item.startedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}</span><StatusBadge status={item.status} language={language} /><ArrowRight /></button>)}</div> : <p>{text(language, "批准计划后开始第一次运行。", "Approve the plan to start the first run.")}</p>}
      </section>
    </div>
  </div>;
}
