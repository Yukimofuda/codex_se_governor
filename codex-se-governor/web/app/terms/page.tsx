import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <Link href="/">← Codex SE Governor</Link>
        <article className="glass-panel">
          <div className="eyebrow">TERMS OF USE</div>
          <h1>治理记录不能替代专业审计</h1>
          <p>Codex SE Governor 用于组织需求、计划、检查和发布证据。导入的结果和浏览器检查不构成安全认证、法律意见、合规认证或软件正确性保证。</p>
          <h2>执行边界</h2>
          <p>公开应用不运行上传代码、测试、包脚本、Shell 命令或二进制文件。`NOT RUN` 和 `UNKNOWN` 与 `PASS` 始终分开。</p>
          <h2>AI 辅助内容</h2>
          <p>只有你主动使用 AI 辅助功能时，应用才会调用已配置的模型服务。AI 结果保持为草稿，采用前需由项目负责人确认，并接受适用的测试、安全和知识产权检查。</p>
          <h2>用户责任</h2>
          <ul>
            <li>实施或分发前复核生成的工件。</li>
            <li>只检查你有权访问的仓库和内容。</li>
            <li>不要把 Secret 和不必要的个人数据放入 Prompt 或共享导出。</li>
            <li>真实构建和测试应在你控制的工程环境中运行，并通过验证清单关联到当前实现版本。</li>
            <li>公开 GitHub 请求应符合适用条款。</li>
          </ul>
          <h2>课程关系</h2>
          <p>本产品是受 EBU6304 软件工程概念启发的独立工程工具，不是官方课程、大学认证或考核产品，也不发布课程原文。</p>
          <h2>可用性与本地数据</h2>
          <p>服务更新不保证保留浏览器本地数据。清除站点数据或更换设备前，请导出重要项目工件。</p>
        </article>
      </div>
    </main>
  );
}
