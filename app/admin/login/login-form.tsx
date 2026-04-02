"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { loginSchema } from "@/lib/tracker/schemas";

type LoginFormProps = {
  notice?: string;
};

export function LoginForm({ notice }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        setError("Configura Supabase antes de usar el panel administrativo.");
        return;
      }

      const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
      });

      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Revisa tus credenciales.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

      if (signInError) {
        setError("No fue posible iniciar sesion. Revisa correo y contrasena.");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <div
      className="w-full max-w-md rounded-[2.25rem] border border-line/70 bg-surface p-8"
      data-slot="card"
    >
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
          Acceso COO
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Iniciar sesion
        </h1>
        <p className="text-sm leading-7 text-muted">
          Panel protegido para alta y actualizacion de tareas del tracker.
        </p>
      </div>

      {notice ? (
        <div className="mt-6 rounded-2xl border border-yellow/20 bg-yellow-soft px-4 py-3 text-sm text-yellow">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red/20 bg-red-soft px-4 py-3 text-sm text-red">
          {error}
        </div>
      ) : null}

      <form action={handleSubmit} className="mt-6 space-y-4">
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground">Correo</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input className="pl-11" name="email" placeholder="coo@empresa.com" type="email" />
          </div>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground">Contrasena</span>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input className="pl-11" name="password" placeholder="********" type="password" />
          </div>
        </label>

        <Button className="w-full" size="lg" type="submit">
          {isPending ? "Ingresando..." : "Entrar al panel"}
        </Button>
      </form>
    </div>
  );
}
