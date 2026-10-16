"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";
import { OutfitItem } from "./OutfitCard";

interface HotspotEditorProps {
  imageUrl: string;
  items: OutfitItem[];
  onChange: (items: OutfitItem[]) => void;
}

export default function HotspotEditor({
  imageUrl,
  items,
  onChange,
}: HotspotEditorProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newItem: OutfitItem = {
      id: crypto.randomUUID(),
      name: `Item #${items.length + 1}`,
      affiliate_url: "",
      x,
      y,
    };

    const nextItems = [...items, newItem];
    onChange(nextItems);
    setSelectedIdx(nextItems.length - 1);
  };

  const updateItem = (index: number, field: keyof OutfitItem, value: any) => {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], [field]: value };
    onChange(nextItems);
  };

  const removeItem = (index: number) => {
    const nextItems = items.filter((_, i) => i !== index);
    onChange(nextItems);
    setSelectedIdx(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Interactive Canvas */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Klik pada gambar untuk pasang pin hotspot:</label>
        <div
          ref={imageRef}
          onClick={handleImageClick}
          className="relative aspect-[3/4] w-full cursor-crosshair overflow-hidden rounded-xl border border-dashed border-border bg-muted"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="h-full w-full object-cover select-none pointer-events-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Masukkan URL gambar terlebih dahulu
            </div>
          )}

          {items.map((item, idx) => (
            <div
              key={item.id}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx(idx);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg cursor-pointer ${
                selectedIdx === idx ? "bg-red-500 scale-125 ring-4 ring-red-300" : "bg-primary"
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Item List / Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" /> Daftar Hotspot Item ({items.length})
          </h3>
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
            Belum ada hotspot. Klik bagian pakaian/aksesoris di foto untuk menandai produk.
          </p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`rounded-lg border p-3 space-y-2 transition-all ${
                  selectedIdx === idx ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
                onClick={() => setSelectedIdx(idx)}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(idx);
                    }}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-muted-foreground">Nama Item</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      placeholder="e.g. Oversized Linen Shirt"
                      className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Brand</label>
                    <input
                      type="text"
                      value={item.brand || ""}
                      onChange={(e) => updateItem(idx, "brand", e.target.value)}
                      placeholder="e.g. Uniqlo"
                      className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-muted-foreground">Harga (Rp)</label>
                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                      placeholder="e.g. 299000"
                      className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Affiliate URL</label>
                    <input
                      type="url"
                      value={item.affiliate_url}
                      onChange={(e) => updateItem(idx, "affiliate_url", e.target.value)}
                      placeholder="https://shope.ee/..."
                      className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
