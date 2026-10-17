"use client";

import {
  MousePointerClick,
  TrendingUp,
  Shirt,
  ShoppingBag,
  Calendar,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface ClickEvent {
  id: string;
  outfit_id: string | null;
  item_id: string | null;
  target_url: string | null;
  clicked_at: string;
}

interface OutfitStat {
  id: string;
  title: string;
  count: number;
}

interface ItemStat {
  id: string;
  name: string;
  brand: string;
  count: number;
}

interface Props {
  clicks: ClickEvent[];
  totalOutfits: number;
  topOutfits: OutfitStat[];
  topItems: ItemStat[];
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accentBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  accentBg?: string;
}) {
  return (
    <div className={`cartoon-card ${accentBg ?? "bg-white"} p-5 sm:p-6 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">
          {label}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2D2D2D] bg-white shadow-[2px_2px_0px_#2D2D2D]">
          {icon}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black font-nunito text-[#2D2D2D] tracking-tight">
        {value}
      </div>
      {sub && <p className="text-xs font-bold text-[#2D2D2D]/70">{sub}</p>}
    </div>
  );
}

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-44 items-end gap-2 pt-6">
      {data.map((d, i) => {
        const pct = Math.round((d.count / max) * 100);
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-black text-[#2D2D2D] opacity-0 transition-opacity group-hover:opacity-100">
              {d.count}
            </span>
            <div className="relative w-full overflow-hidden rounded-t-xl bg-[#FFF8E7] border-2 border-[#2D2D2D] border-b-0 h-32 flex items-end">
              <div
                className="w-full bg-[#FF6B6B] transition-all duration-700"
                style={{ height: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-[#2D2D2D] leading-tight text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsDashboard({ clicks, totalOutfits, topOutfits, topItems }: Props) {
  // All new Date() calls happen here on the client — safe from prerender
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalClicks = clicks.length;
  const todayClicks = clicks.filter((c) => new Date(c.clicked_at) >= todayStart).length;
  const monthClicks = clicks.filter((c) => new Date(c.clicked_at) >= monthStart).length;
  const estimatedRevenue = Math.round(totalClicks * 0.02 * 150_000);

  // Build 7-day chart data
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const count = clicks.filter((c) => {
      const t = new Date(c.clicked_at);
      return t >= dayStart && t < dayEnd;
    }).length;
    return {
      label: date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      count,
    };
  });

  const maxDaily = Math.max(...dailyData.map((d) => d.count), 0);

  const todayLabel = now.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  const monthLabel = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<MousePointerClick className="h-5 w-5 text-[#FF6B6B]" />}
          label="Total Klik"
          value={totalClicks.toLocaleString("id-ID")}
          sub="Sepanjang waktu"
          accentBg="bg-[#FFF8E7]"
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-[#4ECDC4]" />}
          label="Klik Hari Ini"
          value={todayClicks.toLocaleString("id-ID")}
          sub={todayLabel}
          accentBg="bg-[#C8F7DC]"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-[#A78BFA]" />}
          label="Klik Bulan Ini"
          value={monthClicks.toLocaleString("id-ID")}
          sub={monthLabel}
          accentBg="bg-[#E8D5FF]"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-[#FF6B6B]" />}
          label="Est. Komisi"
          value={`Rp ${estimatedRevenue.toLocaleString("id-ID")}`}
          sub="Asumsi 2% × Rp 150rb avg"
          accentBg="bg-[#FFE66D]"
        />
      </div>

      {/* 7-Day Chart */}
      <div className="cartoon-card bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#2D2D2D]/20 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black font-nunito text-[#2D2D2D]">
              Klik 7 Hari Terakhir
            </h2>
            <p className="text-xs font-bold text-[#2D2D2D]/70">Puncak: {maxDaily} klik</p>
          </div>
          <span className="rounded-full border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3 py-1 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
            7 Hari Terakhir
          </span>
        </div>
        {totalClicks === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-[#2D2D2D]/60">
            Belum ada data klik. Klik produk di lookbook untuk melihat grafik performa.
          </div>
        ) : (
          <BarChart data={dailyData} />
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Outfits */}
        <div className="cartoon-card bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-[#2D2D2D]/20 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#2D2D2D] bg-[#FFE66D]">
              <Shirt className="h-4 w-4 text-[#2D2D2D]" />
            </div>
            <h2 className="font-black font-nunito text-base text-[#2D2D2D]">Top Outfit Terpopuler</h2>
          </div>
          {topOutfits.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-[#2D2D2D]/60">Belum ada data klik outfit.</p>
          ) : (
            <div className="space-y-2.5">
              {topOutfits.map((o, i) => (
                <div key={o.id} className="flex items-center gap-3 rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-4 py-3 shadow-[2px_2px_0px_#2D2D2D]">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 border-[#2D2D2D] bg-[#FF6B6B] text-xs font-black text-white">
                    {i + 1}
                  </span>
                  <p className="flex-1 truncate text-xs sm:text-sm font-black text-[#2D2D2D]">{o.title}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0 bg-white px-2.5 py-1 rounded-lg border-2 border-[#2D2D2D]">
                    <MousePointerClick className="h-3.5 w-3.5 text-[#FF6B6B]" />
                    <span className="text-xs font-black text-[#2D2D2D]">{o.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="cartoon-card bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-[#2D2D2D]/20 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#2D2D2D] bg-[#4ECDC4]">
              <ShoppingBag className="h-4 w-4 text-[#2D2D2D]" />
            </div>
            <h2 className="font-black font-nunito text-base text-[#2D2D2D]">Top Produk Terpopuler</h2>
          </div>
          {topItems.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-[#2D2D2D]/60">Belum ada data klik produk.</p>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((it, i) => (
                <div key={it.id} className="flex items-center gap-3 rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-4 py-3 shadow-[2px_2px_0px_#2D2D2D]">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 border-[#2D2D2D] bg-[#4ECDC4] text-xs font-black text-[#2D2D2D]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs sm:text-sm font-black text-[#2D2D2D]">{it.name}</p>
                    {it.brand && <p className="text-[11px] font-bold text-[#2D2D2D]/70">{it.brand}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 bg-white px-2.5 py-1 rounded-lg border-2 border-[#2D2D2D]">
                    <MousePointerClick className="h-3.5 w-3.5 text-[#4ECDC4]" />
                    <span className="text-xs font-black text-[#2D2D2D]">{it.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Outfits summary */}
      <div className="cartoon-card bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2D2D2D] bg-[#C8F7DC]">
              <Shirt className="h-5 w-5 text-[#2D2D2D]" />
            </div>
            <div>
              <span className="font-black font-nunito text-base text-[#2D2D2D] block">Total Outfit Aktif</span>
              <span className="text-xs font-bold text-[#2D2D2D]/70">Outfit yang siap dikurasi dan dilihat pengunjung</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black font-nunito text-[#2D2D2D]">{totalOutfits}</span>
            <Link
              href="/admin/outfit/new"
              className="cartoon-btn inline-flex items-center gap-1.5 bg-[#FF6B6B] px-5 py-2 text-xs font-black text-white"
            >
              + Tambah Outfit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
