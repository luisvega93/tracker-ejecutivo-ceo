import { CeoTracker } from "@/components/ceo-tracker";
import { TrackerShell } from "@/components/tracker-shell";
import { isGithubPagesBuild } from "@/lib/site-config";
import { getPublicTasks } from "@/lib/tracker/queries";
import { getStaticAllTasks, getStaticSeedGeneratedAt } from "@/lib/tracker/public-seed";

export default async function Home() {
  if (isGithubPagesBuild) {
    return (
      <TrackerShell
        initialTasks={getStaticAllTasks()}
        publishedAt={getStaticSeedGeneratedAt()}
      />
    );
  }

  const { tasks } = await getPublicTasks();

  return (
    <main>
      <CeoTracker tasks={tasks} />
    </main>
  );
}
