import Link from "next/link";
import {
  PlusCircle,
  ListChecks,
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Sparkles,
  ArrowUpRight,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminOutfitList from "@/components/AdminOutfitList";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Ambil data outfit
  const { data: outfits } = await supabase
    .from("outfits")
    .select("id, title, image_url, created_at, outfit_items(count)")
    .order("created_at", { ascending: false });

  // Ambil total klik affiliate untuk quick stat
  const { data: clicks } = await supabase
    .from("affiliate_clicks")
    .select("id, clicked_at");

  const totalOutfits = outfits?.length ?? 0;
  const totalClicks = clicks?.length ?? 0;

  // Hitung klik 7 hari terakhir
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentClicks = clicks?.filter(
    (c: { id: string; clicked_at: string }) => new Date(c.clicked_at) >= sevenDaysAgo
  ).length ?? 0;

  // Estimasi pendapatan/komisi rata-rata
  const estimatedCommission = totalClicks * 1500; // Asumsi Rp 1.500 per klik

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Lookbook */}
        <div className="cartoon-card bg-[#FFF8E7] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]/70">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">Total Outfit</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2D2D2D] bg-[#FF6B6B] text-white shadow-[2px_2px_0px_#2D2D2D]">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-nunito text-[#2D2D2D] tracking-tight">{totalOutfits}</div>
          <p className="text-xs font-bold text-[#2D2D2D]/70">Lookbook aktif di feed</p>
        </div>

        {/* Total Klik Afiliasi */}
        <div className="cartoon-card bg-[#C0E8FF] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]/70">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">Total Klik Produk</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2D2D2D] bg-white text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
              <MousePointerClick className="h-5 w-5 text-[#4ECDC4]" />
            </div>
          </div>
          <div className="text-3xl font-black font-nunito text-[#2D2D2D] tracking-tight">{totalClicks}</div>
          <p className="text-xs font-bold text-[#2D2D2D]/70">Pengunjung ke marketplace</p>
        </div>

        {/* Klik 7 Hari Terakhir */}
        <div className="cartoon-card bg-[#C8F7DC] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]/70">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">Tren Minggu Ini</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2D2D2D] bg-white text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-black font-nunito text-[#2D2D2D] tracking-tight">{recentClicks}</div>
          <p className="text-xs font-bold text-[#2D2D2D]/70">Interaksi 7 hari terakhir</p>
        </div>

        {/* Est. Komisi Afiliasi */}
        <div className="cartoon-card bg-[#FFE66D] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]/70">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">Est. Komisi</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2D2D2D] bg-white text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
              <Sparkles className="h-5 w-5 text-[#FF6B6B]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-nunito text-[#2D2D2D] tracking-tight">
            Rp {estimatedCommission.toLocaleString("id-ID")}
          </div>
          <p className="text-xs font-bold text-[#2D2D2D]/70">Estimasi konversi komisi</p>
        </div>
      </div>

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
