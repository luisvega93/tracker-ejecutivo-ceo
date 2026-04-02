import "server-only";

import { isGithubPagesBuild } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getStaticPublicTasks } from "@/lib/tracker/public-seed";
import type { TrackerTask } from "@/lib/tracker/types";

const TASK_COLUMNS =
  "id, source_row, order_number, concepto, responsable, status, comentarios, fecha_raw, fecha_iso, created_at, updated_at";

function getBaseTaskQuery() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  return supabase
    .from("tracker_tasks")
    .select(TASK_COLUMNS)
    .order("source_row", { ascending: true, nullsFirst: false })
    .order("fecha_iso", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
}

export async function getPublicTasks() {
  if (isGithubPagesBuild) {
    return { tasks: getStaticPublicTasks(), missingConfig: false };
  }

  const query = getBaseTaskQuery();

  if (!query) {
    return { tasks: getStaticPublicTasks(), missingConfig: false };
  }

  const { data, error } = await query.neq("status", "completado");

  if (error) {
    throw new Error(`No fue posible cargar las tareas activas: ${error.message}`);
  }

  return { tasks: data ?? [], missingConfig: false };
}

export async function getAdminTasks() {
  const query = getBaseTaskQuery();

  if (!query) {
    return { tasks: [] as TrackerTask[], missingConfig: true };
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`No fue posible cargar las tareas del tablero: ${error.message}`);
  }

  return { tasks: data ?? [], missingConfig: false };
}
