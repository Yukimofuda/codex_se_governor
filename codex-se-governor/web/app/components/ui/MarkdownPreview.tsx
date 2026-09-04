import type { ReactNode } from "react";

export function MarkdownPreview({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let code: string[] | null = null;
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(<ul key={`list-${blocks.length}`}>{list.map((item, index) => <li key={index}>{item}</li>)}</ul>);
    list = [];
  };
  for (const line of lines) {
    if (line.startsWith("```")) {
      flushList();
      if (code) { blocks.push(<pre key={`code-${blocks.length}`}><code>{code.join("\n")}</code></pre>); code = null; }
      else code = [];
      continue;
    }
    if (code) { code.push(line); continue; }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      if (level === 1) blocks.push(<h1 key={`h-${blocks.length}`}>{heading[2]}</h1>);
      else if (level === 2) blocks.push(<h2 key={`h-${blocks.length}`}>{heading[2]}</h2>);
      else blocks.push(<h3 key={`h-${blocks.length}`}>{heading[2]}</h3>);
      continue;
    }
    if (/^[-*]\s+/.test(line)) { list.push(line.replace(/^[-*]\s+/, "")); continue; }
    flushList();
    if (/^\|.*\|$/.test(line)) blocks.push(<code className="markdown-table-line" key={`table-${blocks.length}`}>{line}</code>);
    else if (line.trim()) blocks.push(<p key={`p-${blocks.length}`}>{line}</p>);
  }
  flushList();
  if (code) blocks.push(<pre key={`code-${blocks.length}`}><code>{code.join("\n")}</code></pre>);
  return <div className="markdown-preview">{blocks}</div>;
}
