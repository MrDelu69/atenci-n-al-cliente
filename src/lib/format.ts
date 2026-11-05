const dateFmt = new Intl.DateTimeFormat("es-CR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Costa_Rica",
});

const dateTimeFmt = new Intl.DateTimeFormat("es-CR", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Costa_Rica",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}
