"use client";

import Link from "next/link";
import { Heart, Lock } from "lucide-react";
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
  isLoggedIn?: boolean;
}

export default function OutfitCard({ outfit, isLoggedIn = true }: OutfitCardProps) {
  const [liked, setLiked] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  const href = isLoggedIn
    ? `/outfit/${outfit.id}`
    : `/auth/login?next=${encodeURIComponent(`/outfit/${outfit.id}`)}`;

  return (
    <div className="group relative overflow-hidden cartoon-card bg-white transition-all duration-300">
      <Link href={href} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFE66D]/20 border-b-[3px] border-[#2D2D2D]">
          <img
            src={outfit.image_url}
            alt={outfit.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Lock overlay for guests */}
          {!isLoggedIn && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col items-center gap-1.5 text-white">
                <Lock className="h-7 w-7" />
                <span className="text-xs font-black">Masuk untuk melihat</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleWishlist}
            aria-label="Save to Wishlist"
            className="absolute top-3 right-3 rounded-full border-2 border-[#2D2D2D] bg-white p-2.5 text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${liked ? "fill-[#FF6B6B] text-[#FF6B6B]" : "text-[#2D2D2D]"}`}
            />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="line-clamp-1 font-black text-base text-[#2D2D2D] font-nunito group-hover:text-[#FF6B6B] transition-colors">
            {outfit.title}
          </h3>
          {outfit.description && (
            <p className="line-clamp-2 mt-1.5 text-xs font-semibold text-[#2D2D2D]/70 leading-relaxed">
              {outfit.description}
            </p>
          )}
          {outfit.tags && outfit.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {outfit.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border-2 border-[#2D2D2D] bg-[#FFE66D] px-2.5 py-0.5 text-[10px] font-black text-[#2D2D2D] shadow-[1.5px_1.5px_0px_#2D2D2D]"
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
