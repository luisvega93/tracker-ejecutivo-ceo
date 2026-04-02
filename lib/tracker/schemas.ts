import { z } from "zod";

import type { TrackerStatus } from "@/lib/tracker/types";

const trackerStatusValues: TrackerStatus[] = [
  "en_avance",
  "atencion",
  "atorado",
  "completado",
];

export const trackerTaskFormSchema = z.object({
  id: z.string().uuid().optional(),
  concepto: z.string().trim().min(1, "El concepto es obligatorio."),
  responsable: z.string().trim().default(""),
  status: z.enum(trackerStatusValues, {
    error: "Selecciona un estatus valido.",
  }),
  comentarios: z.string().trim().default(""),
  fecha_raw: z.string().trim().default(""),
  fecha_iso: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null))
    .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      error: "La fecha ISO debe usar el formato YYYY-MM-DD.",
    }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo valido."),
  password: z.string().min(1, "La contrasena es obligatoria."),
});
