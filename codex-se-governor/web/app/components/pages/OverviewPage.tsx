import { ArrowRight, FileText, GitBranch, Plus, Timer } from "lucide-react";
import { projectPolicy } from "../../domain/governance";
import { selectedRequirement, selectedRun } from "../../domain/workspace-context";
import type { WorkflowStage } from "../../domain/model";
import { PageHeader } from "../ui/PageHeader";
import { SourceBadge, StatusBadge } from "../ui/StatusBadge";
import type { WorkspacePageProps } from "../workspace-types";
import { stageText, text } from "../workspace-types";
import { ProjectsPage } from "./ProjectsPage";

export function OverviewPage({ language, workspace, project, navigate, onSelectProject, onCreateProject, onNewRequirement, onOpenRequirement, onSelectRun, onOpenStage }: WorkspacePageProps & {
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onNewRequirement: () => void;
  onOpenRequirement: (id: string) => void;
  onSelectRun: (id: string) => void;
  onOpenStage: (runId: string, stage: WorkflowStage) => void;
}) {
  if (!project) return <ProjectsPage language={language} workspace={workspace} project={project} navigate={navigate} onCreate={onCreateProject} onSelect={onSelectProject} />;
  const requirements = workspace.requirements.filter((item) => item.projectId === project.id);
  const runs = workspace.runs.filter((item) => item.projectId === project.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const requirement = selectedRequirement(workspace);
  const run = selectedRun(workspace);
  const currentStage = run?.stages.find((item) => item.key === run.currentStage);
  const release = workspace.releases.find((item) => item.runId === run?.id);
  const checks = workspace.checks.filter((item) => item.runId === run?.id);
  const policy = projectPolicy(project);
  const missing = policy.requiredChecks.filter((key) => !checks.some((check) => check.key === key));
  const failed = checks.filter((check) => check.status === "failed");
  const date = (value: string) => new Date(value).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric" });

  return <div className="project-home">
    <PageHeader title={project.name} description={project.description} actions={<button className="primary-button" onClick={onNewRequirement}><Plus />{text(language, "新建需求", "New requirement")}</button>} />
    <div className="project-properties"><span><GitBranch />{project.branch || "main"}</span><span>{project.stack.join(" / ")}</span><span>{project.policyProfile === "strict" ? text(language, "严格检查", "Strict checks") : text(language, "标准检查", "Standard checks")}</span>{project.demo && <SourceBadge source="recorded-demo" language={language} />}</div>
    <div className="home-columns">
        <section className="home-current" aria-label={text(language, "当前工作", "Current work")}><h2>{text(language, "当前需求", "Selected requirement")}</h2><h3>{requirement?.title || text(language, "未选择", "None selected")}</h3>
          {run && currentStage ? <><div className="inspector-line"><span>Run #{run.sequence}</span><StatusBadge status={run.status} language={language} /></div><button className="inspector-action" onClick={() => onOpenStage(run.id, currentStage)}><span>{stageText(language, currentStage)}</span><ArrowRight /></button></> : requirement && <button className="inspector-action" onClick={() => navigate(requirement.status === "confirmed" ? "plan" : "requirements")}><span>{requirement.status === "confirmed" ? text(language, "查看计划", "Open plan") : text(language, "编辑草稿", "Edit draft")}</span><ArrowRight /></button>}
        </section>
      <div className="home-main">
        <section className="work-section" aria-labelledby="home-requirements">
          <header><h2 id="home-requirements">{text(language, "需求", "Requirements")}<span className="count-label">{requirements.length}</span></h2></header>
          {requirements.length ? <div className="work-list">
            <div className="work-list-labels"><span>{text(language, "名称", "Name")}</span><span>{text(language, "进展", "Progress")}</span><span>{text(language, "更新", "Updated")}</span></div>
            {requirements.map((item) => {
              const itemRun = runs.find((entry) => entry.requirementId === item.id);
              const itemPlan = workspace.plans.find((entry) => entry.requirementId === item.id);
              const label = item.status !== "confirmed" ? text(language, "草稿", "Draft") : itemRun ? text(language, "已建立运行", "Run created") : itemPlan?.status === "approved" ? text(language, "计划已批准", "Plan approved") : itemPlan ? text(language, "计划待审核", "Plan in review") : text(language, "需求已确认", "Confirmed");
              return <button className={`requirement-work-row ${item.id === requirement?.id ? "current" : ""}`} key={item.id} onClick={() => onOpenRequirement(item.id)}>
                <span className="work-name"><FileText /><span><b>{item.title || text(language, "未命名需求", "Untitled requirement")}</b><small>{item.functional.length} {text(language, "项功能", "requirements")} · {item.acceptanceDetails?.length || 0} {text(language, "项验收条件", "acceptance criteria")}</small></span></span>
                <span className="work-state"><i className={item.status === "confirmed" ? "confirmed" : ""} />{label}</span><time dateTime={item.updatedAt}>{date(item.updatedAt)}</time><ArrowRight className="row-arrow" />
              </button>;
            })}
          </div> : <div className="section-empty"><FileText /><h3>{text(language, "这个项目要做什么？", "What are you working on?")}</h3><button className="text-button" onClick={onNewRequirement}>{text(language, "添加第一项需求", "Add your first requirement")}<ArrowRight /></button></div>}
        </section>
        <section className="work-section" aria-labelledby="home-runs">
          <header><h2 id="home-runs">{text(language, "最近运行", "Recent runs")}</h2>{runs.length > 0 && <button className="text-button" onClick={() => navigate("history")}>{text(language, "查看全部", "View all")}<ArrowRight /></button>}</header>
          {runs.length ? <div className="run-work-list">{runs.slice(0, 5).map((item) => <button key={item.id} onClick={() => { onSelectRun(item.id); navigate("run"); }}>
            <span className="run-sequence">#{item.sequence}</span><span className="work-name"><span><b>{workspace.requirements.find((entry) => entry.id === item.requirementId)?.title || text(language, "未命名需求", "Untitled requirement")}</b><small><code>{item.commit || text(language, "未关联提交", "No commit")}</code> · {date(item.startedAt)}</small></span></span><StatusBadge status={item.status} language={language} /><ArrowRight className="row-arrow" />
          </button>)}</div> : <div className="section-empty compact"><Timer /><p>{text(language, "还没有运行记录", "No runs yet")}</p>{requirement && <button className="text-button" onClick={() => navigate(requirement.status === "confirmed" ? "plan" : "requirements")}>{requirement.status === "confirmed" ? text(language, "制定计划", "Create a plan") : text(language, "填写需求", "Edit requirement")}<ArrowRight /></button>}</div>}
        </section>
      </div>
      <aside className="home-inspector" aria-label={text(language, "项目摘要", "Project summary")}>
        <section><h2>{run ? `Run #${run.sequence} · ` : ""}{text(language, "检查结果", "Check results")}</h2><dl className="inspector-facts"><div><dt>{text(language, "通过", "Passed")}</dt><dd>{checks.filter((item) => item.status === "passed").length}</dd></div><div><dt>{text(language, "失败", "Failed")}</dt><dd className={failed.length ? "failure-text" : ""}>{failed.length}</dd></div><div><dt>{text(language, "警告", "Warnings")}</dt><dd>{checks.filter((item) => item.status === "warning").length}</dd></div><div><dt>{text(language, "缺少必需检查结果", "Required results missing")}</dt><dd>{run ? missing.length : text(language, "尚未运行", "Not started")}</dd></div></dl>{run && <button className="text-button" onClick={() => navigate("checks")}>{text(language, "查看检查结果", "Inspect checks")}<ArrowRight /></button>}</section>
        <section><h2>{text(language, "发布评估", "Release review")}</h2><p className="release-summary">{release ? text(language, { ready: "评估记录：可发布", conditional: "评估记录：有条件通过", blocked: "评估记录：未通过", unknown: "评估结果未知" }[release.status], `Recorded decision: ${release.status}`) : text(language, "尚未评估", "Not evaluated")}</p>{release && <time className="muted" dateTime={release.generatedAt}>{date(release.generatedAt)}</time>}{run && <button className="text-button" onClick={() => navigate("release")}>{text(language, "审查发布条件", "Review release checks")}<ArrowRight /></button>}</section>
        <section><h2>{text(language, "项目设置", "Project settings")}</h2><dl className="inspector-facts"><div><dt>{text(language, "代码来源", "Code source")}</dt><dd>{project.repository ? text(language, "GitHub 仓库", "GitHub repository") : project.source === "local-codex" ? text(language, "本地目录", "Local folder") : text(language, "空白项目", "Blank project")}</dd></div><div><dt>{text(language, "执行方式", "Execution")}</dt><dd>{project.executionTarget === "local-codex" ? text(language, "本机 Codex", "Local Codex") : text(language, "导入结果", "Import results")}</dd></div></dl><button className="text-button" onClick={() => navigate("settings")}>{text(language, "管理设置", "Manage settings")}<ArrowRight /></button></section>
      </aside>
    </div>
  </div>;
}
