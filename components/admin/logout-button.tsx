"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <Button onClick={handleLogout} size="sm" type="button" variant="ghost">
        <LogOut className="size-4" />
        Salir
    </Button>
  );
}
