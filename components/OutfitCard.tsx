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
    <div className="group relative overflow-hidden cartoon-card bg-white transition-all duration-300">
      <Link href={`/outfit/${outfit.id}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFC2D9]/20 border-b border-[#F5D0E0]">
          <img
            src={outfit.image_url}
            alt={outfit.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <button
            onClick={toggleWishlist}
            aria-label="Save to Wishlist"
            className="absolute top-3 right-3 rounded-full border border-[#F5D0E0] bg-white p-2.5 text-[#4A3B45] shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${liked ? "fill-[#CC3D72] text-[#CC3D72]" : "text-[#4A3B45]"}`}
            />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="line-clamp-1 font-black text-base text-[#4A3B45] font-nunito group-hover:text-[#CC3D72] transition-colors">
            {outfit.title}
          </h3>
          {outfit.description && (
            <p className="line-clamp-2 mt-1.5 text-xs font-semibold text-[#4A3B45]/70 leading-relaxed">
              {outfit.description}
            </p>
          )}
          {outfit.tags && outfit.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {outfit.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#F5D0E0] bg-[#FFC2D9] px-2.5 py-0.5 text-[10px] font-black text-[#4A3B45] shadow-sm"
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
