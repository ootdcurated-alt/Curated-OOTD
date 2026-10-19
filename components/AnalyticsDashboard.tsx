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
    <div className={`cartoon-card ${accentBg ?? "bg-white/60 backdrop-blur-xl"} p-5 sm:p-6 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-foreground">
          {label}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white shadow-cartoon-sm">
          {icon}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black font-nunito text-foreground tracking-tighter">
        {value}
      </div>
      {sub && <p className="text-xs font-bold text-foreground/70">{sub}</p>}
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
            <span className="text-[10px] font-black text-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {d.count}
            </span>
            <div className="relative w-full overflow-hidden rounded-t-2xl bg-primary/5 border border-border border-b-0 h-32 flex items-end">
              <div
                className="w-full bg-primary transition-all duration-700"
                style={{ height: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-foreground leading-tight text-center">
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
          icon={<MousePointerClick className="h-5 w-5 text-primary" />}
          label="Total Klik"
          value={totalClicks.toLocaleString("id-ID")}
          sub="Sepanjang waktu"
          accentBg="bg-white/60 backdrop-blur-xl"
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-primary/70" />}
          label="Klik Hari Ini"
          value={todayClicks.toLocaleString("id-ID")}
          sub={todayLabel}
          accentBg="bg-secondary/50 backdrop-blur-xl"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-cartoon-purple" />}
          label="Klik Bulan Ini"
          value={monthClicks.toLocaleString("id-ID")}
          sub={monthLabel}
          accentBg="bg-primary/5 backdrop-blur-xl"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          label="Estimasi Komisi"
          value={`Rp ${estimatedRevenue.toLocaleString("id-ID")}`}
          sub="Asumsi 2% × Rp 150rb rata-rata"
          accentBg="bg-primary/10 backdrop-blur-xl"
        />
      </div>

      {/* 7-Day Chart */}
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black font-nunito text-foreground">
              Klik 7 Hari Terakhir
            </h2>
            <p className="text-xs font-bold text-foreground/70">Puncak: {maxDaily} klik</p>
          </div>
          <span className="rounded-full border border-border bg-primary/5 px-3 py-1 text-xs font-black text-foreground shadow-cartoon-sm">
            7 Hari Terakhir
          </span>
        </div>
        {totalClicks === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-foreground/60">
            Belum ada data klik. Klik produk di koleksi untuk melihat grafik performa.
          </div>
        ) : (
          <BarChart data={dailyData} />
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Outfits */}
        <div className="cartoon-card bg-white/60 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-secondary">
              <Shirt className="h-4 w-4 text-foreground" />
            </div>
            <h2 className="font-black font-nunito text-base text-foreground">Outfit Terpopuler</h2>
          </div>
          {topOutfits.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-foreground/60">Belum ada data klik outfit.</p>
          ) : (
            <div className="space-y-2.5">
              {topOutfits.map((o, i) => (
                <div key={o.id} className="flex items-center gap-3 rounded-2xl border border-border bg-primary/5 px-4 py-3 shadow-cartoon-sm">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-primary text-xs font-black text-white">
                    {i + 1}
                  </span>
                  <p className="flex-1 truncate text-xs sm:text-sm font-black text-foreground">{o.title}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0 bg-white px-2.5 py-1 rounded-lg border border-border">
                    <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-black text-foreground">{o.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="cartoon-card bg-white/60 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-primary/20">
              <ShoppingBag className="h-4 w-4 text-foreground" />
            </div>
            <h2 className="font-black font-nunito text-base text-foreground">Produk Terpopuler</h2>
          </div>
          {topItems.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-foreground/60">Belum ada data klik produk.</p>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((it, i) => (
                <div key={it.id} className="flex items-center gap-3 rounded-2xl border border-border bg-primary/5 px-4 py-3 shadow-cartoon-sm">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-primary/20 text-xs font-black text-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs sm:text-sm font-black text-foreground">{it.name}</p>
                    {it.brand && <p className="text-[11px] font-bold text-foreground/70">{it.brand}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 bg-white px-2.5 py-1 rounded-lg border border-border">
                    <MousePointerClick className="h-3.5 w-3.5 text-primary/70" />
                    <span className="text-xs font-black text-foreground">{it.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Outfits summary */}
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-secondary">
              <Shirt className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <span className="font-black font-nunito text-base text-foreground block">Total Outfit Aktif</span>
              <span className="text-xs font-bold text-foreground/70">Outfit yang siap dikurasi dan dilihat pengunjung</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black font-nunito text-foreground">{totalOutfits}</span>
            <Link
              href="/admin/outfit/new"
              className="cartoon-btn inline-flex items-center gap-1.5 bg-primary px-5 py-2 text-xs font-black text-white"
            >
              + Tambah Outfit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
