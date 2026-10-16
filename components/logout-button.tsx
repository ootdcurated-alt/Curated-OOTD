"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // Ignore
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoading(false);
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={logout}
      disabled={isLoading}
      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{isLoading ? "Keluar..." : "Keluar"}</span>
    </Button>
  );
}
