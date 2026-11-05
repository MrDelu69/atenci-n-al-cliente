import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, FileSearch, Info } from "lucide-react";
import { useState } from "react";
import { ClientShell, PageContainer } from "@/components/site/ClientShell";
import { Button } from "@/components/ui/button";
import { findCaseByAccess } from "@/lib/cases";
import { getCases, grantAccess } from "@/lib/demo-store";

export const Route = createFileRoute("/mi-caso/")({
  head: () => ({
    meta: [
      { title: "Consultar mi caso · Atención al cliente" },
      { name: "description", content: "Ingresa tu código y clave para ver el estado de tu caso." },
      { property: "og:title", content: "Consultar mi caso · Atención al cliente" },
      { property: "og:description", content: "Revisa el estado y los mensajes de tu caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !key.trim()) {
      setError("Escribe el código y la clave de tu caso.");
      return;
    }
    const found = findCaseByAccess(getCases(), code, key);
    if (!found) {
      setError("No encontramos un caso con esos datos. Revisa el código y la clave e inténtalo de nuevo.");
      return;
    }
    grantAccess(found.code);
    navigate({ to: "/mi-caso/$codigo", params: { codigo: found.code } });
  }

  return (
    <ClientShell>
      <PageContainer narrow>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver al inicio
        </Link>
        <div className="mx-auto max-w-lg">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <FileSearch className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-3xl font-bold text-primary-deep sm:text-4xl">Consultar mi caso</h1>
          <p className="mt-2 text-muted-foreground">
            Usa el código y la clave que recibiste al registrar tu caso.
          </p>

          <form noValidate onSubmit={onSubmit} className="mt-8 card-soft space-y-5 p-6 sm:p-8">
            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive-soft p-4 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="codigo" className="mb-1.5 block font-semibold">
                Código del caso
              </label>
              <input
                id="codigo"
                className="field uppercase"
                placeholder="Ej.: DEMO-005"
                autoComplete="off"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
              />
            </div>
            <div>
              <label htmlFor="clave" className="mb-1.5 block font-semibold">
                Clave de demostración
              </label>
              <input
                id="clave"
                className="field uppercase tracking-widest"
                placeholder="Ej.: ABC-123"
                autoComplete="off"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError(null);
                }}
              />
            </div>
            <Button type="submit" size="xl" className="w-full">
              Ver mi caso
            </Button>
          </form>

          <div className="mt-6 flex gap-3 rounded-xl border bg-surface p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p>
                Este acceso es una simulación local y no representa un sistema seguro real.
              </p>
              <p className="mt-1">
                Para probar: <strong className="text-foreground">DEMO-002</strong> con la clave{" "}
                <strong className="text-foreground">RIO-735</strong>.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </ClientShell>
  );
}
