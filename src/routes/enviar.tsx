import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Info, MessageSquareText, Send, ShieldAlert } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { ClientShell, PageContainer } from "@/components/site/ClientShell";
import { Button } from "@/components/ui/button";
import {
  BRANCHES,
  createCase,
  validateCaseForm,
  type CaseFormErrors,
  type CaseFormValues,
  type CaseType,
} from "@/lib/cases";
import { getCases, saveCase, setLastCreated } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

type Search = { tipo?: CaseType | undefined; tema?: string | undefined };

export const Route = createFileRoute("/enviar")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tipo: s["tipo"] === "reclamo" ? "reclamo" : s["tipo"] === "consulta" ? "consulta" : undefined,
    tema: typeof s["tema"] === "string" ? s["tema"].slice(0, 80) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Enviar consulta o reclamo · Atención al cliente" },
      {
        name: "description",
        content: "Registra tu consulta o reclamo y recibe un código para seguir su avance.",
      },
      { property: "og:title", content: "Enviar consulta o reclamo · Atención al cliente" },
      {
        property: "og:description",
        content: "Cuéntanos tu caso y consulta luego cómo avanza.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SendPage,
});

function SendPage() {
  const { tipo, tema } = Route.useSearch();
  return (
    <ClientShell>
      <PageContainer narrow>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver al inicio
        </Link>
        <CaseForm key={`${tipo ?? ""}-${tema ?? ""}`} initialType={tipo ?? "consulta"} topic={tema} />
      </PageContainer>
    </ClientShell>
  );
}

function CaseForm({ initialType, topic }: { initialType: CaseType; topic?: string | undefined }) {
  const navigate = useNavigate();
  const [values, setValues] = useState<CaseFormValues>({
    name: "",
    email: "",
    type: initialType,
    branch: "",
    subject: topic ? `Consulta sobre ${topic.toLowerCase()}` : "",
    description: "",
  });
  const [errors, setErrors] = useState<CaseFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function update<K extends keyof CaseFormValues>(key: K, value: CaseFormValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) setErrors(validateCaseForm(next));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const found = validateCaseForm(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSending(true);
    const c = createCase(getCases(), values);
    saveCase(c);
    setLastCreated(c.code);
    navigate({ to: "/confirmacion", search: { codigo: c.code } });
  }

  const isClaim = values.type === "reclamo";
  const errorCount = Object.keys(errors).length;

  return (
    <>
      <h1 className="text-3xl font-bold text-primary-deep sm:text-4xl">
        {isClaim ? "Presentar un reclamo" : "Enviar una consulta"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Completa los datos. Te daremos un código para que consultes el avance de tu caso.
      </p>

      <div className="mt-6 flex gap-3 rounded-xl border border-accent/60 bg-accent-soft p-4 text-sm text-accent-foreground">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>
          Esto es una demostración. La información se guarda solo en este navegador y no se enviará
          a BM.
        </p>
      </div>

      <form ref={formRef} noValidate onSubmit={onSubmit} className="mt-8 card-soft space-y-6 p-5 sm:p-8">
        {submitted && errorCount > 0 && (
          <div
            role="alert"
            className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive-soft p-4 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>Revisa {errorCount === 1 ? "el campo marcado" : `los ${errorCount} campos marcados`} para continuar.</p>
          </div>
        )}

        <fieldset>
          <legend className="mb-2 font-semibold text-foreground">Tipo de caso</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <TypeOption
              checked={values.type === "consulta"}
              onChange={() => update("type", "consulta")}
              icon={<MessageSquareText className="size-5" aria-hidden="true" />}
              title="Consulta"
              hint="Una duda o pedido de información"
            />
            <TypeOption
              checked={values.type === "reclamo"}
              onChange={() => update("type", "reclamo")}
              icon={<ShieldAlert className="size-5" aria-hidden="true" />}
              title="Reclamo"
              hint="Algo que no salió como esperabas"
            />
          </div>
          {errors.type && <FieldError id="type-error">{errors.type}</FieldError>}
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nombre" error={errors.name}>
            {(p) => (
              <input
                {...p}
                name="name"
                autoComplete="name"
                placeholder="Ej.: María Fernández"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
              />
            )}
          </Field>
          <Field label="Correo electrónico" error={errors.email} hint="Solo para identificar tu caso.">
            {(p) => (
              <input
                {...p}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="Ej.: maria@ejemplo.com"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
              />
            )}
          </Field>
        </div>

        <Field label="Sucursal relacionada" error={errors.branch}>
          {(p) => (
            <select
              {...p}
              name="branch"
              value={values.branch}
              onChange={(e) => update("branch", e.target.value)}
            >
              <option value="">Elige una opción</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Asunto" error={errors.subject}>
          {(p) => (
            <input
              {...p}
              name="subject"
              maxLength={100}
              placeholder={isClaim ? "Ej.: No recibí la factura de mi compra" : "Ej.: ¿La tienda tiene parqueo?"}
              value={values.subject}
              onChange={(e) => update("subject", e.target.value)}
            />
          )}
        </Field>

        <Field
          label="Descripción"
          error={errors.description}
          hint={`${values.description.trim().length} de 1500 caracteres · mínimo 20`}
        >
          {(p) => (
            <textarea
              {...p}
              name="description"
              rows={6}
              maxLength={1500}
              placeholder="Cuéntanos con tus palabras qué necesitas o qué pasó."
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              className={cn(p.className, "min-h-36 resize-y")}
            />
          )}
        </Field>

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">No pedimos cédula ni datos bancarios.</p>
          <Button type="submit" size="xl" disabled={sending}>
            <Send aria-hidden="true" />
            Enviar mi caso
          </Button>
        </div>
      </form>
    </>
  );
}

function TypeOption({
  checked,
  onChange,
  icon,
  title,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] p-4 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring",
        checked ? "border-primary bg-primary-soft" : "border-input bg-surface hover:border-primary/50",
      )}
    >
      <input
        type="radio"
        name="type"
        checked={checked}
        onChange={onChange}
        className="mt-1 size-4 accent-[var(--primary)]"
      />
      <span className="flex flex-col">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <span className="text-primary">{icon}</span>
          {title}
        </span>
        <span className="text-sm text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

type FieldProps = {
  id: string;
  className: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string | undefined;
};

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: (p: FieldProps) => ReactNode;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-semibold text-foreground">
        {label}
      </label>
      {children({
        id,
        className: "field",
        "aria-invalid": !!error,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-destructive">
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
