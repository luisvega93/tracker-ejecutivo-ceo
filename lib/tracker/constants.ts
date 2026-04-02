import type { TrackerStatus } from "@/lib/tracker/types";

export const TRACKER_SHEET_NAME = "Tracker";

export const TRACKER_HEADERS = [
  "#",
  "ASUNTO",
  "RESPONSABLE",
  "ESTATUS",
  "COMENTARIOS",
  "FECHA COMPROMISO",
] as const;

export const TRACKER_STATUS_OPTIONS: Array<{
  value: TrackerStatus;
  label: string;
  tone: "green" | "yellow" | "red" | "neutral";
  description: string;
}> = [
  {
    value: "en_avance",
    label: "En avance",
    tone: "green",
    description: "Verde",
  },
  {
    value: "atencion",
    label: "Necesita atencion",
    tone: "yellow",
    description: "Amarillo",
  },
  {
    value: "atorado",
    label: "Atorado",
    tone: "red",
    description: "Rojo",
  },
  {
    value: "completado",
    label: "Completado",
    tone: "neutral",
    description: "Oculto en la vista del CEO",
  },
];

export const TRACKER_STATUS_META = Object.fromEntries(
  TRACKER_STATUS_OPTIONS.map((option) => [option.value, option]),
) as Record<
  TrackerStatus,
  (typeof TRACKER_STATUS_OPTIONS)[number]
>;
