import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, MessageCircleQuestion, MessageSquareText, ShieldAlert, type LucideIcon } from "lucide-react";
import { ClientShell } from "@/components/site/ClientShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estamos para ayudarte · Atención al cliente" },
      {
        name: "description",
        content:
          "Consulta preguntas frecuentes, envía una consulta o reclamo y revisa el avance de tu caso. Prototipo académico.",
      },
      { property: "og:title", content: "Estamos para ayudarte · Atención al cliente" },
      {
        property: "og:description",
        content: "Consulta información, envía tu caso o revisa cómo avanza tu atención.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Option = {
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  to: "/preguntas" | "/enviar" | "/mi-caso";
  search?: { tipo: "consulta" | "reclamo" };
  tone: "primary" | "accent";
};

const OPTIONS: Option[] = [
  {
    title: "Preguntas frecuentes",
    description: "Encuentra orientación sobre tiendas, horarios, servicios, productos y contacto.",
    action: "Ver preguntas",
    icon: MessageCircleQuestion,
    to: "/preguntas",
    tone: "primary",
  },
  {
    title: "Enviar una consulta",
    description: "Escríbenos tu duda y el personal de atención te responderá en tu caso.",
    action: "Escribir consulta",
    icon: MessageSquareText,
    to: "/enviar",
    search: { tipo: "consulta" },
    tone: "primary",
  },
  {
    title: "Presentar un reclamo",
    description: "Cuéntanos qué pasó para que el personal pueda revisarlo con atención.",
    action: "Presentar reclamo",
    icon: ShieldAlert,
    to: "/enviar",
    search: { tipo: "reclamo" },
    tone: "accent",
  },
  {
    title: "Consultar mi caso",
    description: "Usa tu código y clave para ver el estado y los mensajes de tu caso.",
    action: "Ver mi caso",
    icon: FileSearch,
    to: "/mi-caso",
    tone: "primary",
  },
];

function Index() {
  return (
    <ClientShell>
      <section className="border-b bg-surface">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
            Hola, te damos la bienvenida
          </p>
          <h1 className="max-w-2xl text-4xl font-bold text-primary-deep sm:text-5xl">
            Estamos para ayudarte
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Consulta información, envíanos tu caso o revisa cómo avanza tu atención.
          </p>
        </div>
      </section>

      <section aria-labelledby="opciones" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 id="opciones" className="sr-only">
          ¿Qué necesitas hacer?
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {OPTIONS.map((o, i) => (
            <li key={o.title} className="fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <Link
                to={o.to}
                search={o.search ?? {}}
                className="group flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift sm:p-7"
              >
                <span
                  className={
                    o.tone === "accent"
                      ? "flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-foreground"
                      : "flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"
                  }
                >
                  <o.icon className="size-7" aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-display text-xl font-semibold text-foreground">{o.title}</span>
                  <span className="text-muted-foreground">{o.description}</span>
                </span>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 font-semibold text-primary">
                  {o.action}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ClientShell>
  );
}
