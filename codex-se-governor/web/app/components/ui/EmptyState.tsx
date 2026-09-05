import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, description, actions }: { icon: LucideIcon; title: string; description?: string; actions?: ReactNode }) {
  return <div className="empty-state">
    <span className="empty-icon"><Icon aria-hidden="true" /></span>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    {actions && <div className="empty-actions">{actions}</div>}
  </div>;
}
