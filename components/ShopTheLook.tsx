"use client";

import { useState } from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { OutfitItem } from "./OutfitCard";

interface ShopTheLookProps {
  imageUrl: string;
  items: OutfitItem[];
  outfitId?: string;
}

export default function ShopTheLook({
  imageUrl,
  items,
  outfitId,
}: ShopTheLookProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const handleTrackClick = async (item: OutfitItem) => {
    try {
      fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outfit_id: outfitId,
          item_id: item.id,
          target_url: item.affiliate_url,
        }),
      }).catch((e) => console.error("Track failed", e));
    } catch (e) {
      // Ignore background tracking errors
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Image with interactive hotspot pins */}
      <div className="relative aspect-[3/4] w-full rounded-2xl border border-border bg-muted">
        {/* Gambar diklip sendiri agar tooltip hotspot tidak ikut terpotong di layer atas */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <img
            src={imageUrl}
            alt="Tampilan Outfit"
            className="h-full w-full object-cover"
          />
        </div>

        {items.map((item) => {
          if (item.x === undefined || item.y === undefined) return null;
          const isSelected = activeItemId === item.id;
          return (
            <div
              key={item.id}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 transform cursor-pointer"
              onClick={() => setActiveItemId(isSelected ? null : item.id)}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-8 w-8 sm:h-7 sm:w-7 animate-ping rounded-full bg-primary/40 opacity-75" />
                <button
                  className={`relative flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs font-bold shadow-cartoon-sm transition-transform ${
                    isSelected
                      ? "scale-125 bg-primary text-primary-foreground"
                      : "bg-background/90 text-foreground hover:scale-110"
                  }`}
                >
                  +
                </button>
              </div>

              {/* Tooltip popup */}
              {isSelected && (
                <div className="absolute bottom-8 left-1/2 z-20 w-48 -translate-x-1/2 rounded-2xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-cartoon-lg">
                  <p className="font-semibold">{item.name}</p>
                  {item.brand && (
                    <p className="text-muted-foreground">{item.brand}</p>
                  )}
                  {item.price && (
                    <p className="mt-1 font-bold">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  )}
                  <a
                    href={item.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleTrackClick(item)}
                    className="mt-2 flex items-center justify-center gap-1 rounded bg-primary py-1 text-center font-medium text-primary-foreground"
                  >
                    Beli <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Product List Breakdown */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Belanja Tampilan Ini</h2>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setActiveItemId(item.id)}
              className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                activeItemId === item.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <div>
                <p className="font-semibold text-foreground">{item.name}</p>
                {item.brand && (
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                )}
                {item.price && (
                  <p className="mt-1 font-medium text-foreground">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                )}
              </div>

              <a
                href={item.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleTrackClick(item)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-cartoon-sm hover:opacity-90"
              >
                Cek Produk
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
