import { CeoTracker } from "@/components/ceo-tracker";
import { SetupPanel } from "@/components/setup-panel";
import { getPublicTasks } from "@/lib/tracker/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { tasks, missingConfig } = await getPublicTasks();

  if (missingConfig) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <SetupPanel
            description="Configura Supabase y ejecuta la importacion del Excel para publicar la vista del CEO con datos reales."
            title="Falta la conexion con Supabase"
          />
        </div>
      </main>
    );
  }

  return (
    <main>
      <CeoTracker tasks={tasks} />
    </main>
  );
}
