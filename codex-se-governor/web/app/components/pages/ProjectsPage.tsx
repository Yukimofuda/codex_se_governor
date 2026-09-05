import { ArrowRight, FolderOpen, Play, Plus, Search } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../ui/PageHeader";
import type { WorkspacePageProps } from "../workspace-types";
import { text } from "../workspace-types";

export function ProjectsPage({ language, workspace, project, navigate, onCreate, onSelect }: WorkspacePageProps & { onCreate: () => void; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const userProjects = workspace.projects.filter((item) => !item.demo);
  const filtered = userProjects.filter((item) => `${item.name} ${item.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const demo = workspace.projects.find((item) => item.demo);
  const sampleRuns = workspace.runs.filter((item) => item.projectId === demo?.id);
  return <div className="project-library">
    <PageHeader title={text(language, "项目", "Projects")} actions={userProjects.length ? <button className="primary-button" onClick={onCreate}><Plus />{text(language, "创建项目", "Create project")}</button> : undefined} />
    {userProjects.length > 0 ? <section className="work-section">
      <div className="list-toolbar"><label className="search-field"><Search /><span className="sr-only">{text(language, "搜索项目", "Search projects")}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text(language, "搜索项目", "Search projects")} /></label><span className="muted">{filtered.length} {text(language, "个项目", "projects")}</span></div>
      <div className="project-library-list">{filtered.map((item) => <button key={item.id} className={project?.id === item.id ? "selected" : ""} onClick={() => { onSelect(item.id); navigate("overview"); }}><span className="project-initial" aria-hidden="true">{item.name.slice(0, 1)}</span><span className="work-name"><span><b>{item.name}</b><small>{item.description}</small></span></span><span className="project-stack">{item.stack.join(" / ")}</span><time>{new Date(item.updatedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}</time><ArrowRight className="row-arrow" /></button>)}</div>
      {!filtered.length && <div className="section-empty compact"><p>{text(language, "没有匹配的项目", "No matching projects")}</p><button className="text-button" onClick={() => setQuery("")}>{text(language, "清除搜索", "Clear search")}</button></div>}
    </section> : <section className="new-workspace"><div className="new-workspace-symbol"><FolderOpen /></div><h2>{text(language, "创建你的第一个项目", "Create your first project")}</h2><button className="primary-button" onClick={onCreate}><Plus />{text(language, "创建项目", "Create project")}</button></section>}
    {demo && <section className="sample-workspace"><div><span className="sample-label">{text(language, "示例项目", "Sample project")}</span><h2>{text(language, "登录接口限流", "Login rate limiting")}</h2><p>{text(language, `${sampleRuns.length} 次运行 · ${sampleRuns.filter((item) => item.status === "failed").length} 次失败 · 已记录检查结果`, `${sampleRuns.length} runs · ${sampleRuns.filter((item) => item.status === "failed").length} failed · recorded check results`)}</p></div><button className="secondary-button" onClick={() => { onSelect(demo.id); navigate("overview"); }}><Play />{text(language, "查看登录限流示例", "Explore login rate-limit demo")}</button></section>}
  </div>;
}
