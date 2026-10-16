import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { cookies } from "next/headers";
import { User, ShieldCheck } from "lucide-react";

export async function AuthButton() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Ambil avatar admin dari cookie jika ada
  let adminAvatar = "";
  if (hasAdminCookie) {
    const adminProf = cookieStore.get("admin_profile")?.value;
    if (adminProf) {
      try {
        adminAvatar = JSON.parse(adminProf)?.avatar_url || "";
      } catch {}
    }
  }

  if (hasAdminCookie && !user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity"
        >
          {adminAvatar ? (
            <img src={adminAvatar} alt="Admin" className="h-7 w-7 rounded-full object-cover border border-primary/30" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
          <span>adminootd</span>
        </Link>
        <LogoutButton />
      </div>
    );
  }

  const avatarUrl = (user as any)?.user_metadata?.avatar_url || "";

  // Nama tampilan: bisa dari user_metadata (username/display_name/name) atau email
  const displayName =
    (user as any)?.user_metadata?.username ||
    (user as any)?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Pengguna";

  return user ? (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href="/protected"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full object-cover border border-border" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border">
            <User className="h-3.5 w-3.5" />
          </div>
        )}
        <span className="font-medium text-foreground">{displayName}</span>
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="ghost" className="text-xs sm:text-sm font-medium">
        <Link href="/auth/login">Masuk</Link>
      </Button>
      <Button asChild size="sm" variant="default" className="text-xs sm:text-sm font-medium">
        <Link href="/auth/sign-up">Daftar</Link>
      </Button>
    </div>
  );
}
