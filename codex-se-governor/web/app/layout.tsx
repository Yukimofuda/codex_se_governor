import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://codex-se-governor-app.yukikana0108.chatgpt.site"),
  title: {
    default: "Codex SE Governor | AI 软件工程治理工作区",
    template: "%s | Codex SE Governor",
  },
  description: "把模糊需求转化为可检查、可追踪、可验证的软件工程执行流程。",
  applicationName: "Codex SE Governor",
  manifest: "/manifest.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#080a10" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SE Governor",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Codex SE Governor",
    description: "从需求、计划和工作流，到检查、证据与发布判断的软件工程治理工作区。",
    type: "website",
    images: [{ url: "/og-governor.png", width: 1200, height: 630, alt: "Codex SE Governor lifecycle workspace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Codex SE Governor",
    description: "让 AI 辅助开发过程保持可检查、可追踪和可发布。",
    images: ["/og-governor.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
