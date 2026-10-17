import Link from "next/link";
import {
  PlusCircle,
  ListChecks,
  BarChart3,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminOutfitList from "@/components/AdminOutfitList";
import AdminStatsCards from "@/components/AdminStatsCards";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: outfits } = await supabase
    .from("outfits")
    .select("id, title, image_url, created_at, outfit_items(count)")
    .order("created_at", { ascending: false });

  const { data: clicks } = await supabase
    .from("affiliate_clicks")
    .select("id, clicked_at");

  const totalOutfits = outfits?.length ?? 0;
  const totalClicks = clicks?.length ?? 0;
  const safeClicks: { id: string; clicked_at: string }[] = clicks ?? [];

  return (
    <main className="container max-w-7xl py-8 px-4 sm:px-6 space-y-8">
      {/* Hero Welcome & Quick Action */}
      <div className="relative overflow-hidden cartoon-card bg-white p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2D2D2D] bg-[#FFE66D] px-3.5 py-1 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6B6B]" />
              Pusat Kontrol Kurasi & Afiliasi
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-nunito tracking-tight text-[#2D2D2D]">
              Dashboard Administrator
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#2D2D2D]/75 leading-relaxed">
              Pantau performa lookbook inspirasi OOTD, kelola hotspot interaktif produk, dan monitor konversi tautan afiliasi belanja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2D2D2D] bg-[#FFF8E7] px-4 py-2 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              Lihat Web Live <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2D2D2D] bg-[#C8F7DC] px-4 py-2 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <BarChart3 className="h-4 w-4 text-[#2D2D2D]" />
              Laporan Analitik
            </Link>
            <Link
              href="/admin/outfit/new"
              className="cartoon-btn inline-flex items-center gap-2 bg-[#FF6B6B] text-white px-5 py-2.5 text-xs font-black"
            >
              <PlusCircle className="h-4 w-4" />
              Tambah Look Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <AdminStatsCards
        totalOutfits={totalOutfits}
        totalClicks={totalClicks}
        clicks={safeClicks}
      />

      {/* Main Content: Outfit Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">
              Manajemen Outfit & Hotspot Lookbook
            </h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {totalOutfits} item
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Gunakan tombol edit pada kartu untuk mengatur titik hotspot atau menghapus outfit.
          </p>
        </div>

        <AdminOutfitList initialOutfits={outfits ?? []} />
      </div>
    </main>
  );
}
