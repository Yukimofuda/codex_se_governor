import type { Language, Project, WorkflowStage, WorkspaceState } from "../domain/model";

export type ViewId = "overview" | "projects" | "requirements" | "plan" | "run" | "checks" | "evidence" | "release" | "history" | "settings";

export type WorkspacePageProps = {
  language: Language;
  workspace: WorkspaceState;
  project?: Project;
  navigate: (view: ViewId) => void;
};

export function text(language: Language, zh: string, en: string) {
  return language === "zh" ? zh : en;
}

const stageNames: Record<WorkflowStage["key"], string> = {
  context: "项目上下文",
  requirements: "需求确认",
  "user-story": "用户故事",
  analysis: "问题分析",
  design: "设计与架构",
  "risk-quality": "风险与质量",
  planning: "实施计划",
  implementation: "实现",
  validation: "确定性验证",
  testing: "测试",
  security: "安全审查",
  documentation: "文档与交付",
  release: "发布决定",
  retrospective: "回顾与维护",
};

export function stageText(language: Language, stage: Pick<WorkflowStage, "key" | "label">) {
  return language === "zh" ? stageNames[stage.key] : stage.label;
}

export function findingText(language: Language, value: string) {
  if (language !== "zh") return value;
  const exact: Record<string, string> = {
    "Validate the source-address proxy header before release.": "发布前确认来源地址只读取受信任代理提供的请求头。",
    "Security review has one unresolved warning.": "安全审查仍有一项警告未处理。",
    "A workflow stage has failed.": "工作流中有阶段失败。",
    "One or more deterministic checks failed.": "至少一项确定性检查失败。",
    "The selected policy blocks release while a check has a warning.": "当前治理策略不允许带有检查警告的版本发布。",
    "Validation warnings require an explicit human decision.": "检查警告需要项目负责人明确处理。",
    "No verified validation evidence is attached to this run.": "当前运行尚未关联已验证的检查结果。",
    "Release owner approval is required.": "发布前需要项目负责人批准。",
  };
  if (exact[value]) return exact[value];
  if (value.startsWith("Required check is missing: ")) return `缺少发布策略要求的检查：${value.slice(27)}`;
  if (value.startsWith("Required artifact is missing: ")) return `缺少发布策略要求的工件：${value.slice(30)}`;
  if (value.startsWith("Required artifact still needs confirmation: ")) return `必需工件尚未确认：${value.slice(44)}`;
  if (value.endsWith(" has no completed evidence.")) return `${value.slice(0, -27)} 阶段尚未完成。`;
  return value;
}

const recordTranslations: Record<string, string> = {
  "One proxy-trust warning must be resolved": "必须先处理代理信任边界警告",
  "Blocked by unresolved security warning": "仍有安全警告，暂不可发布",
  "Starts after release decision": "发布决定完成后再开始回顾",
  "Implementation returned for correction": "实现已退回修正",
  "Reset-after-success regression": "成功登录后计数器未重置",
  "Blocked by failed tests": "测试失败，后续阶段未开始",
  "Recorded project profile": "录制示例的项目资料",
  "Build": "构建",
  "Unit tests": "单元测试",
  "Security review": "安全审查",
  "Governance policy": "治理策略",
  "Production build completed.": "生产构建已完成。",
  "18 tests passed, including boundary and reset cases.": "18 项测试通过，覆盖边界条件和计数器重置。",
  "Source-address counters need proxy-header validation before release.": "发布前必须验证来源地址只取自受信任代理头。",
  "Required artifacts and traceability are present.": "必需工件与追踪关系完整。",
  "The reset-after-success case failed.": "成功登录后重置计数器的回归用例失败。",
  "Web API, account data, staged release, strict governance.": "Web API；处理账户数据；分阶段发布；严格治理策略。",
  "Requirement, constraints and acceptance criteria approved.": "需求、约束和验收条件已经确认。",
  "Account-holder outcome and three acceptance criteria confirmed.": "账户持有者目标与三项验收条件已经确认。",
  "Account, source-address, rolling-window and proxy trust boundaries analyzed.": "已分析账户、来源地址、滚动时间窗和代理信任边界。",
  "Existing cache service selected with feature-flag rollback.": "复用现有缓存服务，并以功能开关作为回滚手段。",
  "Lockout, proxy spoofing and latency risks have owners and tests.": "误锁、代理伪造和延迟风险均已指定负责人和测试。",
  "Fourteen-stage plan with artifacts, checks and risks.": "工程计划包含 14 个阶段及对应工件、检查和风险。",
  "Feature-flagged rate-limit policy implemented in commit 7f3a21b.": "提交 7f3a21b 已实现受功能开关控制的限流策略。",
  "Build passed in 12.4 seconds.": "构建在 12.4 秒内通过。",
  "18 requirement-linked tests passed.": "18 项关联需求的测试全部通过。",
  "One proxy trust warning remains open.": "仍有一项代理信任边界警告未处理。",
  "Staged rollout, monitoring and rollback steps documented.": "分阶段发布、监控与回滚步骤已有记录。",
  "Standard governance validation passed.": "标准治理验证已通过。",
  "Successful login did not reset the failure counter.": "成功登录后失败计数器没有重置。",
  "Project context": "项目上下文",
  "Confirmed requirement snapshot": "已确认需求快照",
  "User story": "用户故事",
  "Domain analysis": "问题域分析",
  "Design and ADR": "设计与架构决策",
  "Risk and quality review": "风险与质量审查",
  "Approved execution plan": "已批准工程计划",
  "Implementation diff": "实现变更",
  "Build log": "构建日志",
  "Test report": "测试报告",
  "Security review decision": "安全审查决定",
  "Deployment and maintenance plan": "部署与维护计划",
  "Governor validation result": "治理验证结果",
  "Failed test output": "失败测试输出",
};

export function recordText(language: Language, value: string) {
  return language === "zh" ? recordTranslations[value] || findingText(language, value) : value;
}
