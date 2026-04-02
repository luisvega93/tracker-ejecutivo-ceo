"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { upsertTaskAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TRACKER_STATUS_OPTIONS } from "@/lib/tracker/constants";
import type { TrackerTask, TrackerStatus } from "@/lib/tracker/types";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TrackerTask | null;
};

type TaskFormState = {
  concepto: string;
  responsable: string;
  status: TrackerStatus;
  fecha_raw: string;
  fecha_iso: string;
  comentarios: string;
};

function buildFormState(task: TrackerTask | null): TaskFormState {
  return {
    concepto: task?.concepto ?? "",
    responsable: task?.responsable ?? "",
    status: task?.status ?? "atencion",
    fecha_raw: task?.fecha_raw ?? "",
    fecha_iso: task?.fecha_iso ?? "",
    comentarios: task?.comentarios ?? "",
  };
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<TaskFormState>(buildFormState(task));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await upsertTaskAction({
        id: task?.id,
        ...formState,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  };

  const title = task ? "Editar tarea" : "Nueva tarea";

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!isPending) {
          onOpenChange(nextOpen);
        }
      }}
      open={open}
    >
      <DialogContent className="w-[min(92vw,52rem)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-7 text-muted">
            Cambios rapidos para el panel operativo del COO.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Concepto</span>
              <Input
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    concepto: event.target.value,
                  }))
                }
                placeholder="Nuevo compromiso"
                value={formState.concepto}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Responsable</span>
              <Input
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    responsable: event.target.value,
                  }))
                }
                placeholder="Nombre del responsable"
                value={formState.responsable}
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Estatus</span>
              <Select
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    status: event.target.value as TrackerStatus,
                  }))
                }
                value={formState.status}
              >
                {TRACKER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold text-foreground">
                Fecha visible
              </span>
              <Input
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    fecha_raw: event.target.value,
                  }))
                }
                placeholder="SIN FECHA, AVANCES SEMANALES, 23-27 MARZO..."
                value={formState.fecha_raw}
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">
                Fecha ISO opcional
              </span>
              <Input
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    fecha_iso: event.target.value,
                  }))
                }
                type="date"
                value={formState.fecha_iso}
              />
            </label>

            <div className="rounded-[1.5rem] border border-line/70 bg-surface-muted px-4 py-3 text-sm leading-7 text-muted">
              {task?.source_row ? (
                <p>
                  Fila original importada: <strong>{task.source_row}</strong>
                </p>
              ) : (
                <p>Esta tarea es manual y no depende del Excel original.</p>
              )}
            </div>
          </div>

          <label className="space-y-2 text-sm">
            <span className="font-semibold text-foreground">Comentarios</span>
            <Textarea
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  comentarios: event.target.value,
                }))
              }
              placeholder="Detalle, contexto o seguimiento"
              rows={6}
              value={formState.comentarios}
            />
          </label>

          {errorMessage ? (
            <div className="rounded-2xl border border-red/20 bg-red-soft px-4 py-3 text-sm text-red">
              {errorMessage}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              size="lg"
              type="button"
              variant="ghost"
            >
              Cancelar
            </Button>
            <Button disabled={isPending} size="lg" type="submit">
              {isPending ? "Guardando..." : task ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
