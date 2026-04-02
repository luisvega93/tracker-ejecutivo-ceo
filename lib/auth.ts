import type { User } from "@supabase/supabase-js";

import { getAuthorizedAdminEmails } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAuthState =
  | { kind: "missing-env" }
  | { kind: "unauthenticated" }
  | { kind: "unauthorized"; user: User }
  | { kind: "authorized"; user: User };

export function isAuthorizedAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAuthorizedAdminEmails().includes(email.trim().toLowerCase());
}

export async function getAdminAuthState(): Promise<AdminAuthState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { kind: "missing-env" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "unauthenticated" };
  }

  if (isAuthorizedAdminEmail(user.email)) {
    return { kind: "authorized", user };
  }

  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return { kind: "unauthorized", user };
  }

  const { data, error } = await supabase
    .from("tracker_admins")
    .select("email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error || !data) {
    return { kind: "unauthorized", user };
  }

  return { kind: "authorized", user };
}
