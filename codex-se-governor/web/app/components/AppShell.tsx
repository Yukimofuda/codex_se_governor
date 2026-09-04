"use client";

import { useState, type ReactNode } from "react";
import {
  Archive,
  BookOpenCheck,
  Boxes,
  CheckSquare2,
  ChevronDown,
  CircleGauge,
  FileClock,
  FileSearch,
  GitPullRequestArrow,
  History,
  Languages,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Language, Project } from "../domain/model";
import type { ViewId } from "./workspace-types";
import { text } from "./workspace-types";

const navGroups = [
  { zh: "项目", en: "Project", items: [
    { id: "overview", zh: "概览", en: "Overview", icon: CircleGauge },
    { id: "requirements", zh: "需求", en: "Requirements", icon: BookOpenCheck },
    { id: "plan", zh: "计划", en: "Plan", icon: GitPullRequestArrow },
    { id: "run", zh: "运行", en: "Run", icon: FileClock },
  ] },
  { zh: "质量保证", en: "Assurance", items: [
    { id: "checks", zh: "检查", en: "Checks", icon: CheckSquare2 },
    { id: "evidence", zh: "工件与证据", en: "Artifacts & evidence", icon: FileSearch },
    { id: "release", zh: "发布", en: "Release", icon: Archive },
  ] },
  { zh: "工作区", en: "Workspace", items: [
    { id: "projects", zh: "所有项目", en: "All projects", icon: Boxes },
    { id: "history", zh: "运行历史", en: "Run history", icon: History },
  ] },
] as const;

export function AppShell({
  children,
  view,
  language,
  projects,
  activeProjectId,
  onNavigate,
  onSelectProject,
  onCreateProject,
  onNewRequirement,
  onLanguage,
}: {
  children: ReactNode;
  view: ViewId;
  language: Language;
  projects: Project[];
  activeProjectId: string;
  onNavigate: (view: ViewId) => void;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onNewRequirement: () => void;
  onLanguage: (language: Language) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const activeProject = projects.find((item) => item.id === activeProjectId);
  const selectView = (target: ViewId) => {
    onNavigate(target);
    setMobileOpen(false);
  };
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label={text(language, "打开导航", "Open navigation")}><Menu /></button>
      <button className="brand" onClick={() => selectView("overview")} aria-label="Codex SE Governor overview">
        <span className="brand-mark" aria-hidden="true"><i /><i /></span>
        <span><b>Codex SE Governor</b><small>Engineering governance workspace</small></span>
      </button>
      <div className="project-context">
        <label className="sr-only" htmlFor="project-context-select">{text(language, "当前项目", "Current project")}</label>
        <select id="project-context-select" value={activeProjectId} onChange={(event) => onSelectProject(event.target.value)}>
          <option value="">{text(language, "选择项目", "Select project")}</option>
          {projects.map((project) => <option value={project.id} key={project.id}>{project.name}{project.demo ? " · Demo" : ""}</option>)}
        </select>
        <ChevronDown aria-hidden="true" />
      </div>
      <div className="topbar-actions">
        <button className="icon-button" onClick={() => onLanguage(language === "zh" ? "en" : "zh")} aria-label={text(language, "切换语言", "Switch language")} title={text(language, "切换语言", "Switch language")}><Languages /></button>
        <button className="icon-button" onClick={() => selectView("settings")} aria-label={text(language, "设置", "Settings")} title={text(language, "设置", "Settings")}><Settings /></button>
        <div className="create-menu">
          <button className="primary-icon-button" onClick={() => setCreateOpen((value) => !value)} aria-expanded={createOpen} aria-label={text(language, "新建", "Create")}><Plus /></button>
          {createOpen && <div className="action-menu" role="menu">
            <button role="menuitem" onClick={() => { setCreateOpen(false); onCreateProject(); }}><Boxes /><span><b>{text(language, "新建项目", "Create project")}</b><small>{text(language, "建立独立的工程工作区", "Create an engineering workspace")}</small></span></button>
            <button role="menuitem" disabled={!activeProject} onClick={() => { setCreateOpen(false); onNewRequirement(); }}><BookOpenCheck /><span><b>{text(language, "新建需求", "Create requirement")}</b><small>{text(language, "为当前项目定义一项工作", "Define work for the current project")}</small></span></button>
          </div>}
        </div>
      </div>
    </header>

    {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label={text(language, "关闭导航", "Close navigation")} />}
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-mobile-head"><b>{text(language, "工作区", "Workspace")}</b><button className="icon-button" onClick={() => setMobileOpen(false)} aria-label={text(language, "关闭", "Close")}><X /></button></div>
      <nav aria-label={text(language, "工作区导航", "Workspace navigation")}>
        {navGroups.map((group) => <div className="nav-group" key={group.en}><p>{text(language, group.zh, group.en)}</p>{group.items.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => selectView(item.id)} title={collapsed ? text(language, item.zh, item.en) : undefined}>
          <item.icon aria-hidden="true" /><span>{text(language, item.zh, item.en)}</span>
        </button>)}</div>)}
      </nav>
      <div className="sidebar-footer">
        <button className={view === "settings" ? "active" : ""} onClick={() => selectView("settings")}><Settings /><span>{text(language, "设置", "Settings")}</span></button>
        <button className="collapse-button" onClick={() => setCollapsed((value) => !value)}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}<span>{text(language, "收起导航", "Collapse navigation")}</span></button>
        <div className="workspace-mode"><ShieldCheck /><span><b>{text(language, "本地保存", "Local storage")}</b><small>{text(language, "项目资料保存在此浏览器", "Project data stays in this browser")}</small></span></div>
        <div className="legal-links">
          <a href="/privacy">{text(language, "隐私", "Privacy")}</a>
          <a href="/terms">{text(language, "使用条款", "Terms")}</a>
        </div>
      </div>
    </aside>
    <main className="workspace-main">
      {activeProject && <div className="context-strip">
        <span>{activeProject.demo ? text(language, "录制示例", "Recorded demo") : activeProject.environment}</span>
        <span>{activeProject.repository || activeProject.localWorkspaceName || text(language, "未连接代码来源", "No code source")}</span>
        <span>{activeProject.branch}</span>
        <span>{activeProject.policyProfile.toUpperCase()} POLICY</span>
      </div>}
      <div className="workspace-content">{children}</div>
    </main>
  </div>;
}
