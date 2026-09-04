import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <Link href="/">← Codex SE Governor</Link>
        <article className="glass-panel">
          <div className="eyebrow">PRIVACY NOTICE</div>
          <h1>项目资料默认保存在当前浏览器</h1>
          <p>项目、需求、计划和证据索引保存在当前设备。本公开版不创建账户，也不提供云端项目副本。</p>
          <h2>本地保存</h2>
          <p>工作区数据保存在 IndexedDB，界面语言和主题保存在浏览器偏好中。清除站点数据会删除这些内容，操作前请先下载需要保留的证据。</p>
          <h2>ZIP 与公开 GitHub</h2>
          <p>ZIP 字节仅在浏览器内用于静态检查，页面关闭或刷新后不由应用保留。公开 GitHub 检查通过 GitHub 公共接口读取仓库元数据和文件路径。上传或导入的代码不会被执行。</p>
          <h2>AI Provider</h2>
          <p>API Key 只提交到本站后端，并以加密 HttpOnly 会话保存，默认八小时后失效。页面只显示掩码，Key 不写入项目、浏览器存储或导出文件。只有你点击明确的 AI 辅助操作时，相关需求内容才会发送给所选模型服务。</p>
          <h2>PWA 缓存</h2>
          <p>可安装应用只缓存公开的应用外壳文件。项目内容不进入 service worker 缓存。</p>
          <h2>日志、遥测和训练</h2>
          <p>应用不会主动把仓库内容写入产品分析日志，也不将项目资料用于训练。Sites 托管、公开 GitHub 和你选择的模型服务可能按各自政策处理请求元数据。</p>
          <h2>导出</h2>
          <p>证据和清单下载不包含已保存的 API Key。分享前请检查项目内容是否包含个人信息、商业秘密或不应公开的仓库信息。</p>
          <h2>删除数据</h2>
          <p>使用应用内“清除数据”、浏览器站点数据设置或卸载 PWA，可移除本地应用数据。</p>
        </article>
      </div>
    </main>
  );
}
