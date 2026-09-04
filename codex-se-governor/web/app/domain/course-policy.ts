import type {
  PerformanceProfile,
  PrivacyProfile,
  ProcessModel,
  Project,
  ProjectQualityProfile,
  QualityScenario,
  ReliabilityProfile,
  SecurityProfile,
  WorkflowStage,
} from "./model";

export type Localized = { zh: string; en: string };

export type ChoiceEffect<T extends string> = {
  id: T;
  name: Localized;
  summary: Localized;
  chooseWhen: Localized;
  controls: Localized[];
  releaseBlocks: Localized[];
  artifacts: string[];
  checks: string[];
};

export type LifecycleDefinition = {
  key: WorkflowStage["key"];
  name: Localized;
  purpose: Localized;
  actor: WorkflowStage["actor"];
  artifactNames: string[];
  completion: Localized;
  risk: Localized;
};

export const defaultQualityProfile: ProjectQualityProfile = {
  security: "account-data",
  privacy: "personal-data",
  reliability: "business-critical",
  performance: "baseline-first",
  compliance: [],
};

export const securityChoices: ChoiceEffect<SecurityProfile>[] = [
  {
    id: "public-content",
    name: { zh: "公开内容，不含账户", en: "Public content, no accounts" },
    summary: { zh: "只发布公开信息，不处理登录、支付、密钥或个人资料。", en: "Publishes public information without accounts, payments, secrets, or personal profiles." },
    chooseWhen: { zh: "适合公开文档、作品页和不保存用户身份的工具。", en: "Use for public docs, portfolios, and tools that do not retain identity." },
    controls: [
      { zh: "校验所有输入和下载文件名", en: "Validate all input and download filenames" },
      { zh: "依赖与错误信息不得暴露密钥", en: "Dependencies and errors must not expose secrets" },
    ],
    releaseBlocks: [
      { zh: "发现可执行注入或凭据泄露", en: "Executable injection or credential exposure is found" },
      { zh: "基础安全检查未运行", en: "Baseline security checks were not run" },
    ],
    artifacts: ["SECURITY_REVIEW.md"],
    checks: ["input-validation", "secret-scan", "security-review"],
  },
  {
    id: "account-data",
    name: { zh: "账户与业务数据", en: "Accounts and business data" },
    summary: { zh: "包含登录、权限、订单、团队空间或非公开业务数据。", en: "Includes sign-in, permissions, orders, team workspaces, or private business data." },
    chooseWhen: { zh: "大多数有登录功能的 Web、移动端和 SaaS 产品选择此项。", en: "Use for most signed-in web, mobile, and SaaS products." },
    controls: [
      { zh: "服务端认证与逐资源授权", en: "Server-side authentication and per-resource authorization" },
      { zh: "密钥隔离、审计日志和滥用防护", en: "Secret isolation, audit logging, and abuse protection" },
      { zh: "安全失败路径和回归测试", en: "Security failure-path and regression tests" },
    ],
    releaseBlocks: [
      { zh: "授权边界没有测试证据", en: "Authorization boundaries have no test evidence" },
      { zh: "高风险安全发现未处理", en: "A high-risk security finding is unresolved" },
    ],
    artifacts: ["SECURITY_REVIEW.md", "RISK_REGISTER.md", "TEST_CASE_MATRIX.md"],
    checks: ["auth-boundary", "secret-scan", "security-tests", "security-review"],
  },
  {
    id: "sensitive-data",
    name: { zh: "敏感或受监管数据", en: "Sensitive or regulated data" },
    summary: { zh: "涉及支付、健康、身份凭证、儿童数据或受监管记录。", en: "Handles payments, health data, identity credentials, children data, or regulated records." },
    chooseWhen: { zh: "数据泄露会造成重大人身、法律或财务影响时选择。", en: "Use when disclosure could cause material personal, legal, or financial harm." },
    controls: [
      { zh: "威胁模型、最小权限、传输与静态加密", en: "Threat model, least privilege, and encryption in transit and at rest" },
      { zh: "数据保留、删除和访问审计", en: "Data retention, deletion, and access auditing" },
      { zh: "独立安全审批与分阶段发布", en: "Independent security approval and staged release" },
    ],
    releaseBlocks: [
      { zh: "威胁模型或人工安全批准缺失", en: "Threat model or human security approval is missing" },
      { zh: "任何未接受的中高风险发现", en: "Any unaccepted medium or high-risk finding" },
    ],
    artifacts: ["SECURITY_REVIEW.md", "RISK_REGISTER.md", "ADR.md", "DEPLOYMENT_PLAN.md"],
    checks: ["threat-model", "auth-boundary", "dependency-audit", "security-tests", "human-security-approval"],
  },
];

export const privacyChoices: ChoiceEffect<PrivacyProfile>[] = [
  {
    id: "no-personal-data",
    name: { zh: "不保存个人数据", en: "No personal data stored" },
    summary: { zh: "输入不会与可识别个人身份关联，任务结束后不保留内容。", en: "Input is not linked to an identifiable person and is not retained after the task." },
    chooseWhen: { zh: "适合本地工具、公开内容和匿名临时处理。", en: "Use for local tools, public content, and anonymous temporary processing." },
    controls: [{ zh: "禁止日志记录原始输入", en: "Do not log raw input" }],
    releaseBlocks: [{ zh: "实现实际保存了个人数据但项目仍声明不保存", en: "The implementation stores personal data despite this declaration" }],
    artifacts: ["REQUIREMENTS.md", "SECURITY_REVIEW.md"],
    checks: ["data-flow-review"],
  },
  {
    id: "personal-data",
    name: { zh: "基本个人资料", en: "Basic personal data" },
    summary: { zh: "保存姓名、邮箱、账号标识、使用记录或设备信息。", en: "Stores names, email addresses, account IDs, usage records, or device information." },
    chooseWhen: { zh: "产品能识别用户，或需要用户账户和历史记录时选择。", en: "Use when the product identifies users or keeps account history." },
    controls: [{ zh: "明确收集目的、保存期限、访问和删除路径", en: "Define purpose, retention, access, and deletion paths" }],
    releaseBlocks: [{ zh: "缺少删除路径或超出声明目的使用数据", en: "Deletion is unavailable or data is used beyond its stated purpose" }],
    artifacts: ["REQUIREMENTS.md", "SECURITY_REVIEW.md", "MAINTENANCE_TASK.md"],
    checks: ["privacy-flow", "retention-review"],
  },
  {
    id: "sensitive-personal-data",
    name: { zh: "敏感个人数据", en: "Sensitive personal data" },
    summary: { zh: "包含身份凭证、财务、健康、生物特征或其他高影响信息。", en: "Includes credentials, financial, health, biometric, or other high-impact information." },
    chooseWhen: { zh: "误用或泄露会直接伤害个人权益时选择。", en: "Use when misuse or disclosure could directly harm a person." },
    controls: [{ zh: "数据最小化、字段级访问控制、加密和审计", en: "Data minimization, field-level access control, encryption, and audit" }],
    releaseBlocks: [{ zh: "数据流、保留策略或隐私负责人批准缺失", en: "Data flow, retention policy, or privacy-owner approval is missing" }],
    artifacts: ["REQUIREMENTS.md", "SECURITY_REVIEW.md", "ADR.md", "RISK_REGISTER.md"],
    checks: ["privacy-threat-model", "data-minimization", "human-privacy-approval"],
  },
];

export const reliabilityChoices: ChoiceEffect<ReliabilityProfile>[] = [
  {
    id: "recoverable",
    name: { zh: "可人工重试", en: "Manual retry is acceptable" },
    summary: { zh: "短时失败可被发现，用户可以重试，且不会丢失关键数据。", en: "Short failures are visible, users can retry, and critical data is not lost." },
    chooseWhen: { zh: "适合内部工具、低频任务和非关键批处理。", en: "Use for internal tools, infrequent work, and non-critical batch processing." },
    controls: [{ zh: "明确错误提示、重试和数据一致性检查", en: "Clear errors, retry behavior, and data consistency checks" }],
    releaseBlocks: [{ zh: "失败会静默丢失数据", en: "Failure can silently lose data" }],
    artifacts: ["TEST_PLAN.md", "MAINTENANCE_TASK.md"],
    checks: ["failure-path-tests"],
  },
  {
    id: "business-critical",
    name: { zh: "业务中断需快速恢复", en: "Business interruption needs quick recovery" },
    summary: { zh: "服务中断会影响客户或核心流程，需要监控、恢复步骤和回滚。", en: "Outages affect customers or core operations and require monitoring, recovery, and rollback." },
    chooseWhen: { zh: "适合在线业务系统、付费 SaaS 和主要 API。", en: "Use for online business systems, paid SaaS, and primary APIs." },
    controls: [{ zh: "健康检查、告警、幂等重试和已演练回滚", en: "Health checks, alerts, idempotent retry, and exercised rollback" }],
    releaseBlocks: [{ zh: "没有恢复步骤、监控指标或回滚负责人", en: "Recovery steps, monitoring, or rollback ownership is missing" }],
    artifacts: ["DEPLOYMENT_PLAN.md", "RISK_REGISTER.md", "MAINTENANCE_TASK.md"],
    checks: ["recovery-test", "monitoring-review", "rollback-review"],
  },
  {
    id: "high-availability",
    name: { zh: "持续可用是硬要求", en: "Continuous availability is mandatory" },
    summary: { zh: "中断会造成重大损失，需要冗余、自动恢复和灾难恢复演练。", en: "Downtime causes material harm and requires redundancy, automatic recovery, and disaster-recovery exercises." },
    chooseWhen: { zh: "仅在确有高可用责任和运维能力时选择。", en: "Use only when high availability is a real obligation backed by operations capacity." },
    controls: [{ zh: "定义可用性目标、故障域、自动切换和恢复演练", en: "Define availability objective, failure domains, failover, and recovery exercises" }],
    releaseBlocks: [{ zh: "关键单点故障未处理或恢复演练失败", en: "A critical single point of failure remains or recovery exercise fails" }],
    artifacts: ["ADR.md", "DEPLOYMENT_PLAN.md", "RISK_REGISTER.md", "TEST_PLAN.md"],
    checks: ["architecture-resilience", "failover-test", "recovery-exercise", "human-operations-approval"],
  },
];

export const performanceChoices: ChoiceEffect<PerformanceProfile>[] = [
  {
    id: "baseline-first",
    name: { zh: "先测量，再设目标", en: "Measure before setting a target" },
    summary: { zh: "当前没有可信数据；先记录真实基线，再由负责人确认目标。", en: "No trusted data exists yet; measure a real baseline before the owner confirms a target." },
    chooseWhen: { zh: "不确定合理阈值时选择，不需要凭空填写毫秒数。", en: "Use when the right threshold is unknown; no invented millisecond target is required." },
    controls: [{ zh: "发布前记录关键路径、测试环境和基线结果", en: "Record the critical path, test environment, and baseline before release" }],
    releaseBlocks: [{ zh: "性能会影响核心体验但仍没有基线", en: "Performance affects the core experience but no baseline exists" }],
    artifacts: ["QUALITY_ATTRIBUTE_SCENARIOS.md", "TEST_PLAN.md"],
    checks: ["performance-baseline"],
  },
  {
    id: "interactive",
    name: { zh: "交互等待要短", en: "Interactive waits must stay short" },
    summary: { zh: "用户频繁点击、搜索或保存；需要对关键交互做可重复测量。", en: "Users click, search, or save frequently; critical interactions need repeatable measurement." },
    chooseWhen: { zh: "适合面向用户的 Web、移动端和桌面应用。", en: "Use for user-facing web, mobile, and desktop applications." },
    controls: [{ zh: "列出关键交互并以实测分位数验收", en: "List critical interactions and accept them using measured percentiles" }],
    releaseBlocks: [{ zh: "关键交互相对基线明显退化且无批准", en: "A critical interaction materially regresses from baseline without approval" }],
    artifacts: ["QUALITY_ATTRIBUTE_SCENARIOS.md", "TEST_PLAN.md", "TEST_CASE_MATRIX.md"],
    checks: ["interaction-performance", "regression-comparison"],
  },
  {
    id: "latency-critical",
    name: { zh: "延迟直接影响业务结果", en: "Latency directly affects the outcome" },
    summary: { zh: "实时控制、交易、流媒体或高频 API 对延迟有明确业务边界。", en: "Real-time control, trading, streaming, or high-volume APIs have a business-defined latency boundary." },
    chooseWhen: { zh: "只有业务已经给出测量场景和失败后果时选择。", en: "Use only when the business has defined the measurement scenario and failure consequence." },
    controls: [{ zh: "由负责人确认阈值、负载、环境和降级策略", en: "Owner confirms threshold, load, environment, and degradation strategy" }],
    releaseBlocks: [{ zh: "负载测试未达到已确认阈值", en: "Load testing misses the confirmed threshold" }],
    artifacts: ["QUALITY_ATTRIBUTE_SCENARIOS.md", "ADR.md", "TEST_PLAN.md", "RISK_REGISTER.md"],
    checks: ["load-test", "capacity-review", "performance-approval"],
  },
];

export const processChoices: ChoiceEffect<ProcessModel>[] = [
  {
    id: "agile",
    name: { zh: "迭代交付", en: "Iterative delivery" },
    summary: { zh: "需求会变化，按小批次实现、测试并获取反馈。", en: "Requirements may change; implement, test, and gather feedback in small increments." },
    chooseWhen: { zh: "适合产品研发、频繁反馈和持续发布。", en: "Use for product work with frequent feedback and regular releases." },
    controls: [{ zh: "每个增量必须有验收标准、回归测试和回顾记录", en: "Each increment needs acceptance criteria, regression tests, and retrospective evidence" }],
    releaseBlocks: [{ zh: "当前增量没有可运行结果或反馈记录", en: "The increment has no working result or feedback record" }],
    artifacts: ["USER_STORY.md", "PROCESS_COMPLIANCE_REPORT.md", "RETROSPECTIVE.md"],
    checks: ["acceptance-trace", "regression-tests"],
  },
  {
    id: "waterfall",
    name: { zh: "阶段审批", en: "Stage-gated delivery" },
    summary: { zh: "范围稳定，需求、设计、实现和验收按阶段正式批准。", en: "Scope is stable and requirements, design, implementation, and acceptance receive formal stage approval." },
    chooseWhen: { zh: "适合合同范围固定、外部审批多或文档交付严格的项目。", en: "Use for fixed contracts, external approvals, or strict documentation deliverables." },
    controls: [{ zh: "阶段基线、变更申请和正式签署", en: "Stage baselines, change requests, and formal sign-off" }],
    releaseBlocks: [{ zh: "前置阶段未签署或范围变更未批准", en: "A prior stage is unsigned or a scope change is unapproved" }],
    artifacts: ["REQUIREMENTS.md", "DESIGN.md", "ADR.md", "FINAL_REPORT.md"],
    checks: ["stage-approval", "change-control"],
  },
  {
    id: "spiral",
    name: { zh: "风险驱动迭代", en: "Risk-driven iteration" },
    summary: { zh: "每一轮先识别高风险，再用原型或实验验证后继续。", en: "Each cycle identifies the highest risk and validates it with a prototype or experiment." },
    chooseWhen: { zh: "适合技术不确定、高安全风险或代价昂贵的创新项目。", en: "Use for technically uncertain, safety-sensitive, or expensive innovation." },
    controls: [{ zh: "每轮记录风险假设、验证结果和继续/停止决定", en: "Record risk hypotheses, validation results, and continue/stop decisions per cycle" }],
    releaseBlocks: [{ zh: "最高暴露风险仍未经验证", en: "The highest-exposure risk remains unvalidated" }],
    artifacts: ["RISK_REGISTER.md", "ANALYSIS.md", "ADR.md", "TEST_PLAN.md"],
    checks: ["risk-review", "prototype-evidence"],
  },
  {
    id: "v-model",
    name: { zh: "开发与测试逐级配对", en: "Paired development and test stages" },
    summary: { zh: "每个需求与设计阶段都提前定义对应测试和验收证据。", en: "Every requirements and design stage defines its corresponding test and acceptance evidence." },
    chooseWhen: { zh: "适合验证责任严格、失败代价较高的系统。", en: "Use where verification duties are strict and failures are costly." },
    controls: [{ zh: "需求对应验收测试，设计对应集成测试，模块对应单元测试", en: "Requirements map to acceptance tests, design to integration tests, and modules to unit tests" }],
    releaseBlocks: [{ zh: "任何开发工件没有对应测试证据", en: "Any development artifact lacks paired test evidence" }],
    artifacts: ["REQUIREMENTS.md", "DESIGN.md", "TEST_PLAN.md", "TEST_CASE_MATRIX.md"],
    checks: ["bidirectional-test-trace"],
  },
  {
    id: "custom",
    name: { zh: "自定义流程", en: "Custom process" },
    summary: { zh: "由负责人组合阶段，但不得移除需求、测试、安全和发布证据。", en: "The owner composes stages without removing requirements, testing, security, or release evidence." },
    chooseWhen: { zh: "仅在团队已有明确流程并能说明取舍时选择。", en: "Use only when the team has an established process and can explain its trade-offs." },
    controls: [{ zh: "记录选择理由、反馈周期、测试时点和批准人", en: "Record rationale, feedback cadence, test timing, and approvers" }],
    releaseBlocks: [{ zh: "自定义流程没有负责人或强制检查", en: "The custom process has no owner or mandatory checks" }],
    artifacts: ["PROCESS_COMPLIANCE_REPORT.md", "RISK_REGISTER.md"],
    checks: ["process-review"],
  },
];

export const lifecycleBlueprint: LifecycleDefinition[] = [
  { key: "context", name: { zh: "项目上下文", en: "Project context" }, purpose: { zh: "确认软件类型、数据边界、技术栈和治理策略。", en: "Confirm software type, data boundaries, stack, and governance policy." }, actor: "human", artifactNames: ["PROJECT_CONTEXT.md"], completion: { zh: "项目负责人确认上下文与质量场景", en: "Owner confirms context and quality scenarios" }, risk: { zh: "错误上下文会让后续门禁失配", en: "Wrong context misconfigures later gates" } },
  { key: "requirements", name: { zh: "需求", en: "Requirements" }, purpose: { zh: "把原始诉求转成可追踪、可验收的 FR、NFR 与约束。", en: "Turn the original request into traceable FRs, NFRs, and constraints." }, actor: "human", artifactNames: ["REQUIREMENTS.md"], completion: { zh: "必填字段、冲突和验收标准已确认", en: "Required fields, conflicts, and acceptance criteria are confirmed" }, risk: { zh: "错误需求会放大后续返工", en: "Wrong requirements amplify downstream rework" } },
  { key: "user-story", name: { zh: "用户故事", en: "User story" }, purpose: { zh: "明确角色、目标、价值、优先级和可测试结果。", en: "Define role, goal, value, priority, and testable outcomes." }, actor: "human", artifactNames: ["USER_STORY.md"], completion: { zh: "角色、目标、价值和 INVEST 检查完成", en: "Role, goal, value, and INVEST review are complete" }, risk: { zh: "功能存在但不解决用户问题", en: "The feature exists but misses user value" } },
  { key: "analysis", name: { zh: "分析", en: "Analysis" }, purpose: { zh: "识别业务规则、实体、边界、控制、关系和失败模式。", en: "Identify business rules, entities, boundaries, controls, relationships, and failure modes." }, actor: "ai", artifactNames: ["ANALYSIS.md"], completion: { zh: "问题域与失败模式经人工复核", en: "Domain and failure modes receive human review" }, risk: { zh: "实现模型与真实业务不一致", en: "Implementation model diverges from the domain" } },
  { key: "design", name: { zh: "设计与架构", en: "Design and architecture" }, purpose: { zh: "确定模块边界、接口、数据模型、质量取舍与 ADR。", en: "Define module boundaries, interfaces, data model, quality trade-offs, and ADRs." }, actor: "ai", artifactNames: ["DESIGN.md", "ADR.md"], completion: { zh: "方案、备选项、迁移与回滚可审查", en: "Proposal, alternatives, migration, and rollback are reviewable" }, risk: { zh: "结构性修改缺少可逆方案", en: "Structural change has no reversible path" } },
  { key: "risk-quality", name: { zh: "风险与质量", en: "Risk and quality" }, purpose: { zh: "评估概率、影响、触发条件、缓解措施和质量场景。", en: "Assess probability, impact, triggers, mitigation, and quality scenarios." }, actor: "human", artifactNames: ["RISK_REGISTER.md", "QUALITY_ATTRIBUTE_SCENARIOS.md"], completion: { zh: "高风险有负责人、检测方式和应急方案", en: "High risks have owners, detection, and contingencies" }, risk: { zh: "上线前才发现不可接受风险", en: "Unacceptable risk appears only before release" } },
  { key: "planning", name: { zh: "实施计划", en: "Implementation plan" }, purpose: { zh: "将设计拆成有依赖、检查、交付物和回滚点的任务。", en: "Split design into tasks with dependencies, checks, outputs, and rollback points." }, actor: "human", artifactNames: ["PROCESS_COMPLIANCE_REPORT.md"], completion: { zh: "负责人批准任务顺序和完成条件", en: "Owner approves task order and completion criteria" }, risk: { zh: "遗漏依赖或验证时点", en: "Dependencies or validation timing are omitted" } },
  { key: "implementation", name: { zh: "实现", en: "Implementation" }, purpose: { zh: "由 Codex CLI 在受限工作区执行最小可逆修改。", en: "Use Codex CLI to make the smallest reversible change in a restricted workspace." }, actor: "external", artifactNames: ["IMPLEMENTATION_LOG.md", "AI_USAGE_REVIEW.md"], completion: { zh: "变更引用、人工审查和 AI 使用记录齐全", en: "Change reference, human review, and AI-use evidence exist" }, risk: { zh: "生成代码未经检查进入产品", en: "Generated code enters the product without review" } },
  { key: "validation", name: { zh: "确定性验证", en: "Deterministic validation" }, purpose: { zh: "运行构建、lint、类型、策略与复杂度检查。", en: "Run build, lint, type, policy, and complexity checks." }, actor: "deterministic", artifactNames: ["VALIDATION_RESULTS.json"], completion: { zh: "强制检查有退出码、耗时和原始输出", en: "Required checks have exit codes, duration, and raw output" }, risk: { zh: "把 AI 判断误当成机器验证", en: "AI judgment is mistaken for machine validation" } },
  { key: "testing", name: { zh: "测试", en: "Testing" }, purpose: { zh: "按需求覆盖单元、集成、边界、失败、安全和回归路径。", en: "Cover unit, integration, boundary, failure, security, and regression paths by requirement." }, actor: "deterministic", artifactNames: ["TEST_PLAN.md", "TEST_CASE_MATRIX.md", "TEST_RESULTS.md"], completion: { zh: "FR/NFR/AC 均有测试或明确理由", en: "Every FR, NFR, and AC has a test or explicit justification" }, risk: { zh: "只验证正常路径", en: "Only the happy path is tested" } },
  { key: "security", name: { zh: "安全审查", en: "Security review" }, purpose: { zh: "检查信任边界、输入、认证授权、密钥、依赖和部署风险。", en: "Review trust boundaries, input, auth, secrets, dependencies, and deployment risk." }, actor: "human", artifactNames: ["SECURITY_REVIEW.md"], completion: { zh: "未接受的高风险发现为零", en: "No unaccepted high-risk finding remains" }, risk: { zh: "自动检查造成虚假安全感", en: "Automation creates a false sense of security" } },
  { key: "documentation", name: { zh: "文档与交付", en: "Documentation and delivery" }, purpose: { zh: "同步使用、部署、维护、迁移和已知限制。", en: "Synchronize usage, deployment, maintenance, migration, and known limitations." }, actor: "human", artifactNames: ["DEPLOYMENT_PLAN.md", "MAINTENANCE_TASK.md", "FINAL_REPORT.md"], completion: { zh: "行为变化与运维方式均已记录", en: "Behavior changes and operating procedures are recorded" }, risk: { zh: "代码可运行但无法安全维护", en: "Code runs but cannot be maintained safely" } },
  { key: "release", name: { zh: "发布决定", en: "Release decision" }, purpose: { zh: "汇总阻断项、警告、已接受风险和人工批准。", en: "Combine blockers, warnings, accepted risks, and human approval." }, actor: "human", artifactNames: ["RELEASE_MANIFEST.json"], completion: { zh: "所有强制门禁通过并由负责人批准", en: "All mandatory gates pass and the owner approves" }, risk: { zh: "未知状态被误报为通过", en: "Unknown status is reported as pass" } },
  { key: "retrospective", name: { zh: "回顾与维护", en: "Retrospective and maintenance" }, purpose: { zh: "记录成效、失败根因、规则改进和后续维护任务。", en: "Record outcomes, root causes, rule updates, and maintenance work." }, actor: "human", artifactNames: ["RETROSPECTIVE.md"], completion: { zh: "根因和可复用改进被记录", en: "Root causes and reusable improvements are recorded" }, risk: { zh: "相同失败在后续迭代重复", en: "The same failure recurs in later iterations" } },
];

export function qualityProfileFor(project: Project): ProjectQualityProfile {
  return project.qualityProfile || defaultQualityProfile;
}

export function choiceById<T extends string>(choices: ChoiceEffect<T>[], id: T): ChoiceEffect<T> {
  return choices.find((choice) => choice.id === id) || choices[0];
}

export function projectChoiceEffects(project: Project) {
  const quality = qualityProfileFor(project);
  return [
    choiceById(securityChoices, quality.security),
    choiceById(privacyChoices, quality.privacy),
    choiceById(reliabilityChoices, quality.reliability),
    choiceById(performanceChoices, quality.performance),
    choiceById(processChoices, project.processModel || "agile"),
  ];
}

export function requiredProjectArtifacts(project: Project): string[] {
  return [...new Set(projectChoiceEffects(project).flatMap((choice) => choice.artifacts))].sort();
}

export function requiredProjectChecks(project: Project): string[] {
  return [...new Set(projectChoiceEffects(project).flatMap((choice) => choice.checks))].sort();
}

export function qualityScenariosForProject(project: Project): QualityScenario[] {
  const quality = qualityProfileFor(project);
  const selections = [
    choiceById(securityChoices, quality.security),
    choiceById(privacyChoices, quality.privacy),
    choiceById(reliabilityChoices, quality.reliability),
    choiceById(performanceChoices, quality.performance),
  ];
  return selections.map((choice) => ({
    id: `QS-${choice.id.toUpperCase()}`,
    attribute: securityChoices.includes(choice as ChoiceEffect<SecurityProfile>)
      ? "security"
      : privacyChoices.includes(choice as ChoiceEffect<PrivacyProfile>)
        ? "privacy"
        : reliabilityChoices.includes(choice as ChoiceEffect<ReliabilityProfile>)
          ? "reliability"
          : "performance",
    title: choice.name.zh,
    condition: choice.chooseWhen.zh,
    expectedResponse: choice.controls.map((item) => item.zh).join("；"),
    verification: choice.checks.join(", "),
    source: "project-profile",
    status: "draft",
  }));
}
