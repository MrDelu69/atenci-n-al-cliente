import { CheckCircle2, Hourglass, Inbox, SearchCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type CaseStatus } from "@/lib/cases";

export const STATUS_ICON: Record<CaseStatus, LucideIcon> = {
  recibido: Inbox,
  en_revision: SearchCheck,
  en_espera: Hourglass,
  finalizado: CheckCircle2,
};

export const STATUS_STYLE: Record<CaseStatus, string> = {
  recibido: "bg-status-recibido-soft text-status-recibido border-status-recibido/25",
  en_revision: "bg-status-revision-soft text-status-revision border-status-revision/25",
  en_espera: "bg-status-espera-soft text-status-espera border-status-espera/30",
  finalizado: "bg-status-finalizado-soft text-status-finalizado border-status-finalizado/25",
};

export function StatusBadge({
  status,
  size = "md",
  className,
}: {
  status: CaseStatus;
  size?: "md" | "lg";
  className?: string;
}) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
        size === "lg" ? "px-4 py-1.5 text-base" : "px-2.5 py-0.5 text-sm",
        STATUS_STYLE[status],
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-5" : "size-4"} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: "consulta" | "reclamo" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-sm font-semibold",
        type === "consulta" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent-foreground",
      )}
    >
      {type === "consulta" ? "Consulta" : "Reclamo"}
    </span>
  );
}
