"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  storageStatus,
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
  storageStatus: "loading" | "saving" | "saved" | "failed";
  onNavigate: (view: ViewId) => void;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onNewRequirement: () => void;
  onLanguage: (language: Language) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const activeProject = projects.find((item) => item.id === activeProjectId);
  const selectView = (target: ViewId) => {
    const shouldMoveFocus = mobileOpen;
    onNavigate(target);
    setMobileOpen(false);
    if (shouldMoveFocus) requestAnimationFrame(() => document.getElementById("workspace-content")?.focus());
  };
  useEffect(() => {
    if (!createOpen) return;
    const closeCreateMenuFromKeyboard = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setCreateOpen(false);
      createButtonRef.current?.focus();
    };
    const closeCreateMenu = (event: PointerEvent) => {
      if (createMenuRef.current?.contains(event.target as Node)) return;
      setCreateOpen(false);
    };
    document.addEventListener("keydown", closeCreateMenuFromKeyboard);
    document.addEventListener("pointerdown", closeCreateMenu);
    return () => {
      document.removeEventListener("keydown", closeCreateMenuFromKeyboard);
      document.removeEventListener("pointerdown", closeCreateMenu);
    };
  }, [createOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileCloseButtonRef.current?.focus();
    const handleDrawerKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab" || !sidebarRef.current) return;
      const focusable = [...sidebarRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], select:not(:disabled), [tabindex]:not([tabindex='-1'])")]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDrawerKeyboard);
    return () => document.removeEventListener("keydown", handleDrawerKeyboard);
  }, [mobileOpen]);

  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <a className="skip-link" href="#workspace-content">{text(language, "跳至主内容", "Skip to main content")}</a>
    <header className="topbar" inert={mobileOpen ? true : undefined}>
      <button ref={mobileMenuButtonRef} className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen} aria-controls="workspace-sidebar" aria-label={text(language, "打开导航", "Open navigation")}><Menu /></button>
      <button className="brand" onClick={() => selectView("overview")} aria-label="Codex SE Governor overview">
        <span className="brand-mark" aria-hidden="true" />
        <span><b>Codex SE Governor</b></span>
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
        <div className="create-menu" ref={createMenuRef}>
          <button ref={createButtonRef} className="primary-icon-button" onClick={() => setCreateOpen((value) => !value)} aria-expanded={createOpen} aria-haspopup="menu" aria-label={text(language, "新建", "Create")}><Plus /></button>
          {createOpen && <div className="action-menu" role="menu">
            <button role="menuitem" onClick={() => { setCreateOpen(false); onCreateProject(); }}><Boxes /><span><b>{text(language, "新建项目", "Create project")}</b></span></button>
            <button role="menuitem" disabled={!activeProject} onClick={() => { setCreateOpen(false); onNewRequirement(); }}><BookOpenCheck /><span><b>{text(language, "新建需求", "Create requirement")}</b></span></button>
          </div>}
        </div>
      </div>
    </header>

    {mobileOpen && <button className="sidebar-backdrop" tabIndex={-1} onClick={() => { setMobileOpen(false); requestAnimationFrame(() => mobileMenuButtonRef.current?.focus()); }} aria-label={text(language, "关闭导航", "Close navigation")} />}
    <aside ref={sidebarRef} id="workspace-sidebar" className={`sidebar ${mobileOpen ? "mobile-open" : ""}`} role={mobileOpen ? "dialog" : undefined} aria-modal={mobileOpen ? true : undefined} aria-label={mobileOpen ? text(language, "工作区导航", "Workspace navigation") : undefined}>
      <div className="sidebar-mobile-head"><b>{text(language, "工作区", "Workspace")}</b><button ref={mobileCloseButtonRef} className="icon-button" onClick={() => { setMobileOpen(false); requestAnimationFrame(() => mobileMenuButtonRef.current?.focus()); }} aria-label={text(language, "关闭", "Close")}><X /></button></div>
      <nav aria-label={text(language, "工作区导航", "Workspace navigation")}>
        {navGroups.filter((group) => activeProject || group.en === "Workspace").map((group) => <div className="nav-group" key={group.en}><p>{text(language, group.zh, group.en)}</p>{group.items.filter((item) => activeProject || item.id === "projects").map((item) => <button key={item.id} disabled={!activeProject && !["overview", "projects"].includes(item.id)} className={view === item.id || (!activeProject && view === "overview" && item.id === "projects") ? "active" : ""} aria-current={view === item.id || (!activeProject && view === "overview" && item.id === "projects") ? "page" : undefined} onClick={() => selectView(item.id)} title={!activeProject && !["overview", "projects"].includes(item.id) ? text(language, "先创建或选择项目", "Create or select a project first") : collapsed ? text(language, item.zh, item.en) : undefined}>
          <item.icon aria-hidden="true" /><span>{text(language, item.zh, item.en)}</span>
        </button>)}</div>)}
      </nav>
      <div className="sidebar-footer">
        <button aria-label={text(language, "设置", "Settings")} title={text(language, "设置", "Settings")} className={view === "settings" ? "active" : ""} aria-current={view === "settings" ? "page" : undefined} onClick={() => selectView("settings")}><Settings /><span>{text(language, "设置", "Settings")}</span></button>
        <button className="collapse-button" aria-label={collapsed ? text(language, "展开导航", "Expand navigation") : text(language, "收起导航", "Collapse navigation")} title={collapsed ? text(language, "展开导航", "Expand navigation") : text(language, "收起导航", "Collapse navigation")} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}<span>{text(language, "收起导航", "Collapse navigation")}</span></button>
        <div className={`workspace-mode storage-${storageStatus}`} role="status"><ShieldCheck /><span><b>{text(language, { loading: "读取项目中…", saving: "保存中…", saved: "已保存至此浏览器", failed: "本地存储失败" }[storageStatus], { loading: "Loading projects…", saving: "Saving…", saved: "Saved in this browser", failed: "Browser storage failed" }[storageStatus])}</b></span></div>
        <div className="legal-links">
          <a href="/privacy">{text(language, "隐私", "Privacy")}</a>
          <a href="/terms">{text(language, "使用条款", "Terms")}</a>
        </div>
      </div>
    </aside>
    <main id="workspace-content" className="workspace-main" tabIndex={-1} inert={mobileOpen ? true : undefined}>
      <div className="workspace-content">{children}</div>
    </main>
  </div>;
}
