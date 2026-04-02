"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminAuthState } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { formatIsoDateForDisplay } from "@/lib/tracker/format";
import { trackerTaskFormSchema } from "@/lib/tracker/schemas";
import { normalizeWhitespace } from "@/lib/utils";

export type AdminActionResult = {
  success: boolean;
  error: string | null;
};

function buildUnauthorizedResult() {
  return {
    success: false,
    error: "Tu sesion no tiene permisos para editar este tablero.",
  } satisfies AdminActionResult;
}

export async function upsertTaskAction(payload: unknown): Promise<AdminActionResult> {
  const authState = await getAdminAuthState();

  if (authState.kind !== "authorized") {
    return buildUnauthorizedResult();
  }

  const parsed = trackerTaskFormSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Revisa los datos capturados.",
    };
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return {
      success: false,
      error: "Falta la configuracion de Supabase para guardar cambios.",
    };
  }

  const data = parsed.data;
  const fechaRaw = normalizeWhitespace(data.fecha_raw);
  const fechaIso = data.fecha_iso;

  const normalizedPayload = {
    concepto: normalizeWhitespace(data.concepto),
    responsable: normalizeWhitespace(data.responsable),
    status: data.status,
    comentarios: data.comentarios.trim(),
    fecha_raw: fechaRaw || (fechaIso ? formatIsoDateForDisplay(fechaIso) : ""),
    fecha_iso: fechaIso,
  };

  if (data.id) {
    const { error } = await supabase
      .from("tracker_tasks")
      .update(normalizedPayload)
      .eq("id", data.id);

    if (error) {
      return {
        success: false,
        error: `No se pudo actualizar la tarea: ${error.message}`,
      };
    }
  } else {
    const { error } = await supabase.from("tracker_tasks").insert({
      source_row: null,
      order_number: null,
      ...normalizedPayload,
    });

    if (error) {
      return {
        success: false,
        error: `No se pudo crear la tarea: ${error.message}`,
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true, error: null };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}
