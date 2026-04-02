import { redirect } from "next/navigation";

import { SetupPanel } from "@/components/setup-panel";
import { getAdminAuthState } from "@/lib/auth";
import { isGithubPagesBuild } from "@/lib/site-config";
import { getAdminTasks } from "@/lib/tracker/queries";

export default async function AdminPage() {
  if (isGithubPagesBuild) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <SetupPanel
            description="La publicacion en GitHub Pages deja visible solo la vista del CEO. El panel del COO sigue disponible cuando ejecutes el proyecto con Supabase en local o en un hosting con runtime."
            title="Panel COO no disponible en GitHub Pages"
          />
        </div>
      </main>
    );
  }

  const authState = await getAdminAuthState();

  if (authState.kind === "missing-env") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <SetupPanel
            description="Completa la configuracion de Supabase y del usuario administrador para habilitar el panel del COO."
            title="Configuracion pendiente"
          />
        </div>
      </main>
    );
  }

  if (authState.kind !== "authorized") {
    redirect("/admin/login");
  }

  const { tasks, missingConfig } = await getAdminTasks();

  if (missingConfig) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <SetupPanel
            description="No fue posible conectar con Supabase. Revisa URL, anon key y service role key."
            title="Sin conexion a la base de datos"
          />
        </div>
      </main>
    );
  }

  const { AdminDashboard } = await import("@/components/admin/admin-dashboard");
  const { LogoutButton } = await import("@/components/admin/logout-button");

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <div
        className="rounded-[2.5rem] border border-line/70 bg-surface p-6 md:p-10"
        data-slot="card"
      >
        <div className="mb-6 flex justify-end">
          <LogoutButton />
        </div>
        <AdminDashboard adminEmail={authState.user.email ?? ""} tasks={tasks} />
      </div>
    </main>
  );
}
