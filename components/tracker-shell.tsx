"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Eye, MonitorCog } from "lucide-react";

import { CeoTracker } from "@/components/ceo-tracker";
import { StaticCooWorkspace } from "@/components/static-coo-workspace";
import { Button } from "@/components/ui/button";
import { trackerStorageKey, trackerViewStorageKey } from "@/lib/site-config";
import { sortTrackerTasks } from "@/lib/tracker/sort";
import type { TrackerTask, TrackerTaskInput } from "@/lib/tracker/types";

type TrackerShellProps = {
  initialTasks: TrackerTask[];
  publishedAt: string;
};

type TrackerView = "ceo" | "coo";

function buildLocalTask(payload: Omit<TrackerTaskInput, "id">): TrackerTask {
  const now = new Date().toISOString();

  return {
    id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `local-${now}`,
    source_row: null,
    order_number: null,
    concepto: payload.concepto,
    responsable: payload.responsable ?? "",
    status: payload.status ?? "atencion",
    comentarios: payload.comentarios ?? "",
    fecha_raw: payload.fecha_raw ?? "",
    fecha_iso: payload.fecha_iso ?? null,
    created_at: now,
    updated_at: now,
  };
}

export function TrackerShell({ initialTasks, publishedAt }: TrackerShellProps) {
  const [tasks, setTasks] = useState<TrackerTask[]>(() => sortTrackerTasks(initialTasks));
  const [view, setView] = useState<TrackerView>("ceo");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedTasks = window.localStorage.getItem(trackerStorageKey);
      const savedView = window.localStorage.getItem(trackerViewStorageKey);

      if (savedTasks) {
        const parsed = JSON.parse(savedTasks) as TrackerTask[];
        setTasks(sortTrackerTasks(parsed));
      }

      if (savedView === "ceo" || savedView === "coo") {
        setView(savedView);
      }
    } catch {
      setTasks(sortTrackerTasks(initialTasks));
    } finally {
      setIsHydrated(true);
    }
  }, [initialTasks]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(trackerStorageKey, JSON.stringify(tasks));
  }, [isHydrated, tasks]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(trackerViewStorageKey, view);
  }, [isHydrated, view]);

  const activeTasks = useMemo(
    () => sortTrackerTasks(tasks).filter((task) => task.status !== "completado"),
    [tasks],
  );

  const hasLocalChanges = useMemo(
    () => JSON.stringify(sortTrackerTasks(tasks)) !== JSON.stringify(sortTrackerTasks(initialTasks)),
    [initialTasks, tasks],
  );

  const handleSaveTask = (payload: Omit<TrackerTaskInput, "id">, taskId?: string) => {
    setTasks((current) => {
      const nextTasks = taskId
        ? current.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  ...payload,
                  responsable: payload.responsable ?? "",
                  status: payload.status ?? task.status,
                  comentarios: payload.comentarios ?? "",
                  fecha_raw: payload.fecha_raw ?? "",
                  fecha_iso: payload.fecha_iso ?? null,
                  updated_at: new Date().toISOString(),
                }
              : task,
          )
        : [...current, buildLocalTask(payload)];

      return sortTrackerTasks(nextTasks);
    });
  };

  const handleReset = () => {
    setTasks(sortTrackerTasks(initialTasks));
    window.localStorage.removeItem(trackerStorageKey);
  };

  return (
    <main>
      <div className="sticky top-0 z-20 border-b border-line/70 bg-background/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <BriefcaseBusiness className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Tracker Ejecutivo</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                GitHub Pages con vista CEO y COO
              </p>
            </div>
          </div>

          <div className="inline-flex w-full rounded-full bg-surface-muted p-1 md:w-auto">
            <Button
              className="flex-1 md:flex-none"
              onClick={() => setView("ceo")}
              size="sm"
              variant={view === "ceo" ? "primary" : "ghost"}
            >
              <Eye className="size-4" />
              Vista CEO
            </Button>
            <Button
              className="flex-1 md:flex-none"
              onClick={() => setView("coo")}
              size="sm"
              variant={view === "coo" ? "primary" : "ghost"}
            >
              <MonitorCog className="size-4" />
              Vista COO
            </Button>
          </div>
        </div>
      </div>

      {view === "coo" ? (
        <StaticCooWorkspace
          hasLocalChanges={hasLocalChanges}
          onReset={handleReset}
          onSaveTask={handleSaveTask}
          publishedAt={publishedAt}
          tasks={tasks}
        />
      ) : (
        <CeoTracker tasks={activeTasks} />
      )}
    </main>
  );
}
