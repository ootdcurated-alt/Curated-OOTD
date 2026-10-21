"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  isLoggedIn?: boolean;
  onSelectTag?: (tag: string) => void;
}

export default function OutfitCard({ outfit, isLoggedIn: initialIsLoggedIn, onSelectTag }: OutfitCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean | null>(
    typeof initialIsLoggedIn === "boolean" ? initialIsLoggedIn : null
  );

  useEffect(() => {
    setLiked(isInWishlist(outfit.id));
    const sync = () => setLiked(isInWishlist(outfit.id));
    window.addEventListener(WISHLIST_UPDATED_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, sync);
  }, [outfit.id]);

  useEffect(() => {
    if (typeof initialIsLoggedIn === "boolean") {
      setIsAuth(initialIsLoggedIn);
      return;
    }

    // Cek status auth via supabase client bila prop isLoggedIn tidak dioper
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: any) => {
      const hasUser = !!data?.user;
      const hasAdmin = typeof document !== "undefined" && document.cookie.includes("admin_session=adminootd_authenticated");
      setIsAuth(hasUser || hasAdmin);
    });
  }, [initialIsLoggedIn]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Jika guest (belum login), redirect ke login page
    if (isAuth === false) {
      router.push(`/auth/login?next=${encodeURIComponent(`/outfit/${outfit.id}`)}`);
      return;
    }

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
      <div className="relative">
        <Link href={`/outfit/${outfit.id}`} className="block">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-primary/5 border-b border-border">
            <img
              src={outfit.image_url}
              alt={outfit.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Tombol Wishlist di pojok kanan atas gambar outfit */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={liked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
          aria-pressed={liked}
          className={`group/btn absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 ${
            liked
              ? "border-pink-300 bg-white/95 text-primary shadow-pink-500/25 ring-2 ring-primary/20"
              : "border-white/80 bg-white/90 text-foreground/60 hover:text-primary hover:border-pink-200 hover:bg-white shadow-black/15"
          }`}
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
              liked
                ? "fill-primary text-primary scale-110"
                : "stroke-[2.2] group-hover/btn:text-primary group-hover/btn:scale-110"
            }`}
          />
        </button>
      </div>

      <Link href={`/outfit/${outfit.id}`} className="block">
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
    </div>
  );
}
