import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  BarChart3,
  PlusCircle,
  LayoutGrid,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Cek apakah database Supabase sudah diatur dengan kredensial riil
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project.supabase.co");

  // Jika belum login via cookie admin dan Supabase aktif, lakukan pengecekan
  if (!hasAdminCookie) {
    if (isSupabaseConfigured) {
      if (!user) {
        redirect("/auth/login?next=/admin");
      }

      const isAdmin = isUserAdmin(user);
      if (!isAdmin) {
        return (
          <div className="container max-w-lg py-16 px-4">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Akses Ditolak (403)</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Akun Anda (<span className="font-semibold text-foreground">{user.email || "Pengguna"}</span>) tidak memiliki izin Administrator untuk mengakses dashboard ini.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        );
      }
    }
  }

  const adminEmail = user?.email || (hasAdminCookie ? "adminootd@gmail.com" : "Admin Workspace");

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Sub Header khusus Admin Dashboard */}
      <div className="border-b-[3px] border-[#2D2D2D] bg-white sticky top-18 z-40">
        <div className="container max-w-7xl flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-[#FFE66D] text-[#2D2D2D] px-3 py-1 rounded-full border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6B6B]" /> Panel Admin
            </span>
            <span className="text-xs font-bold text-[#2D2D2D]/70 hidden sm:inline">
              {adminEmail}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#FFF8E7] border-2 border-[#2D2D2D] hover:bg-[#FFE66D] text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#4ECDC4]" />
              Kelola Outfit
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#FFF8E7] border-2 border-[#2D2D2D] hover:bg-[#FFE66D] text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <BarChart3 className="h-3.5 w-3.5 text-[#A78BFA]" />
              Statistik & Analitik
            </Link>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#FFF8E7] border-2 border-[#2D2D2D] hover:bg-[#FFE66D] text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              Kategori Outfit
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#FFF8E7] border-2 border-[#2D2D2D] hover:bg-[#FFE66D] text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              Pengaturan Profil
            </Link>
            <Link
              href="/admin/outfit/new"
              className="cartoon-btn inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black bg-[#FF6B6B] text-white"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Tambah Look
            </Link>
          </div>
        </div>
      </div>

      <div className="pb-16">{children}</div>
    </div>
  );
}
