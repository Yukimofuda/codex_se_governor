import { ArrowRight, Boxes, ExternalLink, Play, Plus } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import type { WorkspacePageProps } from "../workspace-types";
import { text } from "../workspace-types";

export function ProjectsPage({ language, workspace, project, navigate, onCreate, onSelect }: WorkspacePageProps & { onCreate: () => void; onSelect: (id: string) => void }) {
  const userProjects = workspace.projects.filter((item) => !item.demo);
  const demo = workspace.projects.find((item) => item.demo);
  return <div>
    <PageHeader eyebrow={text(language, "工作区", "Workspace")} title={text(language, "项目", "Projects")} description={text(language, "每个项目独立保存需求、计划、运行记录、检查和发布证据。", "Each project keeps its own requirements, plans, runs, checks, and release evidence.")} actions={<button className="primary-button" onClick={onCreate}><Plus />{text(language, "创建项目", "Create project")}</button>} />
    {userProjects.length ? <section className="workspace-panel project-list"><div className="data-table"><div className="table-head project-table"><span>{text(language, "项目", "Project")}</span><span>{text(language, "仓库", "Repository")}</span><span>{text(language, "策略", "Policy")}</span><span>{text(language, "更新时间", "Updated")}</span><span /></div>{userProjects.map((item) => <button key={item.id} className={`table-row project-table ${project?.id === item.id ? "selected" : ""}`} onClick={() => { onSelect(item.id); navigate("overview"); }}><span className="table-primary"><b>{item.name}</b><small>{item.description}</small></span><span className="table-detail" data-label={text(language, "仓库", "Repository")}>{item.repository || text(language, "未连接", "Not connected")}</span><span className="table-detail" data-label={text(language, "策略", "Policy")}>{item.policyProfile}</span><span className="table-detail" data-label={text(language, "更新时间", "Updated")}>{new Date(item.updatedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}</span><span className="table-arrow"><ArrowRight /></span></button>)}</div></section> : <EmptyState icon={Boxes} title={text(language, "还没有自己的项目", "No project yet")} description={text(language, "创建项目后即可定义需求并建立第一条治理工作流。", "Create a project to define a requirement and start the first governed workflow.")} actions={<button className="primary-button" onClick={onCreate}><Plus />{text(language, "创建项目", "Create project")}</button>} />}
    {demo && <section className="demo-project-row"><div><span className="demo-chip">DEMO</span><h2>{demo.name}</h2><p>{text(language, "查看登录限流功能从需求到发布判断的完整记录，包括一次失败运行。", "Inspect a login rate-limit change from requirement to release decision, including a failed run.")}</p></div><button className="secondary-button" onClick={() => { onSelect(demo.id); navigate("overview"); }}><Play />{text(language, "打开示例", "Open demo")}</button></section>}
    <section className="project-model-note"><ExternalLink /><div><b>{text(language, "项目是所有工程证据的边界", "A project is the boundary for engineering evidence")}</b><p>{text(language, "需求、运行和发布记录不会在项目之间混用。", "Requirements, runs, and releases are never mixed across projects.")}</p></div></section>
  </div>;
}
