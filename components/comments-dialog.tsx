"use client";

import { MessageSquareMore } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CommentsDialogProps = {
  concepto: string;
  comentarios: string;
};

export function CommentsDialog({
  concepto,
  comentarios,
}: CommentsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full justify-center md:w-auto"
          size="sm"
          variant="ghost"
        >
          <MessageSquareMore className="size-4" />
          Comentarios
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Comentarios
          </DialogTitle>
          <DialogDescription className="text-sm leading-7 text-muted">
            {concepto}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-[1.5rem] bg-surface-muted p-5 text-sm leading-7 text-foreground">
          {comentarios.trim().length > 0 ? comentarios : "Sin comentarios registrados."}
        </div>
      </DialogContent>
    </Dialog>
  );
}
