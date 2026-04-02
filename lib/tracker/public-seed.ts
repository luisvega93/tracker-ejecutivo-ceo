import trackerSeed from "@/data/tracker-public.json";
import { sortTrackerTasks } from "@/lib/tracker/sort";
import type { TrackerTask } from "@/lib/tracker/types";

type TrackerPublicSeed = {
  generatedAt: string;
  tasks: TrackerTask[];
};

const typedSeed = trackerSeed as TrackerPublicSeed;

export function getStaticAllTasks() {
  return sortTrackerTasks(typedSeed.tasks);
}

export function getStaticPublicTasks() {
  return getStaticAllTasks().filter((task) => task.status !== "completado");
}

export function getStaticSeedGeneratedAt() {
  return typedSeed.generatedAt;
}
