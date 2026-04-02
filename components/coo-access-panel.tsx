"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grantCooAccess, validateCooPassword } from "@/lib/tracker/static-access";

type CooAccessPanelProps = {
  onUnlock: () => void;
};

export function CooAccessPanel({ onUnlock }: CooAccessPanelProps) {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(() => {
      void (async () => {
        try {
          const isValid = await validateCooPassword(password);

          if (!isValid) {
            setErrorMessage("Contrasena invalida. Intenta de nuevo.");
            return;
          }

          grantCooAccess();
          setPassword("");
          onUnlock();
        } catch {
          setErrorMessage("No pudimos validar el acceso en este momento.");
        }
      })();
    });
  };

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-6">
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-[2.5rem] border border-line/70 bg-surface p-8 md:p-10"
        data-slot="card"
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr,0.9fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Vista COO protegida
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Acceso restringido
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted md:text-base">
                La vista COO permite editar el tracker publicado. Ingresa la
                contrasena compartida para desbloquearla en esta sesion del navegador.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-line/70 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-soft p-3 text-brand">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sesion local</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      El acceso queda abierto solo en este navegador hasta que se cierre o se bloquee.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-line/70 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-surface-muted p-3 text-foreground">
                    <LockKeyhole className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Proteccion ligera</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Como esto vive en GitHub Pages, la contrasena protege el acceso casual, no reemplaza un backend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-line/70 bg-white p-6 md:p-7">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                Desbloquear COO
              </p>
              <p className="text-sm leading-7 text-muted">
                Ingresa la contrasena para habilitar la edicion.
              </p>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-red/20 bg-red-soft px-4 py-3 text-sm text-red">
                {errorMessage}
              </div>
            ) : null}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="space-y-2 text-sm">
                <span className="font-semibold text-foreground">Contrasena</span>
                <Input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa la contrasena"
                  type="password"
                  value={password}
                />
              </label>

              <Button className="w-full" disabled={isPending} size="lg" type="submit">
                {isPending ? "Validando..." : "Entrar a Vista COO"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
