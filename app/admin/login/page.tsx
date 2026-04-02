import { redirect } from "next/navigation";

import { SetupPanel } from "@/components/setup-panel";
import { getAdminAuthState } from "@/lib/auth";
import { isGithubPagesBuild } from "@/lib/site-config";

export default async function AdminLoginPage() {
  if (isGithubPagesBuild) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <SetupPanel
            description="GitHub Pages publica una version estatica y de solo lectura. Para iniciar sesion como COO usa una ejecucion con Supabase configurado."
            title="Acceso administrativo deshabilitado en esta version"
          />
        </div>
      </main>
    );
  }

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

  const { LoginForm } = await import("@/app/admin/login/login-form");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
      <LoginForm notice={notice} />
    </main>
  );
}
