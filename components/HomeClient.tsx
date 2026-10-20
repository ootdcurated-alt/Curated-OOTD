"use client";

import { useState } from "react";
import OutfitGrid from "@/components/OutfitGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { Outfit } from "@/components/OutfitCard";
import { Category, DEFAULT_CATEGORIES } from "@/lib/categories";
import { Sparkles, Tag, X } from "lucide-react";

interface HomeClientProps {
  outfits: Outfit[];
  isLoggedIn?: boolean;
}

export default function HomeClient({ outfits, isLoggedIn = false }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesList, setCategoriesList] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Cari objek kategori aktif jika ada
  const currentCategory = categoriesList.find((c) => c.slug === activeCategory);

  const filteredOutfits = outfits.filter((outfit) => {
    const matchCategory = (() => {
      if (activeCategory === "all") return true;

      const actSlug = activeCategory.toLowerCase().trim();
      const actName = (currentCategory?.name || "").toLowerCase().trim();

      return (outfit.tags || []).some((tag: string) => {
        const t = tag.toLowerCase().trim();
        const tSlug = t.replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");

        return (
          t === actSlug ||
          tSlug === actSlug ||
          (actName && t.includes(actName)) ||
          (actName && actName.includes(t)) ||
          t.includes(actSlug) ||
          actSlug.includes(t)
        );
      });
    })();

    const matchSearch =
      searchQuery.trim() === "" ||
      outfit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (outfit.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (outfit.tags || []).some((t: string) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchCategory && matchSearch;
  });

  const handleSelectTag = (tag: string) => {
    const cleanTag = tag.trim();
    // Cek apakah tag ini cocok dengan salah satu kategori yang sudah ada
    const matchedCategory = categoriesList.find(
      (c) =>
        c.slug.toLowerCase() === cleanTag.toLowerCase() ||
        c.name.toLowerCase() === cleanTag.toLowerCase()
    );

    if (matchedCategory) {
      setActiveCategory(matchedCategory.slug);
    } else {
      // Jika tag kustom, aktifkan filter kategori berdasarkan tag tersebut
      setActiveCategory(cleanTag.toLowerCase());
    }
    // Scroll mulus ke daftar hasil
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const activeCategoryTitle =
    activeCategory === "all"
      ? "Koleksi Terbaru"
      : currentCategory?.name || activeCategory;

  return (
    <div className="space-y-5 sm:space-y-8 min-w-0">
      {/* Search + Category Controls */}
      <div className="space-y-4 sm:space-y-5 cartoon-card bg-white/40 p-4 sm:p-6 backdrop-blur-2xl border-white/40 shadow-cartoon">
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
            className="input-3d w-full min-w-0 rounded-2xl sm:rounded-[1.5rem] border border-border bg-white/60 pl-12 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-4 text-base sm:text-sm font-black text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-cartoon-sm transition-all backdrop-blur-md"
          />
        </div>

        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onCategoriesLoaded={setCategoriesList}
        />
      </div>

      {/* Header Kategori Aktif + Deskripsi */}
      <div className="flex flex-col gap-2 px-1 sm:px-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black tracking-tighter text-foreground font-nunito uppercase break-words">
              {activeCategoryTitle}
            </h2>
            {activeCategory !== "all" && (
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline bg-primary/10 rounded-full px-2.5 py-0.5 transition-all"
                title="Reset filter kategori"
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 shrink-0">
            {filteredOutfits.length} Outfit Ditemukan
          </span>
        </div>

        {/* Deskripsi kategori jika ada */}
        {currentCategory?.description && activeCategory !== "all" && (
          <p className="text-xs sm:text-sm font-medium text-foreground/60 max-w-2xl leading-relaxed">
            {currentCategory.description}
          </p>
        )}
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-border bg-white/20 p-10 sm:p-20 text-center backdrop-blur-sm">
          <p className="text-foreground/50 text-sm font-bold">
            Tidak ada outfit untuk kategori &ldquo;{activeCategoryTitle}&rdquo;.
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
        <OutfitGrid
          outfits={filteredOutfits}
          isLoggedIn={isLoggedIn}
          onSelectTag={handleSelectTag}
        />
      )}
    </div>
  );
}
