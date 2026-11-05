import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CircleDot,
  FileCheck2,
  Lock,
  MessageSquareReply,
  Send,
  UserRound,
  Headset,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientShell, LoadingBlock, PageContainer } from "@/components/site/ClientShell";
import { STATUS_ICON, STATUS_STYLE, StatusBadge, TypeBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  addClientMessage,
  clientEvents,
  STATUS_DESCRIPTION,
  STATUS_LABEL,
  type SupportCase,
} from "@/lib/cases";
import { getGranted, saveCase, useDemoState } from "@/lib/demo-store";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mi-caso/$codigo")({
  head: () => ({
    meta: [
      { title: "Seguimiento de mi caso · Atención al cliente" },
      { name: "description", content: "Estado, avances y mensajes de tu caso." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Seguimiento de mi caso · Atención al cliente" },
      { property: "og:description", content: "Revisa el estado y los mensajes de tu caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const { codigo } = Route.useParams();
  const state = useDemoState();
  const [granted, setGranted] = useState<string[] | null>(null);
  useEffect(() => setGranted(getGranted()), []);

  if (!state || granted === null) {
    return (
      <ClientShell>
        <LoadingBlock />
      </ClientShell>
    );
  }

  const c = granted.includes(codigo) ? state.cases.find((x) => x.code === codigo) : undefined;

  if (!c) {
    return (
      <ClientShell>
        <PageContainer narrow>
          <div className="card-soft p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Lock className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-primary-deep">Ingresa tus datos para ver el caso</h1>
            <p className="mt-2 text-muted-foreground">
              Necesitamos el código y la clave del caso para mostrarte su seguimiento.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/mi-caso">Ir a consultar mi caso</Link>
            </Button>
          </div>
        </PageContainer>
      </ClientShell>
    );
  }

  return <CaseTracking c={c} />;
}

function CaseTracking({ c }: { c: SupportCase }) {
  const events = clientEvents(c);
  const timeline = events.filter((e) => e.kind === "creado" || e.kind === "estado");
  const messages = events.filter((e) => e.kind === "mensaje_personal" || e.kind === "mensaje_cliente");
  const Icon = STATUS_ICON[c.status];

  return (
    <ClientShell>
      <PageContainer>
        <Link
          to="/mi-caso"
          className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Consultar otro caso
        </Link>

        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold tracking-wide text-muted-foreground">{c.code}</span>
            <TypeBadge type={c.type} />
          </div>
          <h1 className="text-2xl font-bold text-primary-deep sm:text-3xl">{c.subject}</h1>
          <p className="text-sm text-muted-foreground">Registrado el {formatDate(c.createdAt)}</p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <section
              aria-labelledby="estado"
              className={cn("fade-up rounded-2xl border p-6", STATUS_STYLE[c.status])}
            >
              <h2 id="estado" className="sr-only">
                Estado actual
              </h2>
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold opacity-80">Estado actual</p>
                  <p className="font-display text-2xl font-bold">{STATUS_LABEL[c.status]}</p>
                  <p className="mt-1 text-foreground">{STATUS_DESCRIPTION[c.status]}</p>
                  {c.status === "en_espera" && c.waitingReason && (
                    <p className="mt-3 rounded-lg bg-surface p-3 text-foreground">
                      <strong>Qué necesitamos: </strong>
                      {c.waitingReason}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {c.status === "en_espera" && <ProvideInfo c={c} />}

            {c.status === "finalizado" && c.finalAnswer && (
              <section aria-labelledby="respuesta" className="fade-up card-soft p-6">
                <h2 id="respuesta" className="flex items-center gap-2 text-xl font-bold text-primary-deep">
                  <FileCheck2 className="size-5 text-success" aria-hidden="true" /> Respuesta final
                </h2>
                <p className="mt-3 whitespace-pre-line">{c.finalAnswer}</p>
              </section>
            )}

            <section aria-labelledby="mensajes" className="card-soft p-6">
              <h2 id="mensajes" className="text-xl font-bold text-primary-deep">
                Mensajes
              </h2>
              {messages.length === 0 ? (
                <p className="mt-3 rounded-lg bg-muted p-4 text-muted-foreground">
                  Aún no hay mensajes. Cuando el personal te escriba, lo verás aquí.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {messages.map((m) => {
                    const staff = m.kind === "mensaje_personal";
                    return (
                      <li
                        key={m.id}
                        className={cn(
                          "rounded-xl border p-4",
                          staff ? "border-primary/20 bg-primary-soft" : "ml-6 bg-background",
                        )}
                      >
                        <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold">
                          {staff ? (
                            <Headset className="size-4 text-primary" aria-hidden="true" />
                          ) : (
                            <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                          )}
                          {staff ? "Equipo de atención" : "Tú"}
                          <span className="font-normal text-muted-foreground">· {formatDateTime(m.at)}</span>
                        </p>
                        <p className="mt-1.5 whitespace-pre-line">{m.text}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <aside aria-labelledby="avances" className="card-soft h-fit p-6">
            <h2 id="avances" className="text-xl font-bold text-primary-deep">
              Avances
            </h2>
            <ol className="mt-5 space-y-0">
              {timeline.map((e, i) => {
                const s = e.status ?? "recibido";
                const SIcon = STATUS_ICON[s];
                const last = i === timeline.length - 1;
                return (
                  <li key={e.id} className="relative flex gap-3 pb-6 last:pb-0">
                    {!last && <span aria-hidden="true" className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 bg-border" />}
                    <span
                      className={cn(
                        "relative flex size-8 shrink-0 items-center justify-center rounded-full border",
                        STATUS_STYLE[s],
                      )}
                    >
                      <SIcon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {e.kind === "creado" ? "Caso registrado" : STATUS_LABEL[s]}
                        {last && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                            <CircleDot className="size-3" aria-hidden="true" /> Actual
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(e.at)}</p>
                      {e.kind === "estado" && e.status === "en_espera" && e.text && (
                        <p className="mt-1 text-sm">{e.text}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6 border-t pt-4">
              <p className="text-sm text-muted-foreground">Estado actual</p>
              <StatusBadge status={c.status} className="mt-1.5" />
            </div>
          </aside>
        </div>
      </PageContainer>
    </ClientShell>
  );
}

function ProvideInfo({ c }: { c: SupportCase }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = addClientMessage(c, text);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    saveCase(r.value);
    setText("");
    setError(null);
    toast.success("Gracias. El personal ya puede ver tu información.");
  }

  return (
    <section aria-labelledby="aportar" className="fade-up card-soft border-accent/70 p-6">
      <h2 id="aportar" className="flex items-center gap-2 text-xl font-bold text-primary-deep">
        <MessageSquareReply className="size-5 text-primary" aria-hidden="true" /> Aportar información
      </h2>
      <p className="mt-1 text-muted-foreground">Responde aquí lo que el personal te pidió.</p>
      <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3">
        <label htmlFor="aporte" className="block font-semibold">
          Tu respuesta
        </label>
        <textarea
          id="aporte"
          className="field min-h-28"
          rows={4}
          value={text}
          aria-invalid={!!error}
          aria-describedby={error ? "aporte-error" : undefined}
          placeholder="Ej.: La compra fue el lunes 26 de octubre por un total aproximado de ₡18 500."
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
        />
        {error && (
          <p id="aporte-error" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg">
          <Send aria-hidden="true" /> Enviar información
        </Button>
      </form>
    </section>
  );
}
