import { AlertTriangle, ArrowRight, Check, CheckCircle2, CircleGauge, Play, Plus, ShieldCheck } from "lucide-react";
import { projectChoiceEffects } from "../../domain/course-policy";
import { projectPolicy, projectProgress } from "../../domain/governance";
import { EmptyState } from "../ui/EmptyState";
import { SourceBadge, StatusBadge } from "../ui/StatusBadge";
import type { ViewId, WorkspacePageProps } from "../workspace-types";
import { findingText, recordText, stageText, text } from "../workspace-types";

type Action = { title: string; detail: string; result: string; label: string; target: ViewId };

export function OverviewPage({ language, workspace, project, navigate, onOpenDemo, onCreateProject, onSelectRun }: WorkspacePageProps & { onOpenDemo: () => void; onCreateProject: () => void; onSelectRun: (runId: string) => void }) {
  if (!project) return <div className="first-run">
    <section className="first-run-copy">
      <span className="product-kicker">AI-assisted Software Engineering Governance</span>
      <h1>{text(language, "让一次 Codex 开发工作有需求、有检查、也有发布依据", "Give every Codex change requirements, checks, and a release decision")}</h1>
      <p>{text(language, "建立项目后，从用户需求开始，依次确认计划、执行、测试、安全审查和发布证据。系统不会把草稿或未知结果显示为通过。", "Start with a project and move from the user requirement through planning, execution, testing, security review, and release evidence. Drafts and unknown results never appear as passed.")}</p>
      <div className="onboarding-actions"><button className="primary-button" onClick={onCreateProject}><Plus />{text(language, "建立我的项目", "Create my project")}</button><button className="secondary-button" onClick={onOpenDemo}><Play />{text(language, "体验完整示例", "Explore the complete demo")}</button></div>
      <div className="first-run-note"><ShieldCheck /><span>{text(language, "项目资料默认保存在当前浏览器；连接本地 runner 后，Codex CLI 才能在你选定的代码目录工作。", "Project data stays in this browser by default. Codex CLI can work in code only after you start a local runner for an approved folder.")}</span></div>
    </section>
    <ol className="first-run-flow">
      <li><span>01</span><div><b>{text(language, "描述要解决的问题", "Describe the problem")}</b><p>{text(language, "系统整理功能、验收场景和质量边界。", "The workspace structures behavior, acceptance scenarios, and quality boundaries.")}</p></div></li>
      <li><span>02</span><div><b>{text(language, "批准工程计划", "Approve the engineering plan")}</b><p>{text(language, "逐阶段查看工件、检查、责任来源和风险。", "Inspect artifacts, checks, actors, and risks stage by stage.")}</p></div></li>
      <li><span>03</span><div><b>{text(language, "运行 Codex 与机器检查", "Run Codex and machine checks")}</b><p>{text(language, "AI 推断、确定性结果和人工决定分别记录。", "AI inference, deterministic results, and human decisions remain separate.")}</p></div></li>
      <li><span>04</span><div><b>{text(language, "根据证据决定发布", "Decide release from evidence")}</b><p>{text(language, "阻断项、警告、剩余风险和回滚方案集中呈现。", "Blockers, warnings, residual risks, and rollback stay visible together.")}</p></div></li>
    </ol>
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
      <div><div className="project-heading-meta"><span>{project.softwareType}</span><span>{project.processModel}</span><span>{project.branch}</span>{project.demo && <SourceBadge source="recorded-demo" />}</div><h1>{project.name}</h1><p>{project.description}</p></div>
      <button className="primary-button" onClick={() => navigate(run ? "run" : requirement ? "plan" : "requirements")}><Play />{run ? text(language, "打开当前运行", "Open current run") : text(language, "开始工程流程", "Start engineering flow")}</button>
    </header>

    <div className="overview-status-row">
      <button onClick={() => navigate("run")}><span>{text(language, "当前阶段", "Current stage")}</span><strong>{run ? stageText(language, currentStage || run.stages[0]) : text(language, "尚未运行", "Not started")}</strong><small>{run ? `${stagePassed}/${run.stages.length} ${text(language, "阶段完成", "stages complete")}` : text(language, "先确认需求和计划", "Confirm requirement and plan first")}</small></button>
      <button onClick={() => navigate("evidence")}><span>{text(language, "必需工件", "Required artifacts")}</span><strong>{confirmedArtifacts}/{requiredArtifacts.length}</strong><small>{artifacts.filter((item) => item.status === "draft").length} {text(language, "份草稿待确认", "drafts need review")}</small></button>
      <button onClick={() => navigate("checks")}><span>{text(language, "强制检查", "Required checks")}</span><strong>{requiredChecksPassed}/{policy.requiredChecks.length}</strong><small>{checks.filter((item) => item.status === "failed").length ? text(language, "存在失败项", "Failures present") : text(language, "按当前运行统计", "For the current run")}</small></button>
      <button onClick={() => navigate("release")}><span>{text(language, "发布判断", "Release decision")}</span><strong>{release ? release.status.toUpperCase() : text(language, "未评估", "NOT EVALUATED")}</strong><small>{blockers.length} {text(language, "项阻断", "blockers")}</small></button>
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

    <section className="lifecycle-overview">
      <header><div><span className="section-label">{text(language, "软件工程生命周期", "Software engineering lifecycle")}</span><h2>{run ? `Run #${run.sequence}` : text(language, "尚未建立运行", "No run created")}</h2></div>{run && <StatusBadge status={run.status} />}</header>
      {run ? <ol>{run.stages.map((stage, index) => <li key={stage.id} className={`${stage.key === run.currentStage ? "current" : ""} status-${stage.status}`}><button onClick={() => navigate("run")}><span className="stage-number">{stage.status === "passed" ? <Check /> : index + 1}</span><b>{stageText(language, stage)}</b><small>{stage.status === "passed" ? text(language, "已完成", "Complete") : stage.status === "failed" ? text(language, "需修复", "Failed") : stage.key === run.currentStage ? text(language, "当前", "Current") : text(language, "等待", "Waiting")}</small></button></li>)}</ol> : <EmptyState icon={CircleGauge} title={text(language, "运行尚未开始", "Run has not started")} description={text(language, "确认需求和计划后，14 个阶段会在这里显示真实状态。", "Confirm the requirement and plan to track all 14 stages here.")} />}
    </section>

    <div className="overview-secondary-grid">
      <section className="policy-impact">
        <header><div><span className="section-label">{text(language, "项目规则", "Project controls")}</span><h2>{text(language, "这些选择实际改变了什么", "What the project settings enforce")}</h2></div><StatusBadge status="passed" label={policy.name} /></header>
        <div>{effects.map((effect) => <article key={effect.id}><b>{language === "zh" ? effect.name.zh : effect.name.en}</b><p>{language === "zh" ? effect.controls[0]?.zh : effect.controls[0]?.en}</p><span>{effect.checks.length} {text(language, "项检查", "checks")} · {effect.artifacts.length} {text(language, "份工件", "artifacts")}</span></article>)}</div>
        <button className="text-button" onClick={() => navigate("settings")}>{text(language, "查看治理策略", "Review governance policy")}<ArrowRight /></button>
      </section>

      <section className="recent-activity">
        <header><div><span className="section-label">{text(language, "运行历史", "Run history")}</span><h2>{text(language, "最近运行", "Recent runs")}</h2></div><button className="text-button" onClick={() => navigate("history")}>{text(language, "全部", "All")}<ArrowRight /></button></header>
        {runs.length ? <div>{runs.slice(0, 4).map((item) => <button key={item.id} onClick={() => { onSelectRun(item.id); navigate("run"); }}><span><b>Run #{item.sequence}</b><small>{item.commit || text(language, "无提交引用", "No commit reference")}</small></span><span>{new Date(item.startedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}</span><StatusBadge status={item.status} /><ArrowRight /></button>)}</div> : <p>{text(language, "批准计划后开始第一次运行。", "Approve the plan to start the first run.")}</p>}
      </section>
    </div>
  </div>;
}
