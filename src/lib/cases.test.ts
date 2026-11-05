import { describe, expect, it } from "vitest";
import {
  addClientMessage,
  addInternalNote,
  addStaffMessage,
  assign,
  changeStatus,
  clientEvents,
  countByStatus,
  countByTypeAndStatus,
  createCase,
  findCaseByAccess,
  validateCaseForm,
  type SupportCase,
} from "./cases";
import { seedCases } from "./seed";

const byCode = (code: string) => seedCases().find((c) => c.code === code) as SupportCase;

describe("datos de demostración", () => {
  it("tiene dos consultas, dos reclamos y un caso en cada estado", () => {
    const counts = countByStatus(seedCases());
    expect(counts).toEqual({ total: 4, recibido: 1, en_revision: 1, en_espera: 1, finalizado: 1 });
    const byType = countByTypeAndStatus(seedCases());
    expect(byType.consulta.total).toBe(2);
    expect(byType.reclamo.total).toBe(2);
  });

  it("DEMO-004 empieza sin responsable", () => {
    expect(byCode("DEMO-004").assignee).toBeNull();
  });
});

describe("reglas de estado", () => {
  it("no permite pasar a En revisión sin responsable", () => {
    const r = changeStatus(byCode("DEMO-004"), "en_revision");
    expect(r.ok).toBe(false);
  });

  it("permite En revisión una vez asignado", () => {
    const a = assign(byCode("DEMO-004"), "Agente C");
    if (!a.ok) throw new Error(a.error);
    expect(changeStatus(a.value, "en_revision").ok).toBe(true);
  });

  it("En espera requiere motivo", () => {
    expect(changeStatus(byCode("DEMO-003"), "en_espera", { reason: "" }).ok).toBe(false);
    const r = changeStatus(byCode("DEMO-003"), "en_espera", { reason: "Falta la fecha de visita." });
    expect(r.ok && r.value.waitingReason).toBe("Falta la fecha de visita.");
  });

  it("Finalizado requiere respuesta final", () => {
    expect(changeStatus(byCode("DEMO-003"), "finalizado").ok).toBe(false);
    const r = changeStatus(byCode("DEMO-003"), "finalizado", { finalAnswer: "Respuesta completa." });
    expect(r.ok && r.value.finalAnswer).toBe("Respuesta completa.");
  });

  it("permite volver de En espera a En revisión", () => {
    const r = changeStatus(byCode("DEMO-002"), "en_revision");
    expect(r.ok && r.value.status).toBe("en_revision");
  });

  it("cambiar estado no crea una nota interna", () => {
    const before = byCode("DEMO-003");
    const r = changeStatus(before, "en_espera", { reason: "Falta la fecha de visita." });
    if (!r.ok) throw new Error(r.error);
    const notesBefore = before.events.filter((e) => e.kind === "nota_interna").length;
    const notesAfter = r.value.events.filter((e) => e.kind === "nota_interna").length;
    expect(notesAfter).toBe(notesBefore);
  });

  it("no permite quitar el responsable de un caso En revisión", () => {
    expect(assign(byCode("DEMO-003"), null).ok).toBe(false);
  });
});

describe("visibilidad para el cliente", () => {
  it("las notas internas nunca aparecen en la vista del cliente", () => {
    const r = addInternalNote(byCode("DEMO-003"), "Solo para el equipo");
    if (!r.ok) throw new Error(r.error);
    expect(clientEvents(r.value).some((e) => e.text === "Solo para el equipo")).toBe(false);
  });

  it("los mensajes del personal sí aparecen para el cliente", () => {
    const r = addStaffMessage(byCode("DEMO-003"), "Hola, ya estamos revisando.");
    if (!r.ok) throw new Error(r.error);
    expect(clientEvents(r.value).some((e) => e.text === "Hola, ya estamos revisando.")).toBe(true);
  });

  it("el cliente no puede aportar información a un caso finalizado", () => {
    expect(addClientMessage(byCode("DEMO-001"), "Más información aquí").ok).toBe(false);
  });
});

describe("registro y acceso", () => {
  const values = {
    name: "Ana Prueba",
    email: "ana@ejemplo.com",
    type: "consulta" as const,
    branch: "Heredia",
    subject: "Consulta de prueba",
    description: "Esta es una descripción de prueba suficientemente larga.",
  };

  it("un caso nuevo recibe el siguiente código, estado Recibido y suma al total", () => {
    const cases = seedCases();
    const c = createCase(cases, values, new Date(), "ABC-DEF");
    expect(c.code).toBe("DEMO-005");
    expect(c.status).toBe("recibido");
    expect(countByStatus([...cases, c]).total).toBe(5);
    expect(countByStatus([...cases, c]).recibido).toBe(2);
  });

  it("solo abre el caso con el código y la clave correctos", () => {
    const cases = seedCases();
    expect(findCaseByAccess(cases, "demo-002", "rio-735")?.code).toBe("DEMO-002");
    expect(findCaseByAccess(cases, "DEMO-002", "SOL-482")).toBeNull();
  });

  it("valida el correo y la descripción", () => {
    const e = validateCaseForm({ ...values, email: "ana", description: "corta" });
    expect(e.email).toBeTruthy();
    expect(e.description).toBeTruthy();
    expect(validateCaseForm(values)).toEqual({});
  });
});
