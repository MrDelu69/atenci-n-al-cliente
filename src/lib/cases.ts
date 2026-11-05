// Pure case logic for the demo. No browser APIs here.

export type CaseType = "consulta" | "reclamo";
export type CaseStatus = "recibido" | "en_revision" | "en_espera" | "finalizado";

export type EventKind =
  | "creado"
  | "estado"
  | "mensaje_personal"
  | "mensaje_cliente"
  | "nota_interna"
  | "asignacion"
  | "clasificacion";

export interface CaseEvent {
  id: string;
  at: string; // ISO date
  kind: EventKind;
  status?: CaseStatus | undefined;
  text?: string | undefined;
  author?: string | undefined;
  /** Only events marked visible are ever shown to the customer. */
  visibleToClient: boolean;
}

export interface SupportCase {
  code: string;
  accessKey: string;
  type: CaseType;
  topic: string;
  branch: string;
  subject: string;
  description: string;
  name: string;
  email: string;
  status: CaseStatus;
  assignee: string | null;
  waitingReason: string | null;
  finalAnswer: string | null;
  createdAt: string;
  updatedAt: string;
  events: CaseEvent[];
}

export const STATUSES: CaseStatus[] = ["recibido", "en_revision", "en_espera", "finalizado"];

export const STATUS_LABEL: Record<CaseStatus, string> = {
  recibido: "Recibido",
  en_revision: "En revisión",
  en_espera: "En espera",
  finalizado: "Finalizado",
};

export const STATUS_DESCRIPTION: Record<CaseStatus, string> = {
  recibido: "Tu caso fue registrado y pronto será revisado por el personal.",
  en_revision: "El personal está examinando tu caso.",
  en_espera: "Hace falta información o una actuación para continuar.",
  finalizado: "La gestión terminó y hay una respuesta disponible.",
};

export const TYPE_LABEL: Record<CaseType, string> = {
  consulta: "Consulta",
  reclamo: "Reclamo",
};

export const AGENTS = ["Agente A", "Agente B", "Agente C"];

export const BRANCHES = [
  "San José Centro",
  "Heredia",
  "Alajuela",
  "Cartago",
  "Liberia",
  "Otra / No aplica",
];

export const TOPICS = [
  "Sin clasificar",
  "Disponibilidad de producto",
  "Información de tienda",
  "Horarios",
  "Servicios por sucursal",
  "Medios de contacto",
  "Información adicional necesaria",
  "Atención recibida",
  "Otro",
];

let idCounter = 0;
export function newId(prefix = "ev"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateAccessKey(random: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += KEY_ALPHABET[Math.floor(random() * KEY_ALPHABET.length)];
    if (i === 2) out += "-";
  }
  return out;
}

export function nextCaseCode(cases: SupportCase[]): string {
  const max = cases.reduce((m, c) => {
    const n = Number(c.code.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `DEMO-${String(max + 1).padStart(3, "0")}`;
}

// ---------- Form validation ----------

export interface CaseFormValues {
  name: string;
  email: string;
  type: CaseType | "";
  branch: string;
  subject: string;
  description: string;
}

export type CaseFormErrors = Partial<Record<keyof CaseFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateCaseForm(v: CaseFormValues): CaseFormErrors {
  const e: CaseFormErrors = {};
  if (v.name.trim().length < 2) e.name = "Escribe tu nombre para saber cómo llamarte.";
  if (!v.email.trim()) e.email = "Necesitamos un correo de contacto.";
  else if (!EMAIL_RE.test(v.email.trim()))
    e.email = "Revisa el correo. Debe verse como nombre@ejemplo.com.";
  if (v.type !== "consulta" && v.type !== "reclamo") e.type = "Elige si es una consulta o un reclamo.";
  if (!v.branch) e.branch = "Elige una sucursal o la opción “Otra / No aplica”.";
  if (v.subject.trim().length < 5) e.subject = "Cuéntanos el tema en al menos 5 caracteres.";
  else if (v.subject.trim().length > 100) e.subject = "El asunto puede tener hasta 100 caracteres.";
  if (v.description.trim().length < 20)
    e.description = "Describe tu caso con un poco más de detalle (mínimo 20 caracteres).";
  else if (v.description.trim().length > 1500)
    e.description = "La descripción puede tener hasta 1500 caracteres.";
  return e;
}

export function createCase(
  existing: SupportCase[],
  values: CaseFormValues,
  now: Date = new Date(),
  accessKey: string = generateAccessKey(),
): SupportCase {
  const at = now.toISOString();
  return {
    code: nextCaseCode(existing),
    accessKey,
    type: values.type as CaseType,
    topic: "Sin clasificar",
    branch: values.branch,
    subject: values.subject.trim(),
    description: values.description.trim(),
    name: values.name.trim(),
    email: values.email.trim(),
    status: "recibido",
    assignee: null,
    waitingReason: null,
    finalAnswer: null,
    createdAt: at,
    updatedAt: at,
    events: [
      { id: newId(), at, kind: "creado", status: "recibido", text: "Caso registrado.", visibleToClient: true },
    ],
  };
}

// ---------- Access ----------

export function findCaseByAccess(
  cases: SupportCase[],
  code: string,
  key: string,
): SupportCase | null {
  const c = code.trim().toUpperCase();
  const k = key.trim().toUpperCase().replace(/\s/g, "");
  if (!c || !k) return null;
  return cases.find((x) => x.code === c && x.accessKey.replace("-", "") === k.replace("-", "")) ?? null;
}

// ---------- Staff actions ----------

export type Result = { ok: true; value: SupportCase } | { ok: false; error: string };

function touch(c: SupportCase, at: string, event: CaseEvent): SupportCase {
  return { ...c, updatedAt: at, events: [...c.events, event] };
}

export function changeStatus(
  c: SupportCase,
  to: CaseStatus,
  opts: { reason?: string | undefined; finalAnswer?: string | undefined; author?: string | undefined } = {},
  now: Date = new Date(),
): Result {
  if (to === c.status) return { ok: false, error: "El caso ya tiene ese estado." };
  const at = now.toISOString();
  if (to === "en_revision" && !c.assignee) {
    return { ok: false, error: "Asigna un responsable antes de pasar el caso a En revisión." };
  }
  if (to === "en_espera") {
    const reason = opts.reason?.trim() ?? "";
    if (reason.length < 5)
      return { ok: false, error: "Explica qué información o actuación hace falta." };
    const next = { ...c, status: to, waitingReason: reason };
    return {
      ok: true,
      value: touch(next, at, {
        id: newId(),
        at,
        kind: "estado",
        status: to,
        text: reason,
        author: opts.author,
        visibleToClient: true,
      }),
    };
  }
  if (to === "finalizado") {
    const answer = (opts.finalAnswer ?? c.finalAnswer ?? "").trim();
    if (answer.length < 5)
      return { ok: false, error: "Documenta la respuesta final antes de finalizar el caso." };
    const next = { ...c, status: to, finalAnswer: answer, waitingReason: null };
    return {
      ok: true,
      value: touch(next, at, {
        id: newId(),
        at,
        kind: "estado",
        status: to,
        text: "Respuesta final disponible.",
        author: opts.author,
        visibleToClient: true,
      }),
    };
  }
  const next = { ...c, status: to, waitingReason: null };
  return {
    ok: true,
    value: touch(next, at, {
      id: newId(),
      at,
      kind: "estado",
      status: to,
      author: opts.author,
      visibleToClient: true,
    }),
  };
}

export function assign(c: SupportCase, assignee: string | null, now: Date = new Date()): Result {
  if (assignee === c.assignee) return { ok: false, error: "Ese responsable ya está asignado." };
  if (!assignee && c.status === "en_revision")
    return { ok: false, error: "Un caso En revisión necesita responsable." };
  const at = now.toISOString();
  return {
    ok: true,
    value: touch({ ...c, assignee }, at, {
      id: newId(),
      at,
      kind: "asignacion",
      text: assignee ? `Asignado a ${assignee}.` : "Responsable retirado.",
      visibleToClient: false,
    }),
  };
}

export function classify(
  c: SupportCase,
  type: CaseType,
  topic: string,
  now: Date = new Date(),
): Result {
  if (type === c.type && topic === c.topic) return { ok: false, error: "No hay cambios para guardar." };
  const at = now.toISOString();
  return {
    ok: true,
    value: touch({ ...c, type, topic }, at, {
      id: newId(),
      at,
      kind: "clasificacion",
      text: `Clasificado como ${TYPE_LABEL[type]} · ${topic}.`,
      visibleToClient: false,
    }),
  };
}

export function addInternalNote(c: SupportCase, text: string, author?: string, now = new Date()): Result {
  const t = text.trim();
  if (t.length < 2) return { ok: false, error: "Escribe la nota antes de guardarla." };
  const at = now.toISOString();
  return {
    ok: true,
    value: touch(c, at, { id: newId(), at, kind: "nota_interna", text: t, author, visibleToClient: false }),
  };
}

export function addStaffMessage(c: SupportCase, text: string, author?: string, now = new Date()): Result {
  const t = text.trim();
  if (t.length < 2) return { ok: false, error: "Escribe el mensaje antes de publicarlo." };
  const at = now.toISOString();
  return {
    ok: true,
    value: touch(c, at, {
      id: newId(),
      at,
      kind: "mensaje_personal",
      text: t,
      author: author ?? "Equipo de atención",
      visibleToClient: true,
    }),
  };
}

export function addClientMessage(c: SupportCase, text: string, now = new Date()): Result {
  const t = text.trim();
  if (t.length < 5) return { ok: false, error: "Escribe la información que deseas aportar." };
  if (c.status === "finalizado")
    return { ok: false, error: "Este caso ya finalizó y no admite más información." };
  const at = now.toISOString();
  return {
    ok: true,
    value: touch(c, at, {
      id: newId(),
      at,
      kind: "mensaje_cliente",
      text: t,
      author: c.name,
      visibleToClient: true,
    }),
  };
}

// ---------- Views ----------

/** The customer view of a case: never includes internal events. */
export function clientEvents(c: SupportCase): CaseEvent[] {
  return c.events.filter((e) => e.visibleToClient && e.kind !== "nota_interna");
}

export function countByStatus(cases: SupportCase[]) {
  const counts: Record<CaseStatus, number> = { recibido: 0, en_revision: 0, en_espera: 0, finalizado: 0 };
  for (const c of cases) counts[c.status] += 1;
  return { total: cases.length, ...counts };
}

export function countByTypeAndStatus(cases: SupportCase[]) {
  const out: Record<CaseType, Record<CaseStatus, number> & { total: number }> = {
    consulta: { recibido: 0, en_revision: 0, en_espera: 0, finalizado: 0, total: 0 },
    reclamo: { recibido: 0, en_revision: 0, en_espera: 0, finalizado: 0, total: 0 },
  };
  for (const c of cases) {
    out[c.type][c.status] += 1;
    out[c.type].total += 1;
  }
  return out;
}
