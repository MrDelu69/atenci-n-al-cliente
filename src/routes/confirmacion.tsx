import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, CheckCircle2, Copy, FileSearch, Home, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientShell, LoadingBlock, PageContainer } from "@/components/site/ClientShell";
import { StatusBadge, TypeBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { getLastCreated, grantAccess, useDemoState } from "@/lib/demo-store";

export const Route = createFileRoute("/confirmacion")({
  validateSearch: (s: Record<string, unknown>): { codigo?: string | undefined } => ({
    codigo: typeof s["codigo"] === "string" ? s["codigo"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Tu caso quedó registrado · Atención al cliente" },
      { name: "description", content: "Confirmación del registro de tu caso con código y clave de demostración." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Tu caso quedó registrado · Atención al cliente" },
      { property: "og:description", content: "Guarda tu código y clave para consultar el avance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { codigo } = Route.useSearch();
  const state = useDemoState();
  const navigate = useNavigate();
  const [lastCreated, setLast] = useState<string | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => setLast(getLastCreated()), []);

  if (!state || lastCreated === undefined) {
    return (
      <ClientShell>
        <LoadingBlock />
      </ClientShell>
    );
  }

  const c = codigo && codigo === lastCreated ? state.cases.find((x) => x.code === codigo) : undefined;

  if (!c) {
    return (
      <ClientShell>
        <PageContainer narrow>
          <div className="card-soft p-8 text-center">
            <h1 className="text-2xl font-bold text-primary-deep">No hay una confirmación para mostrar</h1>
            <p className="mt-2 text-muted-foreground">
              Si ya registraste un caso, puedes consultarlo con tu código y clave.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/mi-caso">
                  <FileSearch aria-hidden="true" /> Consultar mi caso
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  <Home aria-hidden="true" /> Volver al inicio
                </Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </ClientShell>
    );
  }

  async function copy() {
    const text = `Código del caso: ${c!.code}\nClave de demostración: ${c!.accessKey}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Datos de acceso copiados.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("No se pudo copiar. Anota el código y la clave.");
    }
  }

  function viewCase() {
    grantAccess(c!.code);
    navigate({ to: "/mi-caso/$codigo", params: { codigo: c!.code } });
  }

  return (
    <ClientShell>
      <PageContainer narrow>
        <div className="fade-up card-soft overflow-hidden">
          <div className="flex flex-col items-center bg-status-finalizado-soft px-6 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-success text-primary-foreground">
              <CheckCircle2 className="size-9" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-3xl font-bold text-primary-deep">Tu caso quedó registrado</h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Gracias por escribirnos. Guarda estos datos para consultar cómo avanza tu atención.
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <dt className="text-sm text-muted-foreground">Código del caso</dt>
                <dd className="mt-1 font-display text-2xl font-bold tracking-wide text-primary">{c.code}</dd>
              </div>
              <div className="rounded-xl border border-accent/60 bg-accent-soft p-4">
                <dt className="flex items-center gap-1.5 text-sm text-accent-foreground">
                  <KeyRound className="size-4" aria-hidden="true" /> Clave de demostración
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold tracking-widest text-foreground">
                  {c.accessKey}
                </dd>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd className="mt-1.5">
                  <StatusBadge status={c.status} />
                </dd>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <dt className="text-sm text-muted-foreground">Tipo</dt>
                <dd className="mt-1.5">
                  <TypeBadge type={c.type} />
                </dd>
              </div>
            </dl>

            <p className="text-sm text-muted-foreground">
              El personal revisará tu caso y verás sus mensajes en el seguimiento.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="xl" onClick={viewCase} className="sm:flex-1">
                <FileSearch aria-hidden="true" /> Ver mi caso
              </Button>
              <Button size="xl" variant="outline" onClick={copy} className="sm:flex-1">
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                {copied ? "Copiado" : "Copiar datos de acceso"}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </ClientShell>
  );
}
