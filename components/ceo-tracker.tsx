import { Activity, CalendarDays, CircleDot, MessageSquareMore } from "lucide-react";

import { CommentsDialog } from "@/components/comments-dialog";
import { StatusBadge } from "@/components/status-badge";
import { getTaskDateLabel } from "@/lib/tracker/format";
import type { TrackerTask } from "@/lib/tracker/types";

type CeoTrackerProps = {
  tasks: TrackerTask[];
};

function formatUpdatedLabel(tasks: TrackerTask[]) {
  const latest = tasks
    .map((task) => task.updated_at)
    .sort((left, right) => right.localeCompare(left))[0];

  if (!latest) {
    return "Sin movimientos aun";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(latest));
}

export function CeoTracker({ tasks }: CeoTrackerProps) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-[2.5rem] border border-line/70 bg-surface p-6 md:p-10"
        data-slot="card"
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                Vista CEO
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                  Tracker ejecutivo
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted md:text-base">
                  Seguimiento puntual de compromisos activos. La vista principal
                  muestra solo tareas vigentes y deja los comentarios fuera del
                  flujo hasta que realmente se necesitan.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-line/70 bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  <Activity className="size-4" />
                  Activas
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">
                  {tasks.length}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-line/70 bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  <CircleDot className="size-4" />
                  Semaforo
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  Verde: avanzando. Amarillo: atencion. Rojo: atorado.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-line/70 bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  <CalendarDays className="size-4" />
                  Actualizado
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  {formatUpdatedLabel(tasks)}
                </p>
              </div>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-line bg-white px-6 py-14 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                No hay tareas activas
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Cuando el COO registre o reactive un compromiso, aparecera aqui
                automaticamente.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[2rem] border border-line/70 bg-white md:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-line/70 bg-surface-muted/50 text-left text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      <th className="px-6 py-4">Concepto</th>
                      <th className="px-6 py-4">Responsable</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        className="border-b border-line/60 align-top last:border-b-0"
                        key={task.id}
                      >
                        <td className="px-6 py-5">
                          <div className="space-y-1.5">
                            {task.order_number ? (
                              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                                {task.order_number}
                              </p>
                            ) : null}
                            <p className="max-w-xl text-sm font-semibold leading-6 text-foreground">
                              {task.concepto}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm leading-6 text-foreground">
                          {task.responsable || "Sin responsable"}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-5 text-sm leading-6 text-foreground">
                          {getTaskDateLabel(task.fecha_raw, task.fecha_iso)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <CommentsDialog
                            comentarios={task.comentarios}
                            concepto={task.concepto}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 md:hidden">
                {tasks.map((task) => (
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
                    </dl>
                    <div className="mt-4">
                      <CommentsDialog
                        comentarios={task.comentarios}
                        concepto={task.concepto}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.22em] text-muted">
                <MessageSquareMore className="size-4" />
                Los comentarios solo se abren bajo demanda
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
