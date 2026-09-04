import { AlertTriangle, Ban, CheckCircle2, CircleDashed, Clock3, LoaderCircle, MinusCircle, XCircle } from "lucide-react";
import type { ActorKind, EvidenceSource, WorkStatus } from "../../domain/model";

const statusMeta: Record<WorkStatus, { label: string; Icon: typeof CheckCircle2 }> = {
  passed: { label: "Passed", Icon: CheckCircle2 },
  failed: { label: "Failed", Icon: XCircle },
  warning: { label: "Warning", Icon: AlertTriangle },
  running: { label: "Running", Icon: LoaderCircle },
  pending: { label: "Pending", Icon: Clock3 },
  skipped: { label: "Skipped", Icon: MinusCircle },
  "not-run": { label: "Not run", Icon: Ban },
  unknown: { label: "Unknown", Icon: CircleDashed },
};

export function StatusBadge({ status, label }: { status: WorkStatus; label?: string }) {
  const meta = statusMeta[status];
  return <span className={`status-badge status-${status}`}><meta.Icon aria-hidden="true" />{label || meta.label}</span>;
}

const actorLabels: Record<ActorKind, string> = {
  deterministic: "Deterministic",
  ai: "AI review",
  human: "Human decision",
  external: "External execution",
};

export function ActorBadge({ actor }: { actor: ActorKind }) {
  return <span className={`actor-badge actor-${actor}`}>{actorLabels[actor]}</span>;
}

const sourceLabels: Record<EvidenceSource, string> = {
  verified: "Verified result",
  "local-runner": "Local runner",
  "recorded-demo": "Recorded demo",
  attested: "User attestation",
  cached: "Cached result",
  unknown: "Unknown source",
};

export function SourceBadge({ source }: { source: EvidenceSource }) {
  return <span className={`source-badge source-${source}`}>{sourceLabels[source]}</span>;
}
