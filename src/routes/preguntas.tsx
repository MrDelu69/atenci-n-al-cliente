import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bot,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquareText,
  Package,
  Phone,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ClientShell, PageContainer } from "@/components/site/ClientShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/preguntas")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes · Atención al cliente" },
      {
        name: "description",
        content: "Asistente guiado con respuestas sobre tiendas, horarios, servicios, productos y contacto.",
      },
      { property: "og:title", content: "Preguntas frecuentes · Atención al cliente" },
      {
        property: "og:description",
        content: "Elige un tema y recibe orientación hacia la información oficial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

type Topic = {
  id: string;
  label: string;
  icon: LucideIcon;
  answer: string[];
  link: { href: string; label: string };
};

const TIENDAS = "https://bm.cr/tiendas";
const CONTACTO = "https://www.bm.cr/contacto";
const PRODUCTOS = "https://bm.cr/productos/productos-importados";

const TOPICS: Topic[] = [
  {
    id: "tiendas",
    label: "Tiendas y ubicaciones",
    icon: MapPin,
    answer: [
      "Puedes ver la lista de tiendas y su ubicación en el directorio oficial.",
      "Ahí encontrarás la dirección de cada sucursal para planear tu visita.",
    ],
    link: { href: TIENDAS, label: "Ver directorio de tiendas" },
  },
  {
    id: "horarios",
    label: "Horarios",
    icon: Clock,
    answer: [
      "Los horarios pueden variar según la sucursal y en días especiales.",
      "Para confirmar el horario de una tienda, revisa su información en el directorio oficial.",
    ],
    link: { href: TIENDAS, label: "Ver horarios en el directorio" },
  },
  {
    id: "servicios",
    label: "Servicios por sucursal",
    icon: Store,
    answer: [
      "Cada sucursal puede ofrecer servicios distintos.",
      "En el directorio oficial puedes consultar la información publicada para cada tienda.",
    ],
    link: { href: TIENDAS, label: "Ver servicios por tienda" },
  },
  {
    id: "productos",
    label: "Disponibilidad de productos",
    icon: Package,
    answer: [
      "El catálogo en línea muestra productos que maneja la cadena.",
      "El catálogo no garantiza existencias en una tienda específica. Si necesitas confirmar, comunícate con la sucursal antes de tu visita.",
    ],
    link: { href: PRODUCTOS, label: "Ver catálogo de productos" },
  },
  {
    id: "contacto",
    label: "Medios de contacto",
    icon: Phone,
    answer: ["Los canales oficiales de contacto están publicados en la página de contacto."],
    link: { href: CONTACTO, label: "Ver medios de contacto" },
  },
];

type Message = { id: number; from: "bot" | "user"; topic?: Topic; text?: string };

const WELCOME = "¡Hola! Elige un tema y te oriento hacia la información oficial.";

function FaqPage() {
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: WELCOME }]);
  const [showTopics, setShowTopics] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const counter = useRef(1);

  useEffect(() => {
    if (messages.length > 1) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, showTopics]);

  function choose(t: Topic) {
    const a = counter.current++;
    const b = counter.current++;
    setMessages((m) => [...m, { id: a, from: "user", text: t.label }, { id: b, from: "bot", topic: t }]);
    setShowTopics(false);
  }

  function backToTopics() {
    const a = counter.current++;
    setMessages((m) => [...m, { id: a, from: "bot", text: "Claro. ¿Sobre qué otro tema necesitas información?" }]);
    setShowTopics(true);
  }

  const lastTopic = [...messages].reverse().find((m) => m.topic)?.topic;

  return (
    <ClientShell>
      <PageContainer narrow>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold text-primary-deep sm:text-4xl">Preguntas frecuentes</h1>
        <p className="mt-2 text-muted-foreground">
          Toca un tema para recibir una respuesta. Leer una respuesta no crea un caso.
        </p>

        <div className="mt-8 card-soft overflow-hidden">
          <div className="flex items-center gap-3 border-b bg-primary-soft px-5 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="font-semibold text-foreground">Asistente de orientación</p>
              <p className="text-xs text-muted-foreground">Respuestas predefinidas</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6" aria-live="polite">
            {messages.map((m) =>
              m.from === "user" ? (
                <div key={m.id} className="fade-up flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                    {m.text}
                  </p>
                </div>
              ) : m.topic ? (
                <div key={m.id} className="fade-up max-w-[92%] rounded-2xl rounded-bl-md bg-muted p-4 sm:p-5">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <m.topic.icon className="size-4 text-primary" aria-hidden="true" />
                    {m.topic.label}
                  </p>
                  {m.topic.answer.map((p) => (
                    <p key={p} className="mb-2 last:mb-0">
                      {p}
                    </p>
                  ))}
                </div>
              ) : (
                <p key={m.id} className="fade-up max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                  {m.text}
                </p>
              ),
            )}

            {showTopics ? (
              <div className="fade-up grid gap-2.5 sm:grid-cols-2" role="group" aria-label="Temas disponibles">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => choose(t)}
                    className="flex min-h-12 items-center gap-3 rounded-xl border-[1.5px] border-primary/25 bg-surface px-4 py-3 text-left font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft"
                  >
                    <t.icon className="size-5 shrink-0" aria-hidden="true" />
                    {t.label}
                  </button>
                ))}
              </div>
            ) : lastTopic ? (
              <div className="fade-up flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg">
                  <a href={lastTopic.link.href} target="_blank" rel="noopener noreferrer">
                    <ExternalLink aria-hidden="true" />
                    Ver información oficial
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </Button>
                <Button variant="outline" size="lg" onClick={backToTopics}>
                  <ArrowLeft aria-hidden="true" />
                  Volver a las preguntas
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/enviar" search={{ tipo: "consulta", tema: lastTopic.label }}>
                    <MessageSquareText aria-hidden="true" />
                    Enviar una consulta al personal
                  </Link>
                </Button>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        </div>
      </PageContainer>
    </ClientShell>
  );
}
