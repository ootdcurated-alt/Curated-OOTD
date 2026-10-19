"use client";

import { useState } from "react";
import OutfitGrid from "@/components/OutfitGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { Outfit } from "@/components/OutfitCard";

interface HomeClientProps {
  outfits: Outfit[];
  isLoggedIn?: boolean;
}

export default function HomeClient({ outfits, isLoggedIn = false }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOutfits = outfits.filter((outfit) => {
    const matchCategory =
      activeCategory === "all" ||
      (outfit.tags || []).some(
        (tag: string) =>
          tag.toLowerCase().includes(activeCategory.toLowerCase()) ||
          activeCategory.toLowerCase().includes(tag.toLowerCase())
      );

    const matchSearch =
      searchQuery.trim() === "" ||
      outfit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (outfit.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (outfit.tags || []).some((t: string) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search + Category Controls */}
      <div className="space-y-6 cartoon-card bg-white/40 p-6 sm:p-8 backdrop-blur-2xl border-white/40 shadow-cartoon">
        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gaya, tren, atau outfit..."
            className="w-full rounded-[1.5rem] border border-border bg-white/60 pl-14 pr-6 py-4 text-sm font-black text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-cartoon-sm transition-all backdrop-blur-md"
          />
        </div>

        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black tracking-tighter text-foreground font-nunito uppercase">
          {activeCategory === "all" ? "Koleksi Terbaru" : `${activeCategory}`}
        </h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
          {filteredOutfits.length} Outfit Ditemukan
        </span>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-border bg-white/20 p-20 text-center backdrop-blur-sm">
          <p className="text-foreground/50 text-sm font-bold">
            Tidak ada outfit untuk kategori &ldquo;{activeCategory}&rdquo;.
          </p>
          <button
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 text-xs font-black text-primary uppercase tracking-widest hover:underline underline-offset-4"
          >
            Lihat Semua Gaya &rarr;
          </button>
        </div>
      ) : (
        <OutfitGrid outfits={filteredOutfits} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}
