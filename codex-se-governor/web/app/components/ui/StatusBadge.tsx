import { AlertTriangle, Ban, CheckCircle2, CircleDashed, Clock3, LoaderCircle, MinusCircle, XCircle } from "lucide-react";
import type { ActorKind, EvidenceSource, Language, WorkStatus } from "../../domain/model";

const statusMeta: Record<WorkStatus, { label: { zh: string; en: string }; Icon: typeof CheckCircle2 }> = {
  passed: { label: { zh: "通过", en: "Passed" }, Icon: CheckCircle2 },
  failed: { label: { zh: "失败", en: "Failed" }, Icon: XCircle },
  warning: { label: { zh: "警告", en: "Warning" }, Icon: AlertTriangle },
  running: { label: { zh: "运行中", en: "Running" }, Icon: LoaderCircle },
  pending: { label: { zh: "待处理", en: "Pending" }, Icon: Clock3 },
  skipped: { label: { zh: "已跳过", en: "Skipped" }, Icon: MinusCircle },
  "not-run": { label: { zh: "未运行", en: "Not run" }, Icon: Ban },
  unknown: { label: { zh: "未知", en: "Unknown" }, Icon: CircleDashed },
};

export function StatusBadge({ status, label, language = "en" }: { status: WorkStatus; label?: string; language?: Language }) {
  const meta = statusMeta[status];
  return <span className={`status-badge status-${status}`}><meta.Icon aria-hidden="true" />{label || meta.label[language]}</span>;
}

const actorLabels: Record<ActorKind, { zh: string; en: string }> = {
  deterministic: { zh: "机器检查", en: "Deterministic" },
  ai: { zh: "AI 审查", en: "AI review" },
  human: { zh: "人工决定", en: "Human decision" },
  external: { zh: "外部执行", en: "External execution" },
};

export function ActorBadge({ actor, language = "en" }: { actor: ActorKind; language?: Language }) {
  return <span className={`actor-badge actor-${actor}`}>{actorLabels[actor][language]}</span>;
}

const sourceLabels: Record<EvidenceSource, { zh: string; en: string }> = {
  verified: { zh: "已验证结果", en: "Verified result" },
  "local-runner": { zh: "本机 Runner", en: "Local runner" },
  "recorded-demo": { zh: "录制示例", en: "Recorded demo" },
  attested: { zh: "用户确认", en: "User attestation" },
  "ai-assisted": { zh: "AI 辅助草稿", en: "AI-assisted draft" },
  cached: { zh: "缓存结果", en: "Cached result" },
  unknown: { zh: "来源未知", en: "Unknown source" },
};

export function SourceBadge({ source, language = "en" }: { source: EvidenceSource; language?: Language }) {
  return <span className={`source-badge source-${source}`}>{sourceLabels[source][language]}</span>;
}
