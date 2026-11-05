import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Inbox, LayoutDashboard, Menu, MonitorSmartphone } from "lucide-react";
import { useState } from "react";
import { DemoNotice } from "@/components/site/DemoNotice";
import { ResetDemoButton } from "@/components/site/ResetDemoButton";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/personal")({
  head: () => ({
    meta: [
      { title: "Panel del personal · Atención al cliente" },
      { name: "description", content: "Panel de demostración para organizar y responder casos." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Panel del personal · Atención al cliente" },
      { property: "og:description", content: "Organiza la atención y comunica respuestas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffLayout,
});

const NAV = [
  { to: "/personal", label: "Resumen", icon: LayoutDashboard, exact: true },
  { to: "/personal/casos", label: "Casos", icon: Inbox, exact: false },
  { to: "/", label: "Vista del cliente", icon: MonitorSmartphone, exact: true },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <nav aria-label="Panel del personal" className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: n.exact }}
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 font-semibold text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
        >
          <n.icon className="size-5" aria-hidden="true" />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-9 w-1.5 rounded-full bg-sidebar-primary" />
        <span className="flex flex-col leading-none">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/70">
            Personal
          </span>
          <span className="font-display text-lg font-bold text-sidebar-foreground">Atención al cliente</span>
        </span>
      </div>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto space-y-3 text-sm text-sidebar-foreground/80">
        <DemoNotice tone="dark" />
        <p>Sesión de demostración sin credenciales.</p>
        <ResetDemoButton className="-ml-2 text-sidebar-foreground hover:bg-sidebar-accent" />
      </div>
    </div>
  );
}

function StaffLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      <div className="flex items-center justify-between gap-3 bg-sidebar px-4 py-3 lg:hidden">
        <span className="font-display font-bold text-sidebar-foreground">Atención al cliente · Personal</span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sidebar-accent px-3 font-semibold text-sidebar-foreground"
            >
              <Menu className="size-5" aria-hidden="true" /> Menú
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
            <SheetTitle className="sr-only">Menú del personal</SheetTitle>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <main id="contenido" className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
