"use server";

import { redirect } from "next/navigation";

import { isAuthorizedAdminEmail } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/tracker/schemas";

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Configura Supabase antes de usar el panel administrativo.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa tus credenciales.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error: "No fue posible iniciar sesion. Revisa correo y contrasena.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAuthorizedAdminEmail(user.email)) {
    await supabase.auth.signOut();

    return {
      error: "Tu cuenta no tiene acceso al panel del COO.",
    };
  }

  redirect("/admin");
}
