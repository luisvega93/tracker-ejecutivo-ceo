import { redirect } from "next/navigation";

import { LoginForm } from "@/app/admin/login/login-form";
import { SetupPanel } from "@/components/setup-panel";
import { getAdminAuthState } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const authState = await getAdminAuthState();

  if (authState.kind === "authorized") {
    redirect("/admin");
  }

  if (authState.kind === "missing-env") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <SetupPanel
            description="Agrega las variables de Supabase en .env.local y crea un usuario administrador antes de entrar al panel del COO."
            title="Falta configuracion de Supabase"
          />
        </div>
      </main>
    );
  }

  const notice =
    authState.kind === "unauthorized"
      ? "La sesion actual existe, pero ese correo no esta en AUTHORIZED_ADMIN_EMAILS."
      : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
      <LoginForm notice={notice} />
    </main>
  );
}
