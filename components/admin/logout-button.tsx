import { LogOut } from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button size="sm" variant="ghost">
        <LogOut className="size-4" />
        Salir
      </Button>
    </form>
  );
}
