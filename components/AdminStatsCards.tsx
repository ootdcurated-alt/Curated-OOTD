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
      <div className="cartoon-card bg-[#FFF5F8] p-5 space-y-2">
        <div className="flex items-center justify-between text-[#4A3B45]/70">
          <span className="text-xs font-black uppercase tracking-wider text-[#4A3B45]">Total Outfit</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5D0E0] bg-[#CC3D72] text-white shadow-sm">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-black font-nunito text-[#4A3B45] tracking-tight">{totalOutfits}</div>
        <p className="text-xs font-bold text-[#4A3B45]/70">Lookbook aktif di feed</p>
      </div>

      {/* Total Klik Afiliasi */}
      <div className="cartoon-card bg-[#E4DBFF] p-5 space-y-2">
        <div className="flex items-center justify-between text-[#4A3B45]/70">
          <span className="text-xs font-black uppercase tracking-wider text-[#4A3B45]">Total Klik Produk</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5D0E0] bg-white text-[#4A3B45] shadow-sm">
            <MousePointerClick className="h-5 w-5 text-[#F48FB1]" />
          </div>
        </div>
        <div className="text-3xl font-black font-nunito text-[#4A3B45] tracking-tight">{totalClicks}</div>
        <p className="text-xs font-bold text-[#4A3B45]/70">Pengunjung ke marketplace</p>
      </div>

      {/* Klik 7 Hari Terakhir */}
      <div className="cartoon-card bg-[#FFE0EC] p-5 space-y-2">
        <div className="flex items-center justify-between text-[#4A3B45]/70">
          <span className="text-xs font-black uppercase tracking-wider text-[#4A3B45]">Tren Minggu Ini</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5D0E0] bg-white text-[#4A3B45] shadow-sm">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="text-3xl font-black font-nunito text-[#4A3B45] tracking-tight">{recentClicks}</div>
        <p className="text-xs font-bold text-[#4A3B45]/70">Interaksi 7 hari terakhir</p>
      </div>

      {/* Est. Komisi Afiliasi */}
      <div className="cartoon-card bg-[#FFC2D9] p-5 space-y-2">
        <div className="flex items-center justify-between text-[#4A3B45]/70">
          <span className="text-xs font-black uppercase tracking-wider text-[#4A3B45]">Est. Komisi</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5D0E0] bg-white text-[#4A3B45] shadow-sm">
            <Sparkles className="h-5 w-5 text-[#CC3D72]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-nunito text-[#4A3B45] tracking-tight">
          Rp {estimatedCommission.toLocaleString("id-ID")}
        </div>
        <p className="text-xs font-bold text-[#4A3B45]/70">Estimasi konversi komisi</p>
      </div>
    </div>
  );
}
