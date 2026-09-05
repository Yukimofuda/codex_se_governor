"use client";

import { ArrowRight, BookOpenCheck, Check, CircleHelp, Plus, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { projectChoiceEffects } from "../../domain/course-policy";
import { selectedRequirement } from "../../domain/workspace-context";
import type { AcceptanceCriterion, Language, Requirement } from "../../domain/model";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { SourceBadge, StatusBadge } from "../ui/StatusBadge";
import type { WorkspacePageProps } from "../workspace-types";
import { text } from "../workspace-types";

type RequirementSection = "brief" | "acceptance" | "quality";

function stripId(value: string) {
  return value.replace(/^(?:FR|NFR|AC|CON|OOS)-\d{3}\s*[:.-]?\s*/i, "");
}

function itemId(value: string, prefix: string, fallback: number) {
  return value.match(new RegExp(`^(${prefix}-\\d{3})\\b`, "i"))?.[1].toUpperCase() || `${prefix}-${String(fallback).padStart(3, "0")}`;
}

function nextItemId(values: string[], prefix: string) {
  const highest = values.reduce((maximum, value) => {
    const parsed = Number(value.match(new RegExp(`^${prefix}-(\\d{3})\\b`, "i"))?.[1] || 0);
    return Math.max(maximum, parsed);
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(3, "0")}`;
}

function ListEditor({ language, label, prefix, items, onChange, addLabel, help }: {
  language: Language;
  label: string;
  prefix: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  help: string;
}) {
  const update = (index: number, value: string) => onChange(items.map((item, current) => current === index ? `${itemId(item, prefix, index + 1)} ${value}`.trim() : item));
  return <fieldset className="item-editor">
    <legend>{label}</legend>
    <p className="field-help"><CircleHelp />{help}</p>
    <div className="item-editor-list">
      {items.map((item, index) => <div className="item-editor-row" key={itemId(item, prefix, index + 1)}>
        <code>{itemId(item, prefix, index + 1)}</code>
        <input value={stripId(item)} onChange={(event) => update(index, event.target.value)} aria-label={`${label} ${index + 1}`} />
        <button type="button" className="icon-button" onClick={() => onChange(items.filter((_, current) => current !== index))} aria-label={text(language, "删除此项", "Remove item")}><Trash2 /></button>
      </div>)}
    </div>
    <button type="button" className="inline-add" onClick={() => onChange([...items, `${nextItemId(items, prefix)} `])}><Plus />{addLabel}</button>
  </fieldset>;
}

function acceptanceLabel(language: Language, kind: AcceptanceCriterion["kind"]) {
  const labels = {
    normal: ["正常流程", "Normal"],
    boundary: ["边界情况", "Boundary"],
    failure: ["失败处理", "Failure"],
    security: ["安全场景", "Security"],
    regression: ["回归保护", "Regression"],
  } as const;
  return text(language, labels[kind][0], labels[kind][1]);
}

function normalizeRequirement(source: Requirement): Requirement {
  const details = source.acceptanceDetails?.length
    ? source.acceptanceDetails
    : source.acceptanceCriteria.map((item, index) => ({ id: `AC-${String(index + 1).padStart(3, "0")}`, kind: index === 0 ? "normal" as const : "regression" as const, context: "", action: "", expected: stripId(item) }));
  return {
    ...source,
    stakeholders: source.stakeholders || [],
    userStory: source.userStory || { role: "", goal: "", benefit: "" },
    acceptanceDetails: details,
    qualityScenarios: source.qualityScenarios || [],
    assumptions: source.assumptions || [],
    conflicts: source.conflicts || [],
  };
}

export function RequirementsPage({ language, workspace, project, navigate, onCreate, onSelect, onDraft, onSave, onAssist }: WorkspacePageProps & {
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDraft: (requirement: Requirement) => void;
  onSave: (requirement: Requirement) => void;
  onAssist: (requirement: Requirement) => Promise<Requirement>;
}) {
  const source = selectedRequirement(workspace);
  const [draft, setDraft] = useState<Requirement | undefined>(() => source ? normalizeRequirement(source) : undefined);
  const [section, setSection] = useState<RequirementSection>("brief");
  const [assisting, setAssisting] = useState(false);
  const [error, setError] = useState("");
  const choices = useMemo(() => project ? projectChoiceEffects(project) : [], [project]);

  if (!project) return <EmptyState icon={BookOpenCheck} title={text(language, "先选择项目", "Select a project")} actions={<button className="primary-button" onClick={() => navigate("projects")}>{text(language, "查看项目", "View projects")}</button>} />;
  if (!draft) return <div><PageHeader title={text(language, "需求", "Requirements")} /><EmptyState icon={BookOpenCheck} title={text(language, "还没有需求", "No requirements yet")} actions={<button className="primary-button" onClick={onCreate}><Plus />{text(language, "新建需求", "New requirement")}</button>} /></div>;

  const update = (patch: Partial<Requirement>) => {
    const next: Requirement = { ...draft, ...patch, status: "draft", updatedAt: new Date().toISOString() };
    setDraft(next);
    onDraft(next);
  };
  const acceptance = draft.acceptanceDetails || [];
  const requiredAcceptanceKinds: AcceptanceCriterion["kind"][] = ["normal", "boundary", "failure", "security", "regression"];
  const scenarioCount = draft.qualityScenarios?.length || 0;
  const confirmedScenarios = draft.qualityScenarios?.filter((item) => item.status === "confirmed").length || 0;
  const briefReady = Boolean(draft.title.trim() && draft.goal.trim() && draft.userProblem.trim() && draft.functional.some((item) => stripId(item).trim()) && draft.userStory?.role.trim() && draft.userStory.goal.trim() && draft.userStory.benefit.trim());
  const acceptanceReady = requiredAcceptanceKinds.every((kind) => acceptance.some((item) => item.kind === kind && item.context.trim() && item.action.trim() && item.expected.trim()));
  const qualityReady = scenarioCount > 0 && confirmedScenarios === scenarioCount;
  const completion = [briefReady, acceptanceReady, qualityReady].filter(Boolean).length;
  const updateAcceptance = (id: string, patch: Partial<AcceptanceCriterion>) => {
    const next = acceptance.map((item) => item.id === id ? { ...item, ...patch } : item);
    update({ acceptanceDetails: next, acceptanceCriteria: next.map((item) => `${item.id}: Given ${item.context || "[context]"}, when ${item.action || "[action]"}, then ${item.expected || "[expected result]"}.`) });
  };
  const addAcceptance = () => {
    const highest = acceptance.reduce((maximum, item) => Math.max(maximum, Number(item.id.match(/AC-(\d{3})/i)?.[1] || 0)), 0);
    const id = `AC-${String(highest + 1).padStart(3, "0")}`;
    const kind = requiredAcceptanceKinds.find((candidate) => !acceptance.some((item) => item.kind === candidate)) || "normal";
    update({ acceptanceDetails: [...acceptance, { id, kind, context: "", action: "", expected: "" }] });
  };
  const confirmQuality = () => update({
    qualityScenarios: (draft.qualityScenarios || []).map((item) => ({ ...item, status: "confirmed" })),
    nonFunctional: (draft.qualityScenarios || []).map((item, index) => `NFR-${String(index + 1).padStart(3, "0")} ${item.expectedResponse}; verify with ${item.verification}.`),
    security: choices.filter((item) => item.id === project.qualityProfile?.security).flatMap((item) => item.controls.map((control) => control.en)),
    performance: choices.filter((item) => item.id === project.qualityProfile?.performance).flatMap((item) => item.controls.map((control) => control.en)),
  });
  const confirm = () => {
    if (!briefReady || !acceptanceReady || !qualityReady) {
      setError(text(language, "请完成上方标记的三部分；未确认的质量场景不能进入计划。", "Complete all three sections above; unconfirmed quality scenarios cannot enter planning."));
      return;
    }
    setError("");
    const confirmed = { ...draft, status: "confirmed" as const, updatedAt: new Date().toISOString() };
    setDraft(confirmed);
    onSave(confirmed);
  };
  const assist = async () => {
    setAssisting(true); setError("");
    try { setDraft(normalizeRequirement(await onAssist(draft))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : text(language, "AI 整理失败。", "AI structuring failed.")); }
    finally { setAssisting(false); }
  };

  return <div className="requirements-workspace">
    <PageHeader title={text(language, "需求", "Requirements")} actions={<><StatusBadge status={draft.status === "confirmed" ? "passed" : "pending"} label={draft.status === "confirmed" ? text(language, "已确认", "Confirmed") : text(language, "草稿", "Draft")} language={language} /><button className="secondary-button" onClick={onCreate}><Plus />{text(language, "新需求", "New requirement")}</button></>} />
    <div className="requirement-context"><label htmlFor="requirement-select">{text(language, "当前需求", "Selected requirement")}</label><select id="requirement-select" value={draft.id} onChange={(event) => onSelect(event.target.value)}>{workspace.requirements.filter((item) => item.projectId === project.id).map((item) => <option value={item.id} key={item.id}>{item.title || text(language, "未命名需求", "Untitled requirement")}</option>)}</select><span className="muted">{text(language, "自动保存至此浏览器", "Autosaved in this browser")}</span></div>

    <div className="requirement-progress" aria-label={text(language, "需求完成度", "Requirement completion")}>
      {([
        ["brief", text(language, "问题与目标", "Problem & goal"), briefReady],
        ["acceptance", text(language, "验收标准", "Acceptance"), acceptanceReady],
        ["quality", text(language, "质量与边界", "Quality & boundaries"), qualityReady],
      ] as const).map(([id, label, complete], index) => <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}><span>{complete ? <Check /> : index + 1}</span><b>{label}</b><small>{complete ? text(language, "已完整", "Complete") : text(language, "待补充", "Needs input")}</small></button>)}
      <div className="requirement-progress-total"><strong>{completion}/3</strong><span>{text(language, "已完成", "completed")}</span></div>
    </div>

    <div className="requirement-workarea">
      <aside className="requirement-source">
        <div className="section-heading"><div><h2>{text(language, "任务描述", "Task description")}</h2></div><SourceBadge language={language} source={draft.source === "recorded-demo" ? "recorded-demo" : draft.source === "ai-assisted" ? "ai-assisted" : "attested"} /></div>
        <label><span>{text(language, "任务类型", "Work type")}</span><select value={draft.kind} onChange={(event) => update({ kind: event.target.value as Requirement["kind"] })}><option value="feature">{text(language, "新功能", "Feature")}</option><option value="bug-fix">{text(language, "修复缺陷", "Bug fix")}</option><option value="refactor">{text(language, "代码重构", "Refactor")}</option><option value="architecture">{text(language, "架构调整", "Architecture change")}</option><option value="security">{text(language, "安全审查", "Security review")}</option><option value="deployment">{text(language, "部署", "Deployment")}</option><option value="maintenance">{text(language, "维护", "Maintenance")}</option></select></label>
        <label><span>{text(language, "用户原话或任务背景", "Original request or context")}</span><textarea rows={8} value={draft.original} onChange={(event) => update({ original: event.target.value })} placeholder={text(language, "描述当前发生了什么、希望改变什么，以及不能破坏什么。", "Describe what happens now, what should change, and what must not break.")} /></label>
        <button className="secondary-button full" onClick={assist} disabled={assisting || !draft.original.trim()}><Sparkles />{assisting ? text(language, "正在提取…", "Extracting…") : text(language, "用 AI 提取需求字段", "Extract requirement fields with AI")}</button>
        <button className="text-button" onClick={() => navigate("settings")}>{text(language, "配置 AI 服务", "Configure AI provider")}<ArrowRight /></button>
      </aside>

      <section className="requirement-editor">
        {section === "brief" && <div className="editor-section">
          <div className="section-heading"><h2>{text(language, "问题与目标", "Problem and goal")}</h2></div>
          <div className="form-grid two"><label><span>{text(language, "需求标题", "Requirement title")} *</span><input value={draft.title} onChange={(event) => update({ title: event.target.value })} placeholder={text(language, "例如：限制连续登录失败", "Example: Limit repeated login failures")} /></label><label><span>{text(language, "相关人员", "Stakeholders")}</span><input value={(draft.stakeholders || []).join("、")} onChange={(event) => update({ stakeholders: event.target.value.split(/[、,]/).map((item) => item.trim()).filter(Boolean) })} placeholder={text(language, "用户、产品负责人、安全负责人", "User, product owner, security owner")} /></label></div>
          <div className="form-grid two"><label><span>{text(language, "当前问题", "Current problem")} *</span><textarea rows={4} value={draft.userProblem} onChange={(event) => update({ userProblem: event.target.value })} placeholder={text(language, "谁在什么情况下遇到了什么问题？", "Who encounters which problem, and when?")} /></label><label><span>{text(language, "本次目标", "Target outcome")} *</span><textarea rows={4} value={draft.goal} onChange={(event) => update({ goal: event.target.value })} placeholder={text(language, "完成后应出现什么可观察的变化？", "What observable change should exist when this is complete?")} /></label></div>
          <fieldset className="story-builder"><legend>{text(language, "用户故事", "User story")} *</legend><div className="story-sentence"><span>{text(language, "作为", "As a")}</span><input value={draft.userStory?.role || ""} onChange={(event) => update({ userStory: { ...(draft.userStory || { role: "", goal: "", benefit: "" }), role: event.target.value } })} placeholder={text(language, "客户支持人员", "support agent")} /><span>{text(language, "我希望", "I want")}</span><input value={draft.userStory?.goal || ""} onChange={(event) => update({ userStory: { ...(draft.userStory || { role: "", goal: "", benefit: "" }), goal: event.target.value } })} placeholder={text(language, "统一查看客户订单", "to view customer orders in one place")} /><span>{text(language, "从而", "so that")}</span><input value={draft.userStory?.benefit || ""} onChange={(event) => update({ userStory: { ...(draft.userStory || { role: "", goal: "", benefit: "" }), benefit: event.target.value } })} placeholder={text(language, "更快解决问题", "I can resolve issues faster")} /></div></fieldset>
          <ListEditor language={language} label={text(language, "系统必须提供的行为", "Required system behavior")} prefix="FR" items={draft.functional} onChange={(functional) => update({ functional })} addLabel={text(language, "添加功能需求", "Add functional requirement")} help={text(language, "每项只写一个可观察行为；系统自动维护 FR 编号并用于测试追踪。", "Keep one observable behavior per item; FR IDs are maintained for test traceability.")} />
        </div>}

        {section === "acceptance" && <div className="editor-section">
          <div className="section-heading"><div><h2>{text(language, "验收条件", "Acceptance criteria")}</h2></div><button className="secondary-button" onClick={addAcceptance}><Plus />{text(language, "添加缺少的场景", "Add missing scenario")}</button></div>
          <div className="acceptance-coverage" aria-label={text(language, "验收场景覆盖", "Acceptance scenario coverage")}>{requiredAcceptanceKinds.map((kind) => { const complete = acceptance.some((item) => item.kind === kind && item.context.trim() && item.action.trim() && item.expected.trim()); return <span className={complete ? "complete" : ""} key={kind}>{complete ? <Check /> : <i />}{acceptanceLabel(language, kind)}</span>; })}</div>
          <div className="acceptance-list">{acceptance.map((item) => <article key={item.id} className="acceptance-row"><header><code>{item.id}</code><select value={item.kind} onChange={(event) => updateAcceptance(item.id, { kind: event.target.value as AcceptanceCriterion["kind"] })}><option value="normal">{acceptanceLabel(language, "normal")}</option><option value="boundary">{acceptanceLabel(language, "boundary")}</option><option value="failure">{acceptanceLabel(language, "failure")}</option><option value="security">{acceptanceLabel(language, "security")}</option><option value="regression">{acceptanceLabel(language, "regression")}</option></select><button className="icon-button" onClick={() => { const next = acceptance.filter((entry) => entry.id !== item.id); update({ acceptanceDetails: next, acceptanceCriteria: next.map((entry) => `${entry.id}: Given ${entry.context || "[context]"}, when ${entry.action || "[action]"}, then ${entry.expected || "[expected result]"}.`) }); }} aria-label={text(language, "删除场景", "Remove scenario")}><Trash2 /></button></header><div className="acceptance-sentence"><label><span>Given</span><input value={item.context} onChange={(event) => updateAcceptance(item.id, { context: event.target.value })} placeholder={text(language, "已知什么前提", "the starting condition")} /></label><label><span>When</span><input value={item.action} onChange={(event) => updateAcceptance(item.id, { action: event.target.value })} placeholder={text(language, "发生什么操作", "an action occurs")} /></label><label><span>Then</span><input value={item.expected} onChange={(event) => updateAcceptance(item.id, { expected: event.target.value })} placeholder={text(language, "应观察到什么结果", "the observable result")} /></label></div></article>)}</div>
          {!acceptance.length && <div className="inline-empty"><BookOpenCheck /><span>{text(language, "从正常流程开始，系统会依次建议尚未覆盖的场景类型。", "Start with the normal flow; the workspace then suggests each missing scenario type.")}</span></div>}
        </div>}

        {section === "quality" && <div className="editor-section">
          <div className="section-heading"><div><h2>{text(language, "质量要求", "Quality requirements")}</h2></div>{!qualityReady && <button className="primary-button" onClick={confirmQuality}><Check />{text(language, "确认这些要求", "Confirm requirements")}</button>}</div>
          <div className="quality-requirement-list">{(draft.qualityScenarios || []).map((scenario) => <article key={scenario.id}><header><span className={`quality-dot ${scenario.attribute}`} /><div><code>{scenario.id}</code><h3>{scenario.title}</h3></div><StatusBadge status={scenario.status === "confirmed" ? "passed" : "pending"} label={scenario.status === "confirmed" ? text(language, "已确认", "Confirmed") : text(language, "待确认", "Review")} language={language} /></header><dl><div><dt>{text(language, "适用场景", "Applies when")}</dt><dd>{scenario.condition}</dd></div><div><dt>{text(language, "系统必须做到", "Required response")}</dt><dd>{scenario.expectedResponse}</dd></div><div><dt>{text(language, "发布前如何验证", "Release evidence")}</dt><dd className="mono">{scenario.verification}</dd></div></dl></article>)}</div>
          <details className="scope-disclosure"><summary>{text(language, "约束、假设和本次范围", "Constraints, assumptions, and scope")}</summary><div className="disclosure-body"><ListEditor language={language} label={text(language, "约束", "Constraints")} prefix="CON" items={draft.constraints} onChange={(constraints) => update({ constraints })} addLabel={text(language, "添加约束", "Add constraint")} help={text(language, "记录不能改变的技术、时间、兼容性或合规边界。", "Record technology, time, compatibility, or compliance boundaries that cannot change.")} /><ListEditor language={language} label={text(language, "不在本次范围", "Out of scope")} prefix="OOS" items={draft.outOfScope} onChange={(outOfScope) => update({ outOfScope })} addLabel={text(language, "添加范围外事项", "Add out-of-scope item")} help={text(language, "明确排除项，避免实施范围在过程中扩大。", "Name exclusions so implementation scope does not expand silently.")} /></div></details>
        </div>}

        {error && <div className="inline-error" role="alert">{error}</div>}
        <footer className="requirement-actions"><span>{draft.status === "confirmed" ? text(language, "已确认", "Confirmed") : text(language, "草稿", "Draft")}</span><button className="secondary-button" disabled={draft.status === "confirmed"} onClick={() => onSave(draft)}>{text(language, "保存草稿", "Save draft")}</button><button className="primary-button" onClick={confirm}><Check />{text(language, "确认需求", "Confirm requirement")}</button></footer>
      </section>
    </div>
    {draft.status === "confirmed" && <div className="bottom-next"><b>{text(language, "需求已确认", "Requirement confirmed")}</b><button className="primary-button" onClick={() => navigate("plan")}>{text(language, "查看工程计划", "Open engineering plan")}<ArrowRight /></button></div>}
  </div>;
}
