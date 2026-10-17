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
  );
}
