import { Link } from "@tanstack/react-router";
import { FileSearch, Home, UserCog } from "lucide-react";
import type { ReactNode } from "react";
import { DemoNotice } from "./DemoNotice";
import { ResetDemoButton } from "./ResetDemoButton";

export function BrandMark() {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="h-9 w-1.5 rounded-full bg-accent" />
      <span className="flex flex-col leading-none">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Supermercados BM
        </span>
        <span className="font-display text-xl font-bold text-primary">Atención al cliente</span>
      </span>
    </span>
  );
}

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="rounded-md" aria-label="Atención al cliente, ir al inicio">
            <BrandMark />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:text-primary"
            >
              <Home className="size-4" aria-hidden="true" />
              Inicio
            </Link>
            <Link
              to="/mi-caso"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:text-primary"
            >
              <FileSearch className="size-4" aria-hidden="true" />
              Consultar mi caso
            </Link>
          </nav>
        </div>
        <div className="border-t bg-background">
          <div className="mx-auto flex max-w-6xl justify-center px-4 py-1.5 sm:justify-start sm:px-6">
            <DemoNotice />
          </div>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>Prototipo académico de JJD TECH. No es un servicio oficial.</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/personal"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 underline-offset-4 hover:text-foreground hover:underline"
            >
              <UserCog className="size-3.5" aria-hidden="true" />
              Acceso del personal (demostración)
            </Link>
            <span aria-hidden="true">·</span>
            <ResetDemoButton className="hover:text-foreground" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageContainer({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div className={`mx-auto px-4 py-10 sm:px-6 sm:py-14 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>
      {children}
    </div>
  );
}

export function LoadingBlock({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
      <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label}
    </div>
  );
}
