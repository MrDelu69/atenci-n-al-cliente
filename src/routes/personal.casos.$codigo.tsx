import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Eye,
  FileText,
  Headset,
  Lock,
  MessageSquareReply,
  RefreshCw,
  Send,
  Tag,
  UserCheck,
  UserRound,
  History,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { LoadingBlock } from "@/components/site/ClientShell";
import { STATUS_ICON, StatusBadge, TypeBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  addInternalNote,
  addStaffMessage,
  AGENTS,
  assign,
  changeStatus,
  classify,
  STATUS_LABEL,
  STATUSES,
  TOPICS,
  type CaseEvent,
  type CaseStatus,
  type CaseType,
  type Result,
  type SupportCase,
} from "@/lib/cases";
import { saveCase, useDemoState } from "@/lib/demo-store";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/personal/casos/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.codigo} · Gestión del caso` },
      { name: "description", content: "Gestión de un caso: estado, responsable, mensajes y notas." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `${params.codigo} · Gestión del caso` },
      { property: "og:description", content: "Gestión de un caso de atención al cliente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseDetail,
});

function apply(r: Result, success: string): boolean {
  if (!r.ok) {
    toast.error(r.error);
    return false;
  }
  saveCase(r.value);
  toast.success(success);
  return true;
}

function CaseDetail() {
  const { codigo } = Route.useParams();
  const state = useDemoState();
  if (!state) return <LoadingBlock />;
  const c = state.cases.find((x) => x.code === codigo);

  if (!c) {
    return (
      <div className="card-soft p-10 text-center">
        <h1 className="text-2xl font-bold text-primary-deep">No encontramos el caso {codigo}</h1>
        <p className="mt-2 text-muted-foreground">Puede que se haya restablecido la demostración.</p>
        <Button asChild className="mt-6" size="lg">
          <Link to="/personal/casos">Volver a la bandeja</Link>
        </Button>
      </div>
    );
  }

  const lastEvent = c.events[c.events.length - 1];
  const clientReplied = c.status === "en_espera" && lastEvent?.kind === "mensaje_cliente";

  return (
    <div className="space-y-6">
      <Link
        to="/personal/casos"
        className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver a la bandeja
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold tracking-wide text-muted-foreground">{c.code}</span>
            <TypeBadge type={c.type} />
            <span className="text-sm text-muted-foreground">· {c.topic}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-primary-deep sm:text-3xl">{c.subject}</h1>
        </div>
        <StatusBadge status={c.status} size="lg" />
      </header>

      {clientReplied && (
        <div
          role="status"
          className="fade-up flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2 font-semibold text-primary">
            <MessageSquareReply className="size-5" aria-hidden="true" />
            El cliente aportó información nueva.
          </p>
          <Button
            size="sm"
            onClick={() => apply(changeStatus(c, "en_revision", { author: c.assignee ?? undefined }), "El caso volvió a En revisión.")}
          >
            <RefreshCw aria-hidden="true" /> Volver a En revisión
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <Panel title="Solicitud original" icon={<FileText className="size-5" aria-hidden="true" />}>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Info label="Nombre" value={c.name} />
              <Info label="Correo" value={c.email} />
              <Info label="Sucursal" value={c.branch} />
              <Info label="Registrado" value={formatDate(c.createdAt)} />
            </dl>
            <p className="mt-4 whitespace-pre-line rounded-lg bg-muted p-4">{c.description}</p>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2">
            <Composer
              key={`msg-${c.code}`}
              variant="public"
              title="Mensaje visible para el cliente"
              hint="El cliente lo verá en el seguimiento de su caso."
              cta="Publicar mensaje"
              placeholder="Ej.: Hola, ya estamos revisando tu caso."
              onSubmit={(t) => apply(addStaffMessage(c, t), "Mensaje publicado para el cliente.")}
            />
            <Composer
              key={`note-${c.code}`}
              variant="internal"
              title="Nota interna: solo personal"
              hint="Nunca se muestra al cliente."
              cta="Guardar nota interna"
              placeholder="Ej.: Pendiente confirmar con la sucursal."
              onSubmit={(t) => apply(addInternalNote(c, t, c.assignee ?? "Personal"), "Nota interna guardada.")}
            />
          </div>

          <Panel title="Actividad del caso" icon={<History className="size-5" aria-hidden="true" />}>
            <ol className="space-y-3">
              {[...c.events].reverse().map((e) => (
                <ActivityItem key={e.id} e={e} />
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <StatusPanel key={`${c.code}-${c.status}`} c={c} />
          <AssigneePanel key={`${c.code}-a-${c.assignee}`} c={c} />
          <ClassifyPanel key={`${c.code}-t-${c.type}-${c.topic}`} c={c} />
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-soft p-5 sm:p-6", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-primary-deep">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold break-words">{value}</dd>
    </div>
  );
}

function StatusPanel({ c }: { c: SupportCase }) {
  const [to, setTo] = useState<CaseStatus>(c.status);
  const [reason, setReason] = useState(c.waitingReason ?? "");
  const [answer, setAnswer] = useState(c.finalAnswer ?? "");
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const r = changeStatus(c, to, { reason, finalAnswer: answer, author: c.assignee ?? undefined });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    saveCase(r.value);
    toast.success(`Estado actualizado a ${STATUS_LABEL[to]}.`);
  }

  return (
    <Panel title="Estado" icon={<RefreshCw className="size-5" aria-hidden="true" />}>
      <form onSubmit={save} noValidate className="space-y-4">
        <fieldset>
          <legend className="sr-only">Nuevo estado</legend>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => {
              const Icon = STATUS_ICON[s];
              const active = to === s;
              return (
                <label
                  key={s}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-[1.5px] px-3 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring",
                    active ? "border-primary bg-primary-soft text-primary" : "border-input hover:border-primary/50",
                  )}
                >
                  <input
                    type="radio"
                    name="estado"
                    className="sr-only"
                    checked={active}
                    onChange={() => {
                      setTo(s);
                      setError(null);
                    }}
                  />
                  <Icon className="size-4" aria-hidden="true" />
                  {STATUS_LABEL[s]}
                  {s === c.status && <span className="sr-only"> (actual)</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        {to === "en_revision" && !c.assignee && (
          <p className="rounded-lg bg-status-espera-soft p-3 text-sm text-status-espera">
            Asigna un responsable antes de pasar a En revisión.
          </p>
        )}

        {to === "en_espera" && (
          <div>
            <label htmlFor="motivo" className="mb-1.5 block text-sm font-semibold">
              ¿Qué hace falta? <span className="font-normal text-muted-foreground">(lo verá el cliente)</span>
            </label>
            <textarea
              id="motivo"
              className="field min-h-24 text-sm"
              value={reason}
              placeholder="Ej.: Necesitamos la fecha aproximada de la compra."
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
            />
          </div>
        )}

        {to === "finalizado" && (
          <div>
            <label htmlFor="respuesta" className="mb-1.5 block text-sm font-semibold">
              Respuesta final <span className="font-normal text-muted-foreground">(lo verá el cliente)</span>
            </label>
            <textarea
              id="respuesta"
              className="field min-h-32 text-sm"
              value={answer}
              placeholder="Resume la respuesta y la gestión realizada."
              onChange={(e) => {
                setAnswer(e.target.value);
                setError(null);
              }}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={to === c.status}>
          {to === c.status ? `Estado actual: ${STATUS_LABEL[c.status]}` : `Cambiar a ${STATUS_LABEL[to]}`}
        </Button>
        <p className="text-xs text-muted-foreground">Cambiar el estado no crea una nota interna.</p>
      </form>
    </Panel>
  );
}

function AssigneePanel({ c }: { c: SupportCase }) {
  const [value, setValue] = useState(c.assignee ?? "");
  return (
    <Panel title="Responsable" icon={<UserCheck className="size-5" aria-hidden="true" />}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          apply(assign(c, value || null), value ? `Caso asignado a ${value}.` : "Responsable retirado.");
        }}
      >
        <label htmlFor="responsable" className="sr-only">
          Responsable
        </label>
        <select id="responsable" className="field" value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">Sin asignar</option>
          {AGENTS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="w-full" disabled={(c.assignee ?? "") === value}>
          Guardar responsable
        </Button>
      </form>
    </Panel>
  );
}

function ClassifyPanel({ c }: { c: SupportCase }) {
  const [type, setType] = useState<CaseType>(c.type);
  const [topic, setTopic] = useState(c.topic);
  const unchanged = type === c.type && topic === c.topic;
  return (
    <Panel title="Clasificación" icon={<Tag className="size-5" aria-hidden="true" />}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          apply(classify(c, type, topic), "Clasificación guardada.");
        }}
      >
        <div>
          <label htmlFor="tipo" className="mb-1.5 block text-sm font-semibold">
            Tipo
          </label>
          <select id="tipo" className="field" value={type} onChange={(e) => setType(e.target.value as CaseType)}>
            <option value="consulta">Consulta</option>
            <option value="reclamo">Reclamo</option>
          </select>
        </div>
        <div>
          <label htmlFor="tema" className="mb-1.5 block text-sm font-semibold">
            Tema
          </label>
          <select id="tema" className="field" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline" className="w-full" disabled={unchanged}>
          Guardar clasificación
        </Button>
      </form>
    </Panel>
  );
}

function Composer({
  variant,
  title,
  hint,
  cta,
  placeholder,
  onSubmit,
}: {
  variant: "public" | "internal";
  title: string;
  hint: string;
  cta: string;
  placeholder: string;
  onSubmit: (text: string) => boolean;
}) {
  const [text, setText] = useState("");
  const internal = variant === "internal";
  const id = `composer-${variant}`;
  return (
    <section
      className={cn(
        "rounded-xl border-[1.5px] p-5",
        internal ? "border-dashed border-internal/50 bg-internal-soft" : "border-primary/30 bg-surface shadow-soft",
      )}
    >
      <h2 className={cn("flex items-center gap-2 font-bold", internal ? "text-internal" : "text-primary")}>
        {internal ? <Lock className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <form
        className="mt-3 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit(text)) setText("");
        }}
      >
        <label htmlFor={id} className="sr-only">
          {title}
        </label>
        <textarea
          id={id}
          className="field min-h-24 text-sm"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" variant={internal ? "outline" : "default"} className="w-full">
          {internal ? <Lock aria-hidden="true" /> : <Send aria-hidden="true" />}
          {cta}
        </Button>
      </form>
    </section>
  );
}

function ActivityItem({ e }: { e: CaseEvent }) {
  const time = <span className="text-xs font-normal text-muted-foreground">{formatDateTime(e.at)}</span>;
  if (e.kind === "nota_interna") {
    return (
      <li className="rounded-lg border border-dashed border-internal/50 bg-internal-soft p-3">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-internal">
          <Lock className="size-4" aria-hidden="true" /> Nota interna · {e.author ?? "Personal"} {time}
        </p>
        <p className="mt-1 whitespace-pre-line text-sm">{e.text}</p>
      </li>
    );
  }
  if (e.kind === "mensaje_personal" || e.kind === "mensaje_cliente") {
    const staff = e.kind === "mensaje_personal";
    return (
      <li className={cn("rounded-lg border p-3", staff ? "border-primary/25 bg-primary-soft" : "bg-accent-soft border-accent/60")}>
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {staff ? <Headset className="size-4 text-primary" aria-hidden="true" /> : <UserRound className="size-4" aria-hidden="true" />}
          {staff ? "Mensaje al cliente" : `Información del cliente · ${e.author ?? ""}`}
          <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
            <Eye className="size-3" aria-hidden="true" /> visible para el cliente
          </span>
          {time}
        </p>
        <p className="mt-1 whitespace-pre-line text-sm">{e.text}</p>
      </li>
    );
  }
  const label =
    e.kind === "creado"
      ? "Caso registrado"
      : e.kind === "estado" && e.status
        ? `Estado: ${STATUS_LABEL[e.status]}`
        : e.text;
  return (
    <li className="flex flex-col gap-0.5 px-3 py-1.5 text-sm sm:flex-row sm:items-center sm:gap-2">
      <span className="font-semibold">{label}</span>
      {e.kind === "estado" && e.status === "en_espera" && e.text && (
        <span className="text-muted-foreground">— {e.text}</span>
      )}
      {e.kind === "clasificacion" || e.kind === "asignacion" ? (
        <span className="text-xs text-muted-foreground">(solo personal)</span>
      ) : null}
      {time}
    </li>
  );
}

