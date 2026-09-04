"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  FileCheck2,
  FolderGit2,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  choiceById,
  defaultQualityProfile,
  performanceChoices,
  privacyChoices,
  processChoices,
  reliabilityChoices,
  requiredProjectArtifacts,
  requiredProjectChecks,
  securityChoices,
  type ChoiceEffect,
} from "../domain/course-policy";
import { policies } from "../domain/governance";
import type {
  Language,
  PerformanceProfile,
  PolicyProfile,
  PrivacyProfile,
  ProcessModel,
  Project,
  ReliabilityProfile,
  SecurityProfile,
} from "../domain/model";
import { validateProjectDraft, type ProjectDraft } from "../domain/project-validation";
import { text } from "./workspace-types";

const initialDraft: ProjectDraft = {
  name: "",
  description: "",
  softwareType: "Web application",
  stack: [],
  repository: "",
  branch: "main",
  environment: "Development",
  policyProfile: "standard",
  source: "blank",
  processModel: "agile",
  lifecycleStage: "discovery",
  teamSize: "small",
  releaseStrategy: "staged",
  aiAssisted: true,
  executionTarget: "hosted-assist",
  localWorkspaceName: "",
  qualityProfile: defaultQualityProfile,
  customRequiredChecks: ["build", "unit-tests", "security-review", "policy-check"],
};

const checkChoices = [
  ["build", "Build"],
  ["lint", "Lint"],
  ["type-check", "Type check"],
  ["unit-tests", "Unit tests"],
  ["integration-tests", "Integration tests"],
  ["dependency-audit", "Dependency audit"],
  ["security-review", "Security review"],
  ["policy-check", "Policy check"],
] as const;

function locale(language: Language, value: { zh: string; en: string }) {
  return language === "zh" ? value.zh : value.en;
}

function ChoiceCards<T extends string>({ language, choices, selected, onSelect }: {
  language: Language;
  choices: ChoiceEffect<T>[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return <div className="choice-card-list">{choices.map((choice) => <button
    type="button"
    key={choice.id}
    className={`choice-card ${selected === choice.id ? "selected" : ""}`}
    onClick={() => onSelect(choice.id)}
    aria-pressed={selected === choice.id}
  >
    <span><b>{locale(language, choice.name)}</b><small>{locale(language, choice.summary)}</small></span>
    <CheckCircle2 aria-hidden="true" />
  </button>)}</div>;
}

function EffectPanel({ language, choice }: { language: Language; choice: ChoiceEffect<string> }) {
  return <aside className="choice-effect" aria-live="polite">
    <div className="choice-effect-title"><span><ShieldCheck /></span><div><small>{text(language, "选择结果", "Selection effect")}</small><h3>{locale(language, choice.name)}</h3></div></div>
    <p>{locale(language, choice.chooseWhen)}</p>
    <dl>
      <div><dt>{text(language, "工程控制", "Engineering controls")}</dt><dd>{choice.controls.map((item) => <span key={item.en}><Check />{locale(language, item)}</span>)}</dd></div>
      <div><dt>{text(language, "会阻止发布", "Release is blocked when")}</dt><dd>{choice.releaseBlocks.map((item) => <span key={item.en}><X />{locale(language, item)}</span>)}</dd></div>
      <div><dt>{text(language, "新增检查", "Checks added")}</dt><dd className="token-list">{choice.checks.map((item) => <code key={item}>{item}</code>)}</dd></div>
    </dl>
  </aside>;
}

export function CreateProjectDialog({ open, language, onOpenChange, onCreate }: {
  open: boolean;
  language: Language;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: ProjectDraft) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [qualitySection, setQualitySection] = useState<"security" | "privacy" | "reliability" | "performance">("security");
  const [draft, setDraft] = useState<ProjectDraft>(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const stackRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const repositoryRef = useRef<HTMLInputElement>(null);
  const branchRef = useRef<HTMLInputElement>(null);
  const localWorkspaceRef = useRef<HTMLInputElement>(null);
  const customChecksRef = useRef<HTMLFieldSetElement>(null);
  const update = (patch: Partial<ProjectDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    for (const key of Object.keys(patch)) setErrors((current) => ({ ...current, [key]: "" }));
  };
  const updateQuality = (patch: Partial<NonNullable<ProjectDraft["qualityProfile"]>>) => {
    update({ qualityProfile: { ...(draft.qualityProfile || defaultQualityProfile), ...patch } });
  };
  const messages: Record<string, string> = {
    name: text(language, "请输入项目名称。", "Enter a project name."),
    description: text(language, "请说明这个项目要解决的问题。", "Describe the problem this project solves."),
    stack: text(language, "至少选择或填写一项主要技术。", "Add at least one primary technology."),
    repository: text(language, "请输入完整的公开 GitHub 仓库地址。", "Enter a complete public GitHub repository URL."),
    branch: text(language, "请输入默认分支。", "Enter the default branch."),
    localWorkspaceName: text(language, "请输入本地工作区的识别名称。", "Enter a label for the local workspace."),
    customRequiredChecks: text(language, "自定义策略至少保留一项强制检查。", "A custom policy needs at least one mandatory check."),
  };
  const validate = () => {
    const next: Record<string, string> = {};
    const invalidFields = validateProjectDraft(draft, step);
    for (const field of invalidFields) next[field] = messages[field];
    setErrors(next);
    if (invalidFields.length) {
      const targets: Record<string, HTMLElement | null> = {
        name: nameRef.current,
        stack: stackRef.current,
        description: descriptionRef.current,
        repository: repositoryRef.current,
        branch: branchRef.current,
        localWorkspaceName: localWorkspaceRef.current,
        customRequiredChecks: customChecksRef.current,
      };
      requestAnimationFrame(() => targets[invalidFields[0]]?.focus());
    }
    return Object.keys(next).length === 0;
  };
  const next = () => {
    if (!validate()) return;
    setStep((current) => Math.min(4, current + 1) as 1 | 2 | 3 | 4);
  };
  const submit = () => {
    if (!validate()) return;
    onCreate({ ...draft, repository: draft.repository?.trim() || undefined });
    setDraft(initialDraft);
    setStep(1);
    setQualitySection("security");
  };
  const quality = draft.qualityProfile || defaultQualityProfile;
  const activeQualityChoice = qualitySection === "security"
    ? choiceById(securityChoices, quality.security)
    : qualitySection === "privacy"
      ? choiceById(privacyChoices, quality.privacy)
      : qualitySection === "reliability"
        ? choiceById(reliabilityChoices, quality.reliability)
        : choiceById(performanceChoices, quality.performance);
  const previewProject = useMemo(() => ({ ...draft, id: "preview", createdAt: "", updatedAt: "" }) as Project, [draft]);
  const artifacts = requiredProjectArtifacts(previewProject);
  const checks = requiredProjectChecks(previewProject);
  const process = choiceById(processChoices, draft.processModel || "agile");
  const policy = policies.find((item) => item.id === draft.policyProfile) || policies[0];

  return <Dialog.Root open={open} onOpenChange={(value) => {
    onOpenChange(value);
    if (!value) { setStep(1); setErrors({}); setQualitySection("security"); }
  }}>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="dialog-content project-dialog-v2" aria-describedby="create-project-description">
        <header className="dialog-header">
          <div><p className="eyebrow">{text(language, `创建项目 · 第 ${step} 步，共 4 步`, `Create project · Step ${step} of 4`)}</p><Dialog.Title>{[
            text(language, "项目与代码来源", "Project and code source"),
            text(language, "交付方式", "Delivery approach"),
            text(language, "质量与数据边界", "Quality and data boundaries"),
            text(language, "确认治理方案", "Confirm governance profile"),
          ][step - 1]}</Dialog.Title><Dialog.Description id="create-project-description">{[
            text(language, "先说明产品解决什么问题，以及代码目前在哪里。", "Start with the problem and where the code currently lives."),
            text(language, "这些选择决定计划节奏、反馈方式和发布路径。", "These choices set planning cadence, feedback, and release flow."),
            text(language, "选择最接近真实业务的场景，系统会生成对应门禁。", "Choose the closest real-world scenario; the system derives matching gates."),
            text(language, "创建前检查将要生成的工件、检查和审批要求。", "Review the artifacts, checks, and approvals before creation."),
          ][step - 1]}</Dialog.Description></div>
          <Dialog.Close className="icon-button" aria-label={text(language, "关闭", "Close")}><X /></Dialog.Close>
        </header>
        <div className="dialog-progress" aria-label={text(language, "创建进度", "Creation progress")}>{[1, 2, 3, 4].map((value) => <span key={value} className={step >= value ? "active" : ""} />)}</div>

        <div className="project-dialog-body">
          {step === 1 && <div className="project-step">
            <fieldset className="source-picker"><legend>{text(language, "代码来源", "Code source")}</legend>
              {[
                { id: "blank", icon: FileCheck2, zh: "先建立空项目", en: "Start without a repository", noteZh: "先整理需求和工程方案，稍后再连接代码。", noteEn: "Structure requirements and governance first; connect code later." },
                { id: "github-public", icon: FolderGit2, zh: "公开 GitHub 仓库", en: "Public GitHub repository", noteZh: "读取公开文件树做接入检查，不执行仓库代码。", noteEn: "Read the public file tree for adoption checks." },
                { id: "local-codex", icon: Code2, zh: "本地 Codex 工作区", en: "Local Codex workspace", noteZh: "通过本机 runner 让 Codex CLI 在指定目录工作。", noteEn: "Use the local runner to operate Codex CLI in one approved directory." },
              ].map((option) => <label key={option.id} className={`source-option ${draft.source === option.id ? "selected" : ""}`}><input type="radio" name="source" checked={draft.source === option.id} onChange={() => update({ source: option.id as ProjectDraft["source"], executionTarget: option.id === "local-codex" ? "local-codex" : option.id === "github-public" ? "evidence-import" : "hosted-assist" })} /><option.icon /><span><b>{text(language, option.zh, option.en)}</b><small>{text(language, option.noteZh, option.noteEn)}</small></span><Check /></label>)}
            </fieldset>
            <div className="form-grid two">
              <label htmlFor="project-name"><span>{text(language, "项目名称", "Project name")} *</span><input ref={nameRef} id="project-name" value={draft.name} onChange={(event) => update({ name: event.target.value })} placeholder={text(language, "例如：客户服务门户", "Example: Customer support portal")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "project-name-error" : undefined} />{errors.name && <small id="project-name-error" className="field-error">{errors.name}</small>}</label>
              <label htmlFor="project-stack"><span>{text(language, "主要技术", "Primary stack")} *</span><input ref={stackRef} id="project-stack" value={draft.stack.join(", ")} onChange={(event) => update({ stack: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="TypeScript, React, PostgreSQL" aria-invalid={Boolean(errors.stack)} aria-describedby={errors.stack ? "project-stack-error" : undefined} />{errors.stack && <small id="project-stack-error" className="field-error">{errors.stack}</small>}</label>
            </div>
            <label htmlFor="project-description"><span>{text(language, "这个项目解决什么问题", "What problem does this project solve")} *</span><textarea ref={descriptionRef} id="project-description" rows={3} value={draft.description} onChange={(event) => update({ description: event.target.value })} placeholder={text(language, "例如：让客户在一个入口查询订单并提交售后申请。", "Example: Give customers one place to view orders and request support.")} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "project-description-error" : undefined} />{errors.description && <small id="project-description-error" className="field-error">{errors.description}</small>}</label>
            <div className="form-grid two">
              <label><span>{text(language, "软件类型", "Software type")}</span><select value={draft.softwareType} onChange={(event) => update({ softwareType: event.target.value })}>{["Web application", "Mobile application", "Server/API", "Desktop application", "Cloud service", "Embedded/IoT", "AI/Agent", "Library/SDK", "CLI"].map((value) => <option key={value}>{value}</option>)}</select></label>
              {draft.source === "github-public" && <label htmlFor="project-repository"><span>{text(language, "公开 GitHub 地址", "Public GitHub URL")} *</span><input ref={repositoryRef} id="project-repository" value={draft.repository || ""} onChange={(event) => update({ repository: event.target.value })} placeholder="https://github.com/org/repo" aria-invalid={Boolean(errors.repository)} aria-describedby={errors.repository ? "project-repository-error" : undefined} />{errors.repository && <small id="project-repository-error" className="field-error">{errors.repository}</small>}</label>}
              {draft.source === "local-codex" && <label htmlFor="project-local-workspace"><span>{text(language, "本地工作区名称", "Local workspace label")} *</span><input ref={localWorkspaceRef} id="project-local-workspace" value={draft.localWorkspaceName || ""} onChange={(event) => update({ localWorkspaceName: event.target.value })} placeholder={text(language, "例如：customer-portal-local", "Example: customer-portal-local")} aria-invalid={Boolean(errors.localWorkspaceName)} aria-describedby={errors.localWorkspaceName ? "project-local-workspace-error" : undefined} />{errors.localWorkspaceName && <small id="project-local-workspace-error" className="field-error">{errors.localWorkspaceName}</small>}</label>}
            </div>
          </div>}

          {step === 2 && <div className="project-step delivery-step">
            <div className="form-grid two">
              <label><span>{text(language, "当前阶段", "Current stage")}</span><select value={draft.lifecycleStage} onChange={(event) => update({ lifecycleStage: event.target.value as ProjectDraft["lifecycleStage"] })}><option value="discovery">{text(language, "需求探索", "Discovery")}</option><option value="development">{text(language, "开发中", "Development")}</option><option value="production">{text(language, "已上线", "Production")}</option><option value="maintenance">{text(language, "维护演化", "Maintenance")}</option></select></label>
              <label><span>{text(language, "团队规模", "Team size")}</span><select value={draft.teamSize} onChange={(event) => update({ teamSize: event.target.value as ProjectDraft["teamSize"] })}><option value="solo">1</option><option value="small">2-5</option><option value="medium">6-20</option><option value="large">20+</option></select></label>
              <label htmlFor="project-branch"><span>{text(language, "默认分支", "Default branch")} *</span><input ref={branchRef} id="project-branch" value={draft.branch} onChange={(event) => update({ branch: event.target.value })} aria-invalid={Boolean(errors.branch)} aria-describedby={errors.branch ? "project-branch-error" : undefined} />{errors.branch && <small id="project-branch-error" className="field-error">{errors.branch}</small>}</label>
              <label><span>{text(language, "发布方式", "Release strategy")}</span><select value={draft.releaseStrategy} onChange={(event) => update({ releaseStrategy: event.target.value as ProjectDraft["releaseStrategy"] })}><option value="manual">{text(language, "人工发布", "Manual release")}</option><option value="staged">{text(language, "分阶段发布", "Staged release")}</option><option value="continuous">{text(language, "持续交付", "Continuous delivery")}</option></select></label>
            </div>
            <fieldset className="process-picker"><legend>{text(language, "开发流程", "Delivery process")}</legend><ChoiceCards language={language} choices={processChoices} selected={draft.processModel || "agile"} onSelect={(id: ProcessModel) => update({ processModel: id })} /></fieldset>
            <EffectPanel language={language} choice={process} />
            <label className="setting-toggle"><span><b>{text(language, "使用 AI 辅助工程工作", "Use AI-assisted engineering")}</b><small>{text(language, "AI 可整理需求、分析和计划草稿；测试与发布结论仍来自检查和负责人。", "AI may draft requirements, analysis, and plans; checks and owners still determine test and release results.")}</small></span><input type="checkbox" checked={Boolean(draft.aiAssisted)} onChange={(event) => update({ aiAssisted: event.target.checked })} /></label>
          </div>}

          {step === 3 && <div className="project-step quality-step">
            <nav className="quality-tabs" aria-label={text(language, "质量场景", "Quality scenarios")}>{([
              ["security", LockKeyhole, text(language, "安全", "Security")],
              ["privacy", UserRoundCheck, text(language, "隐私", "Privacy")],
              ["reliability", ShieldCheck, text(language, "可靠性", "Reliability")],
              ["performance", Gauge, text(language, "性能", "Performance")],
            ] as const).map(([id, Icon, label]) => <button type="button" aria-pressed={qualitySection === id} key={id} className={qualitySection === id ? "active" : ""} onClick={() => setQualitySection(id)}><Icon />{label}</button>)}</nav>
            <div className="quality-config">
              <div>
                {qualitySection === "security" && <ChoiceCards language={language} choices={securityChoices} selected={quality.security} onSelect={(id: SecurityProfile) => updateQuality({ security: id })} />}
                {qualitySection === "privacy" && <ChoiceCards language={language} choices={privacyChoices} selected={quality.privacy} onSelect={(id: PrivacyProfile) => updateQuality({ privacy: id })} />}
                {qualitySection === "reliability" && <ChoiceCards language={language} choices={reliabilityChoices} selected={quality.reliability} onSelect={(id: ReliabilityProfile) => updateQuality({ reliability: id })} />}
                {qualitySection === "performance" && <ChoiceCards language={language} choices={performanceChoices} selected={quality.performance} onSelect={(id: PerformanceProfile) => updateQuality({ performance: id })} />}
              </div>
              <EffectPanel language={language} choice={activeQualityChoice} />
            </div>
          </div>}

          {step === 4 && <div className="project-step review-step">
            <fieldset className="policy-picker-v2"><legend>{text(language, "治理强度", "Governance level")}</legend>{policies.map((item) => <label key={item.id} className={draft.policyProfile === item.id ? "selected" : ""}><input type="radio" name="policy" checked={draft.policyProfile === item.id} onChange={() => update({ policyProfile: item.id as PolicyProfile })} /><span><b>{item.name}</b><small>{item.id === "strict" ? text(language, "警告会阻止发布；增加集成、依赖和独立安全审批。", "Warnings block release; integration, dependency, and independent security approval are added.") : item.id === "custom" ? text(language, "自行选择机器检查；需求、测试、安全和发布证据仍不可移除。", "Choose machine checks; requirements, testing, security, and release evidence remain mandatory.") : text(language, "适合常规产品迭代；失败阻止发布，警告需要负责人处理。", "For normal product work; failures block release and owners must address warnings.")}</small></span><Check /></label>)}</fieldset>
            {draft.policyProfile === "custom" && <fieldset ref={customChecksRef} tabIndex={-1} className="custom-checks" aria-invalid={Boolean(errors.customRequiredChecks)} aria-describedby={errors.customRequiredChecks ? "project-custom-checks-error" : undefined}><legend>{text(language, "强制机器检查", "Mandatory machine checks")}</legend>{checkChoices.map(([id, label]) => <label key={id}><input type="checkbox" checked={draft.customRequiredChecks?.includes(id) || false} onChange={(event) => update({ customRequiredChecks: event.target.checked ? [...new Set([...(draft.customRequiredChecks || []), id])] : (draft.customRequiredChecks || []).filter((item) => item !== id) })} />{label}</label>)}{errors.customRequiredChecks && <small id="project-custom-checks-error" className="field-error">{errors.customRequiredChecks}</small>}</fieldset>}
            <div className="governance-preview">
              <div><span className="preview-icon"><FileCheck2 /></span><p><small>{text(language, "将建立", "Will create")}</small><strong>{artifacts.length}</strong>{text(language, " 类工程工件", " artifact types")}</p></div>
              <div><span className="preview-icon"><Gauge /></span><p><small>{text(language, "将要求", "Will require")}</small><strong>{[...new Set([...policy.requiredChecks, ...checks])].length}</strong>{text(language, " 项检查", " checks")}</p></div>
              <div><span className="preview-icon"><UserRoundCheck /></span><p><small>{text(language, "发布审批", "Release approval")}</small><strong>{policy.requiredApprovals?.length || 1}</strong>{text(language, " 个责任角色", " responsible roles")}</p></div>
            </div>
            <div className="review-columns">
              <section><h3>{text(language, "首先生成的工程工件", "Initial engineering artifacts")}</h3><ul>{artifacts.slice(0, 9).map((item) => <li key={item}><Check />{item}</li>)}</ul>{artifacts.length > 9 && <small>+{artifacts.length - 9} {text(language, "项", "more")}</small>}</section>
              <section><h3>{text(language, "发布前必须有结果", "Required before release")}</h3><ul>{[...new Set([...policy.requiredChecks, ...checks])].slice(0, 9).map((item) => <li key={item}><Check />{item}</li>)}</ul></section>
            </div>
            <div className="execution-summary"><Cloud /><div><b>{draft.executionTarget === "local-codex" ? text(language, "本地 Codex CLI 执行", "Local Codex CLI execution") : draft.executionTarget === "evidence-import" ? text(language, "仓库检查与验证结果导入", "Repository checks and evidence import") : text(language, "托管 AI 辅助与本地证据", "Hosted AI assistance with local evidence")}</b><p>{draft.executionTarget === "local-codex" ? text(language, "创建后在设置中连接本机 runner；每次写入代码前仍需明确确认。", "Connect the local runner after creation; code-writing still requires explicit confirmation.") : text(language, "创建后先确认需求。系统不会把草稿或未知结果当成验证通过。", "Confirm the requirement after creation. Drafts and unknown results never count as validation passes.")}</p></div></div>
          </div>}
        </div>

        <footer className="dialog-footer">
          {step > 1 ? <button className="secondary-button" onClick={() => setStep((current) => Math.max(1, current - 1) as 1 | 2 | 3 | 4)}><ArrowLeft />{text(language, "上一步", "Back")}</button> : <span />}
          {step < 4 ? <button className="primary-button" onClick={next}>{text(language, "下一步", "Next")}<ArrowRight /></button> : <button className="primary-button" onClick={submit}>{text(language, "创建工程工作区", "Create engineering workspace")}<Check /></button>}
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
