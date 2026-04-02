import trackerSeed from "@/data/tracker-public.json";
import type { TrackerTask } from "@/lib/tracker/types";

type TrackerPublicSeed = {
  generatedAt: string;
  tasks: TrackerTask[];
};

const typedSeed = trackerSeed as TrackerPublicSeed;

export function getStaticPublicTasks() {
  return typedSeed.tasks.filter((task) => task.status !== "completado");
}

export function getStaticSeedGeneratedAt() {
  return typedSeed.generatedAt;
}
