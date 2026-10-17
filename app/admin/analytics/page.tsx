import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [{ data: clicks }, { data: outfits }, { data: outfitItems }] = await Promise.all([
    supabase
      .from("click_events")
      .select("id, outfit_id, item_id, target_url, clicked_at")
      .order("clicked_at", { ascending: false }),
    supabase.from("outfits").select("id, title"),
    supabase.from("outfit_items").select("id, name, brand"),
  ]);

  const safeClicks = clicks ?? [];

  // Aggregate top outfits
  const outfitMap: Record<string, number> = {};
  safeClicks.forEach((c) => {
    if (c.outfit_id) outfitMap[c.outfit_id] = (outfitMap[c.outfit_id] ?? 0) + 1;
  });
  const topOutfits = Object.entries(outfitMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      title: outfits?.find((o) => o.id === id)?.title ?? "Unknown Outfit",
      count,
    }));

  // Aggregate top items
  const itemMap: Record<string, number> = {};
  safeClicks.forEach((c) => {
    if (c.item_id) itemMap[c.item_id] = (itemMap[c.item_id] ?? 0) + 1;
  });
  const topItems = Object.entries(itemMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      name: outfitItems?.find((i) => i.id === id)?.name ?? "Unknown Product",
      brand: outfitItems?.find((i) => i.id === id)?.brand ?? "",
      count,
    }));

  return (
    <main className="container max-w-7xl py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#2D2D2D] bg-white px-3.5 py-1.5 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Admin
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFE66D] shadow-[3px_3px_0px_#2D2D2D]">
            <BarChart3 className="h-6 w-6 text-[#2D2D2D]" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-nunito tracking-tight sm:text-3xl text-[#2D2D2D]">
              Analytics &amp; Statistik
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#2D2D2D]/70">
              Performa klik &amp; estimasi pendapatan afiliasi
            </p>
          </div>
        </div>
      </div>

      {/* Client component handles all new Date() logic */}
      <AnalyticsDashboard
        clicks={safeClicks}
        totalOutfits={outfits?.length ?? 0}
        topOutfits={topOutfits}
        topItems={topItems}
      />
    </main>
  );
}
