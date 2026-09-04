# Codex SE Governor Web

Codex SE Governor Web 是面向 AI 辅助软件开发的软件工程治理工作区。它把一项工作组织成可确认的需求、可审核的计划、分阶段运行、检查、证据和发布判断，而不是把用户输入拼成一段 Prompt。

公开版本：<https://codex-se-governor-app.yukikana0108.chatgpt.site>

## 第一次使用

1. **体验完整示例**：查看一个登录限流需求如何经历计划、实现、确定性检查、安全审查和发布阻断。
2. **创建项目**：填写项目要解决的问题、主要技术、代码仓库和发布策略。
3. **确认需求**：保留原始诉求，并整理目标、功能需求和验收标准。可选 AI 只生成草稿。
4. **审核计划**：逐项检查或修改阶段、责任、交付结果、完成检查和风险，再批准运行。
5. **关联工程结果**：记录实现版本，导入 Governor 的 validation-results.json，或检查仓库治理文件。
6. **检查证据和发布状态**：查看阻断项、警告、原始结果和 Release Manifest。

## 产品对象

- **Project**：项目、仓库、分支、环境和治理策略的边界。
- **Requirement**：原始诉求和已确认的结构化需求。
- **Execution Plan**：阶段、任务、责任、输入、预期输出、检查和风险。
- **Workflow Run**：一次独立的工程运行；历史运行不会被后续结果覆盖。
- **Check**：构建、测试、安全、策略等检查，保留来源、命令、输出和耗时。
- **Evidence**：需求快照、计划、代码引用、测试结果、安全记录和发布清单。
- **Release Manifest**：基于当前运行证据计算出的阻断项、警告和发布状态。

状态始终区分 PASS、FAIL、WARNING、RUNNING、PENDING、NOT RUN 与 UNKNOWN。AI 判断、确定性检查、人工决定和外部输入也使用不同来源标记。

## 工作区

- **概览**：当前阶段、下一步、阻断项、发布状态和最近运行。
- **项目**：创建项目或打开集中管理的录制示例。
- **需求**：原始诉求与结构化需求并列编辑和确认。
- **计划**：编辑、保存并批准 14 阶段工程计划。
- **运行**：按阶段查看输入、输出、决定、失败原因、检查和证据。
- **检查**：查看导入的验证结果，或检查 ZIP、公开 GitHub 文件树和路径清单。
- **证据**：按来源查看和下载当前运行的证据。
- **发布**：生成并下载基于真实工作区状态的 Release Manifest。
- **运行历史**：比较同一项目的独立运行和修复记录。
- **设置**：项目来源、AI Provider、治理策略、执行边界和数据处理方式。

## AI Provider

支持 OpenAI、Anthropic、Google Gemini、OpenRouter 和 OpenAI-compatible HTTPS 服务。模型调用通过本站服务端进行，浏览器不会直接向模型提供商发送 API Key。

- Key 只提交到本站后端。
- 服务端使用 AES-GCM 加密后写入 HttpOnly、SameSite=Strict 会话 Cookie。
- 页面只接收掩码后的末四位，不会重新显示完整 Key。
- 会话默认 8 小时后失效；也可在设置中立即删除。
- Key 不写入 IndexedDB、localStorage、代码仓库、导出文件或应用日志。
- 自定义 Base URL 必须使用 HTTPS，并拒绝本地和常见内网地址。
- AI 只在用户点击明确的辅助操作后使用；结果保持为草稿，不能成为测试或发布证据。

生产环境必须在 Sites 环境变量中设置 `PROVIDER_VAULT_SECRET`，值应为至少 32 位的随机字符串。本地开发可使用 shell 环境变量；`.env.example` 只记录变量名，不包含真实 Secret。未配置时，Provider 页面会明确显示部署能力缺失并禁用保存，不会接受密钥后再返回模糊错误。

## 数据与执行边界

- 项目、需求、计划和证据索引默认保存在当前浏览器 IndexedDB。
- ZIP 检查在浏览器内完成，不上传文件内容。
- 公开 GitHub 检查只读取公开仓库的文件树。
- 公开站点和浏览器检查不会执行上传仓库中的 Python、JavaScript、Shell、测试、构建脚本或二进制文件。
- 用户可以在自己控制的电脑上启动本机 Runner。Runner 只监听 `127.0.0.1`，使用当前标签页内存中的临时令牌，并把 Codex CLI 限定到启动时指定的一个工作区。
- 真实构建和测试结果通过 Governor 生成的验证清单导入，并明确标记为确定性证据。
- 当前没有账户、团队空间、云同步、私有 GitHub OAuth 或远程代码沙箱。

详见应用内隐私说明与使用条款。

## 本地开发

需要 Node.js 22.13 LTS 系列或 Node.js 24 及更新版本。

    npm ci --ignore-scripts
    PROVIDER_VAULT_SECRET="replace-with-a-random-secret-at-least-32-characters" npm run dev

开发地址以命令输出为准，通常为 http://localhost:3000。

如需让 Web 工作区调用本机已登录的 Codex CLI：

    npm run runner -- --workspace /absolute/path/to/repository --token <temporary-token>

临时令牌从应用内 **设置 → Local Codex Runner** 生成。分析任务使用 Codex `read-only` 沙箱，实现任务使用 `workspace-write`；Runner 不启用 `danger-full-access`，不通过 shell 拼接命令，也不监听局域网地址。详见 `docs/LOCAL_CODEX_RUNNER.md`。

## 验证

    npm run lint
    npm run typecheck
    PROVIDER_VAULT_SECRET="test-provider-vault-secret-with-more-than-32-characters" npm test
    BASE_URL=http://localhost:3000 npm run qa:product

npm test 先进行生产构建，再运行领域逻辑、ZIP、Provider 安全、服务端端点和渲染测试。qa:product 使用已安装的 Chrome/Chromium 实际走通：

- 录制示例到工作流、检查、证据和发布；
- 新建项目到需求、计划和运行；
- 失败运行到具体失败证据；
- Provider 密钥输入与本机 Runner 令牌不进入浏览器持久化；
- 390px 移动端布局与横向溢出检查。

## 工程结构

- app/domain/：Project、Requirement、Plan、Run、Check、Evidence、Release 等领域对象和状态转换。
- app/components/pages/：与领域对象一一对应的产品页面。
- app/server/providers.ts：统一 Provider Registry、凭据验证、生成和重试策略。
- app/server/provider-vault.ts：服务端加密会话。
- app/api/：Provider 配置、连接测试、模型读取和需求结构化端点。
- local-runner/：用户主动启动的回环地址 Codex CLI 桥接服务。
- app/lib/storage.ts：浏览器 IndexedDB 持久化。
- app/lib/zip.mjs：UTF-8 ZIP 创建、路径穿越和生成物检查。
- app/lib/governance.mjs：治理工件、Prompt、adoption 和追踪逻辑。
- app/domain/demo.ts：录制示例的唯一数据源；正常项目数据不依赖页面内 mock。

设计依据见 `docs/PRODUCT_DESIGN_DECISIONS.md`，领域关系、服务边界和执行流程见 `docs/PRODUCT_ARCHITECTURE.md`，本机执行边界见 `docs/LOCAL_CODEX_RUNNER.md`。

## 发布与回滚

只通过 .openai/hosting.json 对应的 Sites 项目发布。部署前必须完成 lint、typecheck、production build、自动化测试和产品浏览器 QA。若生产版本出现回归，重新部署上一个已验证的 Sites 版本。
