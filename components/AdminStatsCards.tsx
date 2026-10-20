"use client";

import { MousePointerClick, TrendingUp, ShoppingBag, Sparkles } from "lucide-react";

interface Props {
  totalOutfits: number;
  totalClicks: number;
  clicks: { id: string; clicked_at: string }[];
}

export default function AdminStatsCards({ totalOutfits, totalClicks, clicks }: Props) {
  // All new Date() calls happen on the client — safe from prerender
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentClicks = clicks.filter(
    (c) => new Date(c.clicked_at) >= sevenDaysAgo
  ).length;

  const estimatedCommission = totalClicks * 1500;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Lookbook */}
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-5 space-y-2">
        <div className="flex items-center justify-between text-foreground/70">
          <span className="text-xs font-black uppercase tracking-wider text-foreground">Total Outfit</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-primary text-white shadow-cartoon-sm">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-black font-nunito text-foreground tracking-tighter">{totalOutfits}</div>
        <p className="text-xs font-bold text-foreground/70">Koleksi aktif di feed</p>
      </div>

      {/* Total Klik Afiliasi */}
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-5 space-y-2">
        <div className="flex items-center justify-between text-foreground/70">
          <span className="text-xs font-black uppercase tracking-wider text-foreground">Total Klik Produk</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-foreground shadow-cartoon-sm">
            <MousePointerClick className="h-5 w-5 text-primary/70" />
          </div>
        </div>
        <div className="text-3xl font-black font-nunito text-foreground tracking-tighter">{totalClicks}</div>
        <p className="text-xs font-bold text-foreground/70">Pengunjung ke marketplace</p>
      </div>

      {/* Klik 7 Hari Terakhir */}
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-5 space-y-2">
        <div className="flex items-center justify-between text-foreground/70">
          <span className="text-xs font-black uppercase tracking-wider text-foreground">Tren Minggu Ini</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-foreground shadow-cartoon-sm">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="text-3xl font-black font-nunito text-foreground tracking-tighter">{recentClicks}</div>
        <p className="text-xs font-bold text-foreground/70">Interaksi 7 hari terakhir</p>
      </div>

      {/* Est. Komisi Afiliasi */}
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-5 space-y-2">
        <div className="flex items-center justify-between text-foreground/70">
          <span className="text-xs font-black uppercase tracking-wider text-foreground">Est. Komisi</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-foreground shadow-cartoon-sm">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-nunito text-foreground tracking-tighter">
          Rp {estimatedCommission.toLocaleString("id-ID")}
        </div>
        <p className="text-xs font-bold text-foreground/70">Estimasi konversi komisi</p>
      </div>
    </div>
  );
}