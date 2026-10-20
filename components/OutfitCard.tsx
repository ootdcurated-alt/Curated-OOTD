"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  isInWishlist,
  toggleWishlistEntry,
  WISHLIST_UPDATED_EVENT,
} from "@/lib/wishlist";

export interface OutfitItem {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  affiliate_url: string;
  x?: number;
  y?: number;
}

export interface Outfit {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  likes_count?: number;
  tags?: string[];
  items?: OutfitItem[];
}

interface OutfitCardProps {
  outfit: Outfit;
  onSelectTag?: (tag: string) => void;
}

export default function OutfitCard({ outfit, onSelectTag }: OutfitCardProps) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isInWishlist(outfit.id));
    const sync = () => setLiked(isInWishlist(outfit.id));
    window.addEventListener(WISHLIST_UPDATED_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, sync);
  }, [outfit.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = toggleWishlistEntry({
      id: outfit.id,
      title: outfit.title,
      image_url: outfit.image_url,
      description: outfit.description,
      tags: outfit.tags,
    });
    setLiked(nowLiked);
  };

  // Hitung rentang atau harga item outfit
  const validPrices = (outfit.items || [])
    .map((it) => it.price)
    .filter((p): p is number => p !== undefined && p !== null && !isNaN(p) && p > 0);

  const priceDisplay = (() => {
    if (validPrices.length === 0) return null;
    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);

    if (minPrice === maxPrice) {
      return `Rp ${minPrice.toLocaleString("id-ID")}`;
    }
    return `Rp ${minPrice.toLocaleString("id-ID")} - ${maxPrice.toLocaleString("id-ID")}`;
  })();

  return (
    <div className="group relative overflow-hidden cartoon-card bg-white/60 backdrop-blur-xl transition-all duration-500 border-white/40">
      <Link href={`/outfit/${outfit.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-primary/5 border-b border-border">
          <img
            src={outfit.image_url}
            alt={outfit.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-black text-lg text-foreground font-nunito tracking-tight group-hover:text-primary transition-colors duration-300">
              {outfit.title}
            </h3>
            {priceDisplay && (
              <span className="shrink-0 rounded-xl bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-black text-primary font-nunito shadow-xs">
                {priceDisplay}
              </span>
            )}
          </div>
          {outfit.description && (
            <p className="line-clamp-2 text-xs font-bold text-foreground/50 leading-relaxed">
              {outfit.description}
            </p>
          )}
          {outfit.tags && outfit.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {outfit.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    if (onSelectTag) {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectTag(tag);
                    }
                  }}
                  className={`rounded-full border border-border bg-white/80 px-3 py-1 text-[9px] font-black text-foreground/60 shadow-sm uppercase tracking-widest transition-all ${
                    onSelectTag
                      ? "hover:border-primary/50 hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
                      : ""
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={toggleWishlist}
        aria-label={liked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
        aria-pressed={liked}
        className="touch-target absolute top-3 right-3 sm:top-4 sm:right-4 z-10 rounded-full border border-white/40 bg-white/80 backdrop-blur-md p-3 text-foreground shadow-cartoon-sm transition-all duration-300 hover:scale-110 active:scale-90"
      >
        <Heart
          className={`h-5 w-5 transition-colors duration-300 ${liked ? "fill-primary text-primary scale-110" : "text-foreground/40"}`}
        />
      </button>
    </div>
  );
}
