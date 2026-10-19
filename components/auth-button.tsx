import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { cookies } from "next/headers";
import { User, ShieldCheck } from "lucide-react";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function AuthButton() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Ambil avatar admin dari database atau cookie
  let adminAvatar = "";
  let adminUsername = "adminootd";

  if (hasAdminCookie) {
    // Selalu coba ambil dari database untuk admin agar foto profil muncul
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (url && key) {
      try {
        const db = createServiceClient(url, key);
        const { data: adminData } = await db
          .from("admin_settings")
          .select("avatar_url, username")
          .eq("id", 1)
          .single();
        if (adminData) {
          adminAvatar = adminData.avatar_url || "";
          adminUsername = adminData.username || "adminootd";
        }
      } catch (err) {
        console.error("AuthButton: Gagal mengambil profil admin dari DB", err);
      }
    }

    // Fallback ke cookie jika DB gagal
    if (!adminAvatar) {
      const adminProf = cookieStore.get("admin_profile")?.value;
      if (adminProf) {
        try {
          const prof = JSON.parse(adminProf);
          adminAvatar = prof.avatar_url || "";
          if (prof.username) adminUsername = prof.username;
        } catch {}
      }
    }
  }

  if (hasAdminCookie && !user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-3 text-sm">
        <Link
          href="/admin/settings"
          className="touch-target flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity"
          aria-label={`Profil ${adminUsername}`}
        >
          {adminAvatar ? (
            <img
              src={adminAvatar}
              alt="Admin"
              className="h-8 w-8 sm:h-7 sm:w-7 rounded-full object-cover border border-primary/30"
            />
          ) : (
            <div className="h-8 w-8 sm:h-7 sm:w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
          <span className="hidden md:inline max-w-[88px] truncate">{adminUsername}</span>
        </Link>
        <LogoutButton compact />
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
    <div className="flex items-center gap-1.5 sm:gap-3 text-sm">
      <Link
        href="/protected"
        className="touch-target flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Akun ${displayName}`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-8 w-8 sm:h-7 sm:w-7 rounded-full object-cover border border-border" />
        ) : (
          <div className="h-8 w-8 sm:h-7 sm:w-7 rounded-full bg-muted flex items-center justify-center border border-border">
            <User className="h-3.5 w-3.5" />
          </div>
        )}
        <span className="hidden md:inline font-medium text-foreground max-w-[88px] truncate">{displayName}</span>
      </Link>
      <LogoutButton compact />
    </div>
  ) : (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button asChild size="sm" variant="ghost" className="touch-target h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-medium">
        <Link href="/auth/login">Masuk</Link>
      </Button>
      <Button asChild size="sm" variant="default" className="touch-target h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-medium">
        <Link href="/auth/sign-up">Daftar</Link>
      </Button>
    </div>
  );
}
