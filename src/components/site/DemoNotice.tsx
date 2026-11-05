import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoNotice({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        tone === "light"
          ? "bg-accent-soft text-accent-foreground ring-1 ring-accent/60"
          : "bg-sidebar-accent text-sidebar-foreground ring-1 ring-sidebar-border",
        className,
      )}
    >
      <FlaskConical className="size-3.5" aria-hidden="true" />
      Prototipo académico · Datos de demostración
    </span>
  );
}
