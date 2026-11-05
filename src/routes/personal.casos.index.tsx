import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Inbox, Search, X } from "lucide-react";
import { useMemo } from "react";
import { LoadingBlock } from "@/components/site/ClientShell";
import { StatusBadge, TypeBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { AGENTS, STATUS_LABEL, STATUSES, type CaseStatus, type CaseType } from "@/lib/cases";
import { useDemoState } from "@/lib/demo-store";
import { formatDateTime } from "@/lib/format";

type Search = {
  q?: string | undefined;
  estado?: CaseStatus | undefined;
  tipo?: CaseType | undefined;
  responsable?: string | undefined;
};

export const Route = createFileRoute("/personal/casos/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    estado: STATUSES.includes(s["estado"] as CaseStatus) ? (s["estado"] as CaseStatus) : undefined,
    tipo: s["tipo"] === "consulta" || s["tipo"] === "reclamo" ? s["tipo"] : undefined,
    responsable: typeof s["responsable"] === "string" && s["responsable"] ? s["responsable"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Bandeja de casos · Panel del personal" },
      { name: "description", content: "Bandeja de casos con búsqueda y filtros." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Bandeja de casos · Panel del personal" },
      { property: "og:description", content: "Busca, filtra y abre casos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inbox_,
});

function Inbox_() {
  const state = useDemoState();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/personal/casos/" });

  const setFilter = (patch: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const rows = useMemo(() => {
    if (!state) return [];
    const q = search.q?.trim().toLowerCase() ?? "";
    return [...state.cases]
      .filter((c) => !search.estado || c.status === search.estado)
      .filter((c) => !search.tipo || c.type === search.tipo)
      .filter((c) =>
        !search.responsable
          ? true
          : search.responsable === "sin"
            ? !c.assignee
            : c.assignee === search.responsable,
      )
      .filter(
        (c) =>
          !q ||
          c.code.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [state, search]);

  if (!state) return <LoadingBlock />;
  const hasFilters = !!(search.q || search.estado || search.tipo || search.responsable);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary-deep">Casos</h1>
        <p className="mt-1 text-muted-foreground">
          {rows.length} de {state.cases.length} casos
        </p>
      </header>

      <div className="card-soft grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <label htmlFor="buscar" className="sr-only">
            Buscar
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="buscar"
            className="field pl-10"
            placeholder="Buscar por código, asunto o nombre"
            value={search.q ?? ""}
            onChange={(e) => setFilter({ q: e.target.value || undefined })}
          />
        </div>
        <FilterSelect
          label="Estado"
          value={search.estado ?? ""}
          onChange={(v) => setFilter({ estado: (v || undefined) as CaseStatus | undefined })}
          options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          allLabel="Todos los estados"
        />
        <FilterSelect
          label="Tipo"
          value={search.tipo ?? ""}
          onChange={(v) => setFilter({ tipo: (v || undefined) as CaseType | undefined })}
          options={[
            { value: "consulta", label: "Consulta" },
            { value: "reclamo", label: "Reclamo" },
          ]}
          allLabel="Todos los tipos"
        />
        <FilterSelect
          label="Responsable"
          value={search.responsable ?? ""}
          onChange={(v) => setFilter({ responsable: v || undefined })}
          options={[...AGENTS.map((a) => ({ value: a, label: a })), { value: "sin", label: "Sin asignar" }]}
          allLabel="Todos los responsables"
        />
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => navigate({ search: {}, replace: true })}
            className="h-12"
          >
            <X aria-hidden="true" /> Limpiar
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="card-soft flex flex-col items-center p-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-semibold">No hay casos que coincidan</p>
          <p className="mt-1 text-muted-foreground">Prueba con otra búsqueda o limpia los filtros.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-soft hidden overflow-hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-muted text-sm text-muted-foreground">
                <tr>
                  {["Código", "Tipo", "Asunto", "Estado", "Responsable", "Última actualización"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold first:pl-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.code} className="group border-t transition-colors hover:bg-primary-soft/60">
                    <td className="py-4 pl-6 pr-4">
                      <Link
                        to="/personal/casos/$codigo"
                        params={{ codigo: c.code }}
                        className="font-display font-bold text-primary underline-offset-4 hover:underline"
                      >
                        {c.code}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <TypeBadge type={c.type} />
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <span className="line-clamp-2">{c.subject}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-4">
                      {c.assignee ?? <span className="text-muted-foreground">Sin asignar</span>}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{formatDateTime(c.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((c) => (
              <li key={c.code}>
                <Link
                  to="/personal/casos/$codigo"
                  params={{ codigo: c.code }}
                  className="card-soft flex items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-primary">{c.code}</span>
                      <TypeBadge type={c.type} />
                    </div>
                    <p className="font-semibold">{c.subject}</p>
                    <StatusBadge status={c.status} />
                    <p className="text-sm text-muted-foreground">
                      {c.assignee ?? "Sin asignar"} · {formatDateTime(c.updatedAt)}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <div>
      <label className="sr-only" htmlFor={`f-${label}`}>
        {label}
      </label>
      <select id={`f-${label}`} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
