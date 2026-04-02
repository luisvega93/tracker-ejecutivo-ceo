import { TRACKER_STATUS_META } from "@/lib/tracker/constants";

export function formatIsoDateForDisplay(isoDate: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${isoDate}T00:00:00.000Z`))
    .replace(/\./g, "");
}

export function getTaskDateLabel(fechaRaw: string, fechaIso: string | null) {
  if (fechaRaw.trim().length > 0) {
    return fechaRaw;
  }

  if (fechaIso) {
    return formatIsoDateForDisplay(fechaIso);
  }

  return "Sin fecha";
}

export function getStatusLabel(status: keyof typeof TRACKER_STATUS_META) {
  return TRACKER_STATUS_META[status].label;
}
