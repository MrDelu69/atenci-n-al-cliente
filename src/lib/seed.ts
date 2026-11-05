import type { SupportCase } from "./cases";

// Fictional demo data. Names, emails, dates and messages are invented.
export function seedCases(): SupportCase[] {
  return [
    {
      code: "DEMO-001",
      accessKey: "SOL-482",
      type: "consulta",
      topic: "Disponibilidad de producto",
      branch: "Heredia",
      subject: "¿Dónde puedo encontrar un producto importado?",
      description:
        "Vi en el catálogo en línea una salsa importada y quisiera saber si la puedo encontrar en la tienda de Heredia antes de ir.",
      name: "Laura Méndez Solís",
      email: "laura.mendez@ejemplo.com",
      status: "finalizado",
      assignee: "Agente A",
      waitingReason: null,
      finalAnswer:
        "Gracias por escribirnos, Laura. El catálogo en línea muestra los productos que maneja la cadena, pero no confirma existencias en una tienda específica. Te recomendamos comunicarte con la sucursal antes de tu visita usando los datos del directorio oficial de tiendas.",
      createdAt: "2026-10-19T15:10:00.000Z",
      updatedAt: "2026-10-21T17:40:00.000Z",
      events: [
        { id: "s1-1", at: "2026-10-19T15:10:00.000Z", kind: "creado", status: "recibido", text: "Caso registrado.", visibleToClient: true },
        { id: "s1-2", at: "2026-10-20T14:02:00.000Z", kind: "asignacion", text: "Asignado a Agente A.", visibleToClient: false },
        { id: "s1-3", at: "2026-10-20T14:05:00.000Z", kind: "estado", status: "en_revision", author: "Agente A", visibleToClient: true },
        { id: "s1-4", at: "2026-10-20T14:20:00.000Z", kind: "nota_interna", text: "Orientar al directorio de tiendas; no confirmar existencias.", author: "Agente A", visibleToClient: false },
        { id: "s1-5", at: "2026-10-21T17:38:00.000Z", kind: "mensaje_personal", text: "Hola, Laura. Ya revisamos tu consulta y te dejamos la respuesta en este caso.", author: "Equipo de atención", visibleToClient: true },
        { id: "s1-6", at: "2026-10-21T17:40:00.000Z", kind: "estado", status: "finalizado", text: "Respuesta final disponible.", author: "Agente A", visibleToClient: true },
      ],
    },
    {
      code: "DEMO-002",
      accessKey: "RIO-735",
      type: "reclamo",
      topic: "Información adicional necesaria",
      branch: "San José Centro",
      subject: "No recibí la factura electrónica de una compra",
      description:
        "Hice una compra hace unos días y di mi correo en caja, pero la factura electrónica no me llegó. Revisé también la carpeta de correo no deseado.",
      name: "Carlos Jiménez Vargas",
      email: "carlos.jimenez@ejemplo.com",
      status: "en_espera",
      assignee: "Agente B",
      waitingReason:
        "Necesitamos la fecha aproximada de la compra y el monto total para ubicar el registro.",
      finalAnswer: null,
      createdAt: "2026-10-27T13:25:00.000Z",
      updatedAt: "2026-10-28T16:12:00.000Z",
      events: [
        { id: "s2-1", at: "2026-10-27T13:25:00.000Z", kind: "creado", status: "recibido", text: "Caso registrado.", visibleToClient: true },
        { id: "s2-2", at: "2026-10-28T15:50:00.000Z", kind: "asignacion", text: "Asignado a Agente B.", visibleToClient: false },
        { id: "s2-3", at: "2026-10-28T15:52:00.000Z", kind: "estado", status: "en_revision", author: "Agente B", visibleToClient: true },
        { id: "s2-4", at: "2026-10-28T16:10:00.000Z", kind: "nota_interna", text: "Sin fecha ni monto no es posible ubicar la transacción.", author: "Agente B", visibleToClient: false },
        { id: "s2-5", at: "2026-10-28T16:12:00.000Z", kind: "estado", status: "en_espera", text: "Necesitamos la fecha aproximada de la compra y el monto total para ubicar el registro.", author: "Agente B", visibleToClient: true },
      ],
    },
    {
      code: "DEMO-003",
      accessKey: "MAR-219",
      type: "consulta",
      topic: "Información de tienda",
      branch: "Cartago",
      subject: "¿La tienda de Cartago tiene parqueo?",
      description:
        "Voy a visitar la tienda de Cartago con mi mamá, que usa bastón, y quisiera saber si hay parqueo cerca de la entrada.",
      name: "Daniela Rojas Mora",
      email: "daniela.rojas@ejemplo.com",
      status: "en_revision",
      assignee: "Agente A",
      waitingReason: null,
      finalAnswer: null,
      createdAt: "2026-11-02T18:05:00.000Z",
      updatedAt: "2026-11-03T14:30:00.000Z",
      events: [
        { id: "s3-1", at: "2026-11-02T18:05:00.000Z", kind: "creado", status: "recibido", text: "Caso registrado.", visibleToClient: true },
        { id: "s3-2", at: "2026-11-03T14:25:00.000Z", kind: "asignacion", text: "Asignado a Agente A.", visibleToClient: false },
        { id: "s3-3", at: "2026-11-03T14:30:00.000Z", kind: "estado", status: "en_revision", author: "Agente A", visibleToClient: true },
      ],
    },
    {
      code: "DEMO-004",
      accessKey: "LUZ-560",
      type: "reclamo",
      topic: "Atención recibida",
      branch: "Alajuela",
      subject: "No logré obtener orientación en el pasillo",
      description:
        "El sábado busqué ayuda para ubicar un producto y no encontré a nadie que me orientara. Me gustaría que se tome en cuenta para mejorar la atención.",
      name: "José Pablo Arias Quesada",
      email: "josepablo.arias@ejemplo.com",
      status: "recibido",
      assignee: null,
      waitingReason: null,
      finalAnswer: null,
      createdAt: "2026-11-04T16:45:00.000Z",
      updatedAt: "2026-11-04T16:45:00.000Z",
      events: [
        { id: "s4-1", at: "2026-11-04T16:45:00.000Z", kind: "creado", status: "recibido", text: "Caso registrado.", visibleToClient: true },
      ],
    },
  ];
}
