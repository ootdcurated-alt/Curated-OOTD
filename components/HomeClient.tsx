"use client";

import { useState } from "react";
import OutfitGrid from "@/components/OutfitGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { Outfit } from "@/components/OutfitCard";

interface HomeClientProps {
  outfits: Outfit[];
  isLoggedIn?: boolean;
}

export default function HomeClient({ outfits, isLoggedIn = true }: HomeClientProps) {
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
    <div className="space-y-6">
      {/* Search + Category Controls */}
      <div className="space-y-4 cartoon-card bg-white p-5 sm:p-6">
        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2D2D2D]/60 pointer-events-none"
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
            placeholder="Cari gaya outfit, tag, atau inspirasi busana..."
            className="w-full rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFF8E7] pl-11 pr-4 py-3 text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/50 focus:outline-none shadow-[3px_3px_0px_#2D2D2D] transition-all"
          />
        </div>

        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight">
          {activeCategory === "all" ? "Koleksi Terbaru" : `Kategori: ${activeCategory}`}
        </h2>
        <span className="text-xs text-muted-foreground">
          Menampilkan {filteredOutfits.length} lookbook
        </span>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Tidak ada outfit yang cocok untuk kategori &ldquo;{activeCategory}&rdquo;.
          </p>
          <button
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-3 text-xs font-semibold text-primary underline"
          >
            Lihat semua outfit →
          </button>
        </div>
      ) : (
        <OutfitGrid outfits={filteredOutfits} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}
