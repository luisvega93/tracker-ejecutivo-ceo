import { CeoTracker } from "@/components/ceo-tracker";
import { getPublicTasks } from "@/lib/tracker/queries";

export default async function Home() {
  const { tasks } = await getPublicTasks();

  return (
    <main>
      <CeoTracker tasks={tasks} />
    </main>
  );
}
