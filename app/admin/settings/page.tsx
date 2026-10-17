import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import ProfileEditor from "@/components/ProfileEditor";
import { Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const instant = false;

async function getAdminProfile() {
  // Coba ambil dari Supabase (service role)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && key) {
    try {
      const db = createServiceClient(url, key);
      const { data } = await db
        .from("admin_settings")
        .select("username, email, avatar_url")
        .eq("id", 1)
        .single();
      if (data) return data;
    } catch {
      // fallback
    }
  }

  // Fallback ke cookie
  const cookieStore = await cookies();
  const profileCookie = cookieStore.get("admin_profile")?.value;
  if (profileCookie) {
    try { return JSON.parse(profileCookie); } catch {}
  }

  return { username: "adminootd", email: "adminootd@gmail.com", avatar_url: "" };
}

export default async function AdminSettingsPage() {
  const profile = await getAdminProfile();

  return (
    <main className="container max-w-4xl py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#2D2D2D]/20 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFE66D] shadow-[3px_3px_0px_#2D2D2D]">
            <Settings className="h-6 w-6 text-[#2D2D2D]" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-nunito tracking-tight sm:text-3xl text-[#2D2D2D]">
              Pengaturan Profil Admin
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#2D2D2D]/70 mt-0.5">
              Ubah username, email, foto profil, dan kata sandi akun administrator.
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="cartoon-btn inline-flex items-center gap-1.5 self-start sm:self-auto bg-white px-4 py-2 text-xs font-black text-[#2D2D2D] border-2 border-[#2D2D2D]"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <ProfileEditor
        initialUsername={profile.username}
        initialEmail={profile.email}
        initialAvatarUrl={profile.avatar_url}
        isAdmin={true}
      />
    </main>
  );
}
