"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";

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
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
  const [liked, setLiked] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <div className="group relative overflow-hidden cartoon-card bg-white/60 backdrop-blur-xl transition-all duration-500 border-white/40 hover:scale-[1.02] hover:shadow-cartoon-lg">
      <Link href={`/outfit/${outfit.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-primary/5 border-b border-border">
          <img
            src={outfit.image_url}
            alt={outfit.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <button
            onClick={toggleWishlist}
            aria-label="Simpan ke Favorit"
            className="absolute top-4 right-4 rounded-full border border-white/40 bg-white/80 backdrop-blur-md p-3 text-foreground shadow-cartoon-sm transition-all duration-300 hover:scale-110 active:scale-90"
          >
            <Heart
              className={`h-5 w-5 transition-colors duration-300 ${liked ? "fill-primary text-primary scale-110" : "text-foreground/40"}`}
            />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          <h3 className="line-clamp-1 font-black text-lg text-foreground font-nunito tracking-tight group-hover:text-primary transition-colors duration-300">
            {outfit.title}
          </h3>
          {outfit.description && (
            <p className="line-clamp-2 text-xs font-bold text-foreground/50 leading-relaxed">
              {outfit.description}
            </p>
          )}
          {outfit.tags && outfit.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {outfit.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-white/80 px-3 py-1 text-[9px] font-black text-foreground/60 shadow-sm uppercase tracking-widest"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
