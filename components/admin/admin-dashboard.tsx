"use client";

import { startTransition, useDeferredValue, useState } from "react";
import { Plus, Search } from "lucide-react";

import { TaskDialog } from "@/components/admin/task-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTaskDateLabel } from "@/lib/tracker/format";
import type { TrackerTask } from "@/lib/tracker/types";
import { normalizeSearchValue } from "@/lib/utils";

type AdminDashboardProps = {
  adminEmail: string;
  tasks: TrackerTask[];
};

type AdminFilter = "activas" | "completadas";

export function AdminDashboard({
  adminEmail,
  tasks,
}: AdminDashboardProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<AdminFilter>("activas");
  const [selectedTask, setSelectedTask] = useState<TrackerTask | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInstance, setDialogInstance] = useState(0);

  const activeCount = tasks.filter((task) => task.status !== "completado").length;
  const completedCount = tasks.length - activeCount;

  const normalizedQuery = normalizeSearchValue(deferredQuery);

  const filteredTasks = tasks.filter((task) => {
    const passesStatus =
      filter === "activas"
        ? task.status !== "completado"
        : task.status === "completado";

    if (!passesStatus) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [task.concepto, task.responsable].some((value) =>
      normalizeSearchValue(value).includes(normalizedQuery),
    );
  });

  const openCreateDialog = () => {
    startTransition(() => {
      setSelectedTask(null);
      setDialogInstance((current) => current + 1);
      setDialogOpen(true);
    });
  };

  const openEditDialog = (task: TrackerTask) => {
    startTransition(() => {
      setSelectedTask(task);
      setDialogInstance((current) => current + 1);
      setDialogOpen(true);
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Panel COO
            </span>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Administracion del tracker
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted md:text-base">
                Alta, edicion rapida y control operativo de tareas. Todo lo que
                se marque como completado desaparece de la vista principal del CEO,
                pero permanece aqui.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-line/70 bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Sesion
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-foreground">
                {adminEmail}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-line/70 bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Activas
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{activeCount}</p>
            </div>
            <div className="rounded-[1.75rem] border border-line/70 bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Completadas
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {completedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-[2rem] border border-line/70 bg-white p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-line/70 bg-surface px-4">
            <Search className="size-4 text-muted" />
            <Input
              className="border-0 bg-transparent px-0 focus:ring-0"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por concepto o responsable"
              value={query}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-full bg-surface-muted p-1">
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === "activas"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
                onClick={() => startTransition(() => setFilter("activas"))}
                type="button"
              >
                Activas
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === "completadas"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
                onClick={() => startTransition(() => setFilter("completadas"))}
                type="button"
              >
                Completadas
              </button>
            </div>

            <Button onClick={openCreateDialog} size="lg">
              <Plus className="size-4" />
              Nueva tarea
            </Button>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[2rem] border border-line/70 bg-white lg:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line/70 bg-surface-muted/50 text-left text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                <th className="px-5 py-4">Concepto</th>
                <th className="px-5 py-4">Responsable</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Comentarios</th>
                <th className="px-5 py-4 text-right">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr className="border-b border-line/60 align-top last:border-b-0" key={task.id}>
                  <td className="px-5 py-5">
                    <div className="space-y-1.5">
                      {task.order_number ? (
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                          {task.order_number}
                        </p>
                      ) : null}
                      <p className="max-w-md text-sm font-semibold leading-6 text-foreground">
                        {task.concepto}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-sm leading-6 text-foreground">
                    {task.responsable || "Sin responsable"}
                  </td>
                  <td className="px-5 py-5">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-5 text-sm leading-6 text-foreground">
                    {getTaskDateLabel(task.fecha_raw, task.fecha_iso)}
                  </td>
                  <td className="px-5 py-5 text-sm leading-6 text-muted">
                    {task.comentarios ? task.comentarios.slice(0, 96) : "Sin comentarios"}
                    {task.comentarios.length > 96 ? "..." : ""}
                  </td>
                  <td className="px-5 py-5 text-right">
                    <Button onClick={() => openEditDialog(task)} size="sm" variant="secondary">
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 lg:hidden">
          {filteredTasks.map((task) => (
            <article
              className="rounded-[2rem] border border-line/70 bg-white p-5"
              key={task.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  {task.order_number ? (
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                      {task.order_number}
                    </p>
                  ) : null}
                  <h2 className="text-base font-semibold leading-7 text-foreground">
                    {task.concepto}
                  </h2>
                </div>
                <StatusBadge status={task.status} />
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="font-semibold text-muted">Responsable</dt>
                  <dd className="mt-1 leading-6 text-foreground">
                    {task.responsable || "Sin responsable"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted">Fecha</dt>
                  <dd className="mt-1 leading-6 text-foreground">
                    {getTaskDateLabel(task.fecha_raw, task.fecha_iso)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted">Comentarios</dt>
                  <dd className="mt-1 leading-6 text-foreground">
                    {task.comentarios || "Sin comentarios"}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button onClick={() => openEditDialog(task)} size="sm" variant="secondary">
                  Editar
                </Button>
              </div>
            </article>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-line bg-white px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              No hay resultados para este filtro
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Ajusta la busqueda, cambia de pestana o crea una nueva tarea.
            </p>
          </div>
        ) : null}
      </div>

      <TaskDialog
        key={`${selectedTask?.id ?? "new"}-${dialogInstance}`}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        task={selectedTask}
      />
    </>
  );
}
