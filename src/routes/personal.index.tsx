import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers } from "lucide-react";
import { LoadingBlock } from "@/components/site/ClientShell";
import { STATUS_ICON, STATUS_STYLE } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  countByStatus,
  countByTypeAndStatus,
  STATUS_LABEL,
  STATUSES,
  TYPE_LABEL,
  type CaseType,
} from "@/lib/cases";
import { useDemoState } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/personal/")({
  head: () => ({
    meta: [
      { title: "Resumen · Panel del personal" },
      { name: "description", content: "Recuento de casos por tipo y estado." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Resumen · Panel del personal" },
      { property: "og:description", content: "Recuento de casos por tipo y estado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Summary,
});

function Summary() {
  const state = useDemoState();
  if (!state) return <LoadingBlock />;
  const counts = countByStatus(state.cases);
  const byType = countByTypeAndStatus(state.cases);

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary-deep">Resumen</h1>
          <p className="mt-1 text-muted-foreground">Casos registrados, agrupados por estado y tipo.</p>
        </div>
        <Button asChild size="lg">
          <Link to="/personal/casos">
            Ir a la bandeja <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <li className="card-soft flex flex-col gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Layers className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-muted-foreground">Total de casos</span>
          <span className="font-display text-4xl font-bold text-primary-deep">{counts.total}</span>
        </li>
        {STATUSES.map((s) => {
          const Icon = STATUS_ICON[s];
          return (
            <li key={s}>
              <Link
                to="/personal/casos"
                search={{ estado: s }}
                className="card-soft flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-lift"
              >
                <span className={cn("flex size-10 items-center justify-center rounded-xl border", STATUS_STYLE[s])}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {s === "recibido" ? "Recibidos" : s === "finalizado" ? "Finalizados" : STATUS_LABEL[s]}
                </span>
                <span className="font-display text-4xl font-bold text-foreground">{counts[s]}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="por-tipo" className="card-soft overflow-hidden">
        <h2 id="por-tipo" className="border-b px-6 py-4 text-xl font-bold text-primary-deep">
          Por tipo y estado
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left">
            <thead className="bg-muted text-sm text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Tipo
                </th>
                {STATUSES.map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-center font-semibold">
                    {STATUS_LABEL[s]}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-center font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(["consulta", "reclamo"] as CaseType[]).map((t) => (
                <tr key={t} className="border-t">
                  <th scope="row" className="px-6 py-4 font-semibold">
                    {TYPE_LABEL[t]}s
                  </th>
                  {STATUSES.map((s) => (
                    <td key={s} className="px-4 py-4 text-center font-display text-lg">
                      {byType[t][s]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center font-display text-lg font-bold text-primary">
                    {byType[t].total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
