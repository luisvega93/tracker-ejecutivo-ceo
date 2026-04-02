import type { Database } from "@/lib/supabase/types";

export type TrackerStatus =
  Database["public"]["Tables"]["tracker_tasks"]["Row"]["status"];

export type TrackerTask = Database["public"]["Tables"]["tracker_tasks"]["Row"];

export type TrackerTaskInput = Database["public"]["Tables"]["tracker_tasks"]["Insert"];

export type TrackerTaskUpsert = Pick<
  TrackerTaskInput,
  | "source_row"
  | "order_number"
  | "concepto"
  | "responsable"
  | "status"
  | "comentarios"
  | "fecha_raw"
  | "fecha_iso"
>;

export type ImportWorkbookResult = {
  rows: TrackerTaskUpsert[];
  headerRow: number;
  skippedRows: number;
  activeCount: number;
  completedCount: number;
  inferredYear: number | null;
};
