"use client";

import { Check, Clipboard, KeyRound, LoaderCircle, Play, RefreshCw, Save, Settings, ShieldCheck, TerminalSquare, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { PolicyProfile, Project } from "../../domain/model";
import { policies, projectPolicy } from "../../domain/governance";
import { testLocalRunner, type LocalRunnerConfig } from "../../lib/local-runner";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import type { WorkspacePageProps } from "../workspace-types";
import { text } from "../workspace-types";

type ProviderStatus = {
  vaultAvailable?: boolean;
  configured: boolean;
  provider: null | { provider: string; model: string; baseUrl: string; maskedKey: string; status: string; savedAt: string; lastTestedAt?: string; timeoutSeconds: number; maxRetries: number };
  catalog?: Array<{ id: string; model: string; baseUrl: string }>;
};

type SettingsSection = "general" | "repository" | "providers" | "runner" | "policy" | "limits" | "security";

export function SettingsPage({ language, workspace, project, navigate, localRunner, onLocalRunner, onPolicyChange, onClearWorkspace, theme, onTheme }: WorkspacePageProps & {
  localRunner: LocalRunnerConfig;
  onLocalRunner: (config: LocalRunnerConfig) => void;
  onPolicyChange: (project: Project, profile: PolicyProfile) => void;
  onClearWorkspace: () => Promise<void>;
  theme: "system" | "light" | "dark";
  onTheme: (theme: "system" | "light" | "dark") => void;
}) {
  const [section, setSection] = useState<SettingsSection>("general");
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [organization, setOrganization] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [maxRetries, setMaxRetries] = useState(1);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [providerError, setProviderError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [runnerStatus, setRunnerStatus] = useState<"idle" | "testing" | "connected" | "failed">("idle");
  const [runnerMessage, setRunnerMessage] = useState("");

  const loadProvider = useCallback(async () => {
    try {
      const response = await fetch("/api/providers", { cache: "no-store" });
      const body = await response.json() as ProviderStatus & { error?: string };
      if (!response.ok) throw new Error(body.error || "Provider settings are unavailable.");
      setProviderStatus(body);
      if (body.provider) {
        setProvider(body.provider.provider);
        setBaseUrl(body.provider.baseUrl);
        setModel(body.provider.model);
        setTimeoutSeconds(body.provider.timeoutSeconds);
        setMaxRetries(body.provider.maxRetries);
      } else {
        const defaults = body.catalog?.find((item) => item.id === "openai") || body.catalog?.[0];
        if (defaults) { setBaseUrl(defaults.baseUrl); setModel(defaults.model); }
      }
    } catch (cause) {
      setProviderError(cause instanceof Error ? cause.message : "Provider settings are unavailable.");
    }
  }, []);
  useEffect(() => { queueMicrotask(() => void loadProvider()); }, [loadProvider]);

  const selectProvider = (value: string) => {
    setProvider(value);
    const defaults = providerStatus?.catalog?.find((item) => item.id === value);
    if (defaults) { setBaseUrl(defaults.baseUrl); setModel(defaults.model); }
  };
  const saveProvider = async () => {
    setBusy(true); setProviderError("");
    try {
      const response = await fetch("/api/providers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider, apiKey, baseUrl, model, organization, timeoutSeconds, maxRetries }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not save provider.");
      setApiKey("");
      await loadProvider();
    } catch (cause) {
      setProviderError(cause instanceof Error ? cause.message : "Could not save provider.");
    } finally { setBusy(false); }
  };
  const testProvider = async () => {
    setBusy(true); setProviderError("");
    try {
      const response = await fetch("/api/providers/test", { method: "POST" });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Connection test failed.");
      await loadProvider();
    } catch (cause) {
      setProviderError(cause instanceof Error ? cause.message : "Connection test failed.");
    } finally { setBusy(false); }
  };
  const removeProvider = async () => {
    setBusy(true); setProviderError("");
    try {
      await fetch("/api/providers", { method: "DELETE" });
      setProviderStatus((current) => current ? { ...current, configured: false, provider: null } : current);
      setApiKey("");
    } finally { setBusy(false); }
  };

  const generateRunnerToken = () => {
    const values = crypto.getRandomValues(new Uint8Array(24));
    onLocalRunner({ ...localRunner, token: Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("") });
    setRunnerStatus("idle"); setRunnerMessage("");
  };
  const testRunner = async () => {
    setRunnerStatus("testing"); setRunnerMessage("");
    try {
      const result = await testLocalRunner(localRunner);
      setRunnerStatus("connected");
      setRunnerMessage(text(language, `已连接本机工作区：${result.workspace}`, `Connected to local workspace: ${result.workspace}`));
    } catch (cause) {
      setRunnerStatus("failed");
      setRunnerMessage(cause instanceof Error ? cause.message : text(language, "无法连接本地 runner。", "Could not connect to the local runner."));
    }
  };
  const runnerCommand = `npm run runner -- --workspace /path/to/your/repository --token ${localRunner.token || "<temporary-token>"}`;
  const sections: Array<[SettingsSection, string]> = [
    ["general", text(language, "常规", "General")],
    ["repository", text(language, "项目与仓库", "Project & repository")],
    ["providers", "AI Providers"],
    ["runner", "Local Codex Runner"],
    ["policy", text(language, "治理策略", "Governance policy")],
    ["limits", text(language, "执行边界", "Execution boundary")],
    ["security", text(language, "安全与数据", "Security & data")],
  ];

  return <div className="settings-workspace">
    <PageHeader eyebrow={text(language, "工作区", "Workspace")} title={text(language, "设置", "Settings")} description={text(language, "连接真实服务，并查看每项配置会影响哪些工程步骤。", "Connect real services and inspect which engineering steps each setting affects.")} />
    <div className="settings-layout">
      <nav className="settings-nav" aria-label={text(language, "设置分类", "Settings sections")}>{sections.map(([id, label]) => <button key={id} aria-current={section === id ? "page" : undefined} className={section === id ? "active" : ""} onClick={() => setSection(id)}>{label}</button>)}</nav>
      <section className="settings-content">
        {section === "general" && <>
          <div className="section-heading"><div><span className="section-label">General</span><h2>{text(language, "界面与本地项目", "Interface and local projects")}</h2></div><Settings /></div>
          <div className="setting-row"><div><b>{text(language, "主题", "Theme")}</b><p>{text(language, "系统模式会跟随设备外观。", "System mode follows the device appearance.")}</p></div><div className="segmented-control" role="group" aria-label={text(language, "主题", "Theme")}>{([['system', text(language, "系统", "System")], ['light', text(language, "浅色", "Light")], ['dark', text(language, "深色", "Dark")]] as const).map(([id, label]) => <button key={id} aria-pressed={theme === id} className={theme === id ? "active" : ""} onClick={() => onTheme(id)}>{label}</button>)}</div></div>
          <div className="setting-row"><div><b>{text(language, "本地项目数据", "Local project data")}</b><p>{text(language, "项目、需求、计划和工件索引存储在当前浏览器。", "Projects, requirements, plans, and artifact indexes are stored in this browser.")}</p></div><strong>{workspace.projects.filter((item) => !item.demo).length}</strong></div>
          <div className="setting-row danger-zone"><div><b>{text(language, "清除本地项目", "Clear local projects")}</b><p>{confirmClear ? text(language, "此操作不可撤销；录制示例会保留。", "This cannot be undone; the recorded demo remains.") : text(language, "删除此浏览器中的自建项目及运行记录。", "Remove projects and run history created in this browser.")}</p></div>{confirmClear ? <div className="confirm-actions"><button className="secondary-button" onClick={() => setConfirmClear(false)}>{text(language, "取消", "Cancel")}</button><button className="danger-button" onClick={() => void onClearWorkspace().then(() => setConfirmClear(false))}><Trash2 />{text(language, "确认清除", "Confirm clear")}</button></div> : <button className="secondary-button" disabled={!workspace.projects.some((item) => !item.demo)} onClick={() => setConfirmClear(true)}><Trash2 />{text(language, "清除项目", "Clear projects")}</button>}</div>
        </>}

        {section === "repository" && (project ? <>
          <div className="section-heading"><div><span className="section-label">Project boundary</span><h2>{project.name}</h2></div></div>
          <dl className="settings-facts"><div><dt>{text(language, "代码来源", "Source")}</dt><dd>{project.source || "blank"}</dd></div><div><dt>Repository</dt><dd>{project.repository || text(language, "尚未连接", "Not connected")}</dd></div><div><dt>Branch</dt><dd>{project.branch}</dd></div><div><dt>{text(language, "执行方式", "Execution")}</dt><dd>{project.executionTarget || "evidence-import"}</dd></div><div><dt>{text(language, "技术栈", "Stack")}</dt><dd>{project.stack.join(", ")}</dd></div><div><dt>{text(language, "发布方式", "Release")}</dt><dd>{project.releaseStrategy}</dd></div></dl>
          <div className="setting-callout"><ShieldCheck /><div><b>{text(language, "仓库连接的实际作用", "What repository connection changes")}</b><p>{text(language, "公开 GitHub 地址只用于读取文件树并检查治理接入；本地代码修改只能通过你主动启动的 runner。", "A public GitHub URL is used only to read the file tree and check governance adoption. Local code changes require a runner you start explicitly.")}</p></div></div>
          <button className="secondary-button" onClick={() => navigate("checks")}>{text(language, "检查仓库治理接入", "Check repository adoption")}</button>
        </> : <EmptyState icon={Settings} title={text(language, "没有当前项目", "No current project")} description={text(language, "选择项目后查看它的代码和执行边界。", "Select a project to inspect its code and execution boundary.")} />)}

        {section === "providers" && <>
          <div className="section-heading"><div><span className="section-label">AI assistance</span><h2>{text(language, "连接自己的模型服务", "Connect your model provider")}</h2><p>{text(language, "模型用于整理需求与生成可编辑草稿，不会自行把工程状态标记为通过。", "The model structures requirements and drafts editable artifacts; it cannot mark engineering checks as passed.")}</p></div>{providerStatus?.provider?.status === "connected" ? <span className="connection-status connected"><Check />{text(language, "连接正常", "Connected")}</span> : providerStatus?.configured ? <span className="connection-status configured">{text(language, "已保存，待测试", "Saved, not tested")}</span> : <span className="connection-status">{text(language, "未配置", "Not configured")}</span>}</div>
          {providerStatus?.vaultAvailable === false && <div className="setting-callout warning"><ShieldCheck /><div><b>{text(language, "当前部署未启用模型密钥保管", "Provider secret storage is unavailable in this deployment")}</b><p>{text(language, "部署管理员需要在服务端配置 PROVIDER_VAULT_SECRET。配置完成前，页面不会接收或保存 API Key。", "The deployment administrator must configure PROVIDER_VAULT_SECRET on the server. Until then, this page will not accept or store API keys.")}</p></div></div>}
          {providerStatus?.configured && providerStatus.provider && <div className="saved-provider"><KeyRound /><div><b>{providerStatus.provider.provider} · {providerStatus.provider.model}</b><p>{providerStatus.provider.maskedKey} · {providerStatus.provider.lastTestedAt ? `${text(language, "上次测试", "Last tested")} ${new Date(providerStatus.provider.lastTestedAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")}` : text(language, "尚未测试", "Not tested")}</p></div><button className="secondary-button" onClick={() => void testProvider()} disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <Play />}{text(language, "测试连接", "Test connection")}</button><button className="icon-button danger" onClick={() => void removeProvider()} aria-label={text(language, "移除配置", "Remove configuration")}><Trash2 /></button></div>}
          <div className="provider-form">
            <div className="form-grid two"><label><span>Provider</span><select value={provider} onChange={(event) => selectProvider(event.target.value)}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="gemini">Google Gemini</option><option value="openrouter">OpenRouter</option><option value="custom">OpenAI-compatible / Custom</option></select></label><label><span>Model</span><input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Model ID" /></label></div>
            <label><span>API Key</span><input type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={providerStatus?.configured ? text(language, "输入新密钥以替换", "Enter a new key to replace") : text(language, "输入 API Key", "Enter API key")} /></label>
            <label><span>Base URL</span><input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} disabled={provider !== "custom"} /></label>
            <details className="scope-disclosure"><summary>{text(language, "高级连接设置", "Advanced connection settings")}</summary><div className="disclosure-body form-grid two"><label><span>Organization / Project</span><input value={organization} onChange={(event) => setOrganization(event.target.value)} /></label><label><span>{text(language, "超时（秒）", "Timeout (seconds)")}</span><input type="number" min={5} max={120} value={timeoutSeconds} onChange={(event) => setTimeoutSeconds(Number(event.target.value))} /></label><label><span>{text(language, "最多重试", "Maximum retries")}</span><input type="number" min={0} max={3} value={maxRetries} onChange={(event) => setMaxRetries(Number(event.target.value))} /></label></div></details>
            {providerError && <div className="inline-error" role="alert">{providerError}</div>}
            <div className="setting-callout"><ShieldCheck /><div><b>{text(language, "密钥处理", "Secret handling")}</b><p>{text(language, "密钥只发送到本站后端并保存在加密 HttpOnly 会话中；页面只显示末四位，会话 8 小时后失效。", "The key is sent only to this site's backend and kept in an encrypted HttpOnly session. The UI shows only its final four characters and the session expires after eight hours.")}</p></div></div>
            <div className="form-actions"><span>{text(language, "保存后请测试连接。", "Test the connection after saving.")}</span><button className="primary-button" onClick={() => void saveProvider()} disabled={busy || providerStatus?.vaultAvailable === false || !apiKey.trim() || !model.trim()}>{busy ? <LoaderCircle className="spin" /> : <Save />}{text(language, "保存模型服务", "Save provider")}</button></div>
          </div>
        </>}

        {section === "runner" && <>
          <div className="section-heading"><div><span className="section-label">Local execution</span><h2>{text(language, "连接本机 Codex CLI", "Connect local Codex CLI")}</h2></div>{runnerStatus === "connected" ? <span className="connection-status connected"><Check />{text(language, "连接正常", "Connected")}</span> : runnerStatus === "failed" ? <span className="connection-status failed">{text(language, "连接失败", "Connection failed")}</span> : <span className="connection-status">{text(language, "未连接", "Not connected")}</span>}</div>
          <div className="runner-purpose"><TerminalSquare /><div><h3>{text(language, "公开站点与本地代码之间的受控桥接", "A controlled bridge between the public site and local code")}</h3><p>{text(language, "你在目标仓库主动启动 runner。它只监听本机地址，用临时令牌校验请求，再调用本机已登录的 Codex CLI。", "You start the runner explicitly for a target repository. It listens only on the loopback interface, validates a temporary token, then invokes your locally authenticated Codex CLI.")}</p></div></div>
          <ol className="runner-steps"><li><span>1</span><div><b>{text(language, "生成临时令牌", "Generate a temporary token")}</b><p>{text(language, "仅保存在当前标签页内存。", "Kept only in this tab's memory.")}</p></div></li><li><span>2</span><div><b>{text(language, "在本项目 web 目录运行命令", "Run the command from this web directory")}</b><p>{text(language, "把示例路径替换为允许 Codex 修改的仓库。", "Replace the example path with the repository Codex may modify.")}</p></div></li><li><span>3</span><div><b>{text(language, "测试连接", "Test the connection")}</b><p>{text(language, "成功后，运行页才会开放 Codex 实现操作。", "After success, the Run page can start Codex implementation.")}</p></div></li></ol>
          <div className="runner-fields"><label><span>{text(language, "Runner 地址", "Runner address")}</span><input value={localRunner.endpoint} onChange={(event) => { onLocalRunner({ ...localRunner, endpoint: event.target.value }); setRunnerStatus("idle"); }} placeholder="http://127.0.0.1:4777" /></label><label><span>{text(language, "临时令牌", "Temporary token")}</span><div className="input-action"><input type="password" autoComplete="off" value={localRunner.token} onChange={(event) => { onLocalRunner({ ...localRunner, token: event.target.value }); setRunnerStatus("idle"); }} placeholder={text(language, "至少 16 个字符", "At least 16 characters")} /><button className="secondary-button" onClick={generateRunnerToken}><RefreshCw />{text(language, "生成", "Generate")}</button></div></label></div>
          <div className="runner-command"><div><span>{text(language, "启动命令", "Start command")}</span><button className="icon-button" disabled={!localRunner.token} onClick={() => void navigator.clipboard.writeText(runnerCommand)} aria-label={text(language, "复制命令", "Copy command")}><Clipboard /></button></div><code>{runnerCommand}</code></div>
          <div className="setting-callout"><ShieldCheck /><div><b>{text(language, "执行边界", "Execution boundary")}</b><p>{text(language, "runner 仅监听 127.0.0.1；只读分析使用 read-only，实现使用 workspace-write；不启用 danger-full-access，也不会把本机路径发给站点。", "The runner listens only on 127.0.0.1. Analysis uses read-only and implementation uses workspace-write. It never enables danger-full-access or sends the local path to the site.")}</p></div></div>
          {runnerMessage && <div className={runnerStatus === "failed" ? "inline-error" : "inline-success"} role="status">{runnerMessage}</div>}
          <div className="form-actions"><span>{text(language, "保持 runner 终端运行，再测试连接。", "Keep the runner terminal open, then test the connection.")}</span><button className="primary-button" disabled={runnerStatus === "testing" || localRunner.token.length < 16} onClick={() => void testRunner()}>{runnerStatus === "testing" ? <LoaderCircle className="spin" /> : <Play />}{text(language, "测试本地连接", "Test local connection")}</button></div>
        </>}

        {section === "policy" && (project ? <>
          <div className="section-heading"><div><span className="section-label">Governance policy</span><h2>{text(language, "发布门禁", "Release gates")}</h2><p>{text(language, "策略会改变必需检查、工件和警告处理，不只是生成不同提示词。", "The policy changes required checks, artifacts, and warning behavior, not merely prompt text.")}</p></div></div>
          <div className="policy-settings">{policies.map((policy) => <button key={policy.id} className={project.policyProfile === policy.id ? "selected" : ""} onClick={() => onPolicyChange(project, policy.id)}><span><b>{policy.name}</b><small>{language === "zh" ? policy.description : policy.id === "strict" ? "Warnings block release; integration, dependency, and security evidence are mandatory." : policy.id === "custom" ? "Choose machine checks while preserving lifecycle evidence." : "Failures block release; warnings require an owner decision."}</small><em>{policy.requiredChecks.length} checks · {policy.requiredArtifacts?.length || 0} artifacts · {policy.requiredApprovals?.length || 0} approvals</em></span>{project.policyProfile === policy.id && <Check />}</button>)}</div>
          <div className="policy-impact-summary"><h3>{text(language, "当前策略实际要求", "Current policy requirements")}</h3><dl><div><dt>{text(language, "检查", "Checks")}</dt><dd>{projectPolicy(project).requiredChecks.join(", ")}</dd></div><div><dt>{text(language, "工件", "Artifacts")}</dt><dd>{projectPolicy(project).requiredArtifacts?.join(", ")}</dd></div><div><dt>{text(language, "审批", "Approvals")}</dt><dd>{projectPolicy(project).requiredApprovals?.join(", ")}</dd></div></dl></div>
        </> : <EmptyState icon={Settings} title={text(language, "没有当前项目", "No current project")} description={text(language, "选择项目后配置发布门禁。", "Select a project to configure release gates.")} />)}

        {section === "limits" && <>
          <div className="section-heading"><div><span className="section-label">Execution boundary</span><h2>{text(language, "哪些操作在哪里发生", "Where each operation happens")}</h2></div></div>
          <div className="boundary-table"><div><b>{text(language, "需求整理", "Requirement structuring")}</b><span>{text(language, "本站后端 → 已连接模型服务", "Site backend → configured AI provider")}</span><small>{text(language, "仅在用户点击后发送当前需求字段", "Sends current requirement fields only after user action")}</small></div><div><b>{text(language, "ZIP 与仓库清单检查", "ZIP and repository-list checks")}</b><span>{text(language, "当前浏览器", "Current browser")}</span><small>{text(language, "只读取路径和文本结构，不执行文件", "Reads paths and text structure; never executes files")}</small></div><div><b>{text(language, "Codex 代码修改", "Codex code changes")}</b><span>{text(language, "本机 runner → Codex CLI", "Local runner → Codex CLI")}</span><small>{text(language, "限定到启动 runner 时指定的工作区", "Limited to the workspace selected at runner startup")}</small></div><div><b>{text(language, "构建与测试结论", "Build and test conclusions")}</b><span>{text(language, "本机或 CI 结果导入", "Imported local or CI results")}</span><small>{text(language, "必须包含真实状态和证据，未知不计为通过", "Must carry real status and evidence; unknown is never pass")}</small></div></div>
        </>}

        {section === "security" && <>
          <div className="section-heading"><div><span className="section-label">Security & data</span><h2>{text(language, "数据保存与秘密处理", "Data and secret handling")}</h2></div><ShieldCheck /></div>
          <ul className="security-principles"><li><Check /><span><b>{text(language, "项目内容", "Project content")}</b><small>{text(language, "默认保存在当前浏览器 IndexedDB；上传 ZIP 不离开浏览器。", "Stored in this browser's IndexedDB; uploaded ZIP files remain in the browser.")}</small></span></li><li><Check /><span><b>API Key</b><small>{text(language, "只发送到本站后端，以加密 HttpOnly 会话保存，日志不记录密钥。", "Sent only to the site backend, stored in an encrypted HttpOnly session, and excluded from logs.")}</small></span></li><li><Check /><span><b>{text(language, "本机 runner 令牌", "Local runner token")}</b><small>{text(language, "仅驻留当前 React 内存状态，不写入 localStorage 或 IndexedDB。", "Kept only in React memory, never localStorage or IndexedDB.")}</small></span></li><li><Check /><span><b>{text(language, "证据来源", "Evidence source")}</b><small>{text(language, "机器验证、本地执行、用户确认和录制示例使用不同标签。", "Machine validation, local execution, user confirmation, and recorded demos use distinct labels.")}</small></span></li></ul>
        </>}
      </section>
    </div>
  </div>;
}
