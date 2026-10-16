import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProfileEditor from "@/components/ProfileEditor";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;
  const username =
    (user as any)?.user_metadata?.username ||
    (user as any)?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Pengguna";

  const avatarUrl = (user as any)?.user_metadata?.avatar_url || "";
  const email = user.email || "";

  return (
    <div className="container max-w-4xl py-10 px-4 sm:px-6 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
      </Link>

      <div className="flex items-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 p-4 text-primary">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          Halaman Akun Pengguna — Anda dapat mengedit foto profil dan memperbarui kata sandi di bawah ini.
        </p>
      </div>

      <ProfileEditor
        initialUsername={username}
        initialEmail={email}
        initialAvatarUrl={avatarUrl}
        isAdmin={false}
      />
    </div>
  );
}
