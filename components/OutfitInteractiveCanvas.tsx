"use client";

import React from "react";
import { OutfitCreationItem } from "@/lib/creatorStore";
import { ExternalLink, Palette, Trash2, Sparkles } from "lucide-react";

interface OutfitInteractiveCanvasProps {
  topItem?: OutfitCreationItem;
  bottomItem?: OutfitCreationItem;
  outerItem?: OutfitCreationItem;
  shoesItem?: OutfitCreationItem;
  accessoryItem?: OutfitCreationItem;
  customColors: {
    top: string;
    bottom: string;
    outer: string;
    shoes: string;
    accessory: string;
  };
  onColorChange: (slot: "top" | "bottom" | "outer" | "shoes" | "accessory", color: string) => void;
  onRemoveItem: (item: OutfitCreationItem) => void;
  canvasBg: string;
}

export default function OutfitInteractiveCanvas({
  topItem,
  bottomItem,
  outerItem,
  shoesItem,
  accessoryItem,
  customColors,
  onColorChange,
  onRemoveItem,
  canvasBg,
}: OutfitInteractiveCanvasProps) {
  return (
    <div
      className="relative rounded-3xl p-6 sm:p-8 border-[3px] border-[#2D2D2D] shadow-[6px_6px_0px_#2D2D2D] transition-colors duration-300 min-h-[560px] flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: canvasBg }}
    >
      {/* Decorative Brand Header */}
      <div className="flex items-center justify-between border-b-2 border-[#2D2D2D]/20 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF6B6B] border border-[#2D2D2D]" />
          <span className="h-3 w-3 rounded-full bg-[#FFE66D] border border-[#2D2D2D]" />
          <span className="h-3 w-3 rounded-full bg-[#4ECDC4] border border-[#2D2D2D]" />
          <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] ml-2 font-nunito">
            Lookbook Kanvas Studio
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-black text-[#2D2D2D] bg-white px-3 py-1 rounded-full border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
          <Palette className="h-3.5 w-3.5 text-[#FF6B6B]" />
          Warna &amp; Pakaian Kustom
        </div>
      </div>

      {/* Main Interactive Layout: 3 Columns (Left: Aksesoris & Outer, Center: Atasan & Bawahan, Right: Sepatu & Detail) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch my-auto">
        {/* Kolom 1: Aksesoris & Outerwear */}
        <div className="md:col-span-3 flex flex-col gap-4 justify-center">
          {/* Slot Aksesoris */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#2D2D2D] flex items-center gap-1 font-nunito">
                <Sparkles className="h-3.5 w-3.5 text-[#FFE66D]" /> Aksesoris
              </span>
              {accessoryItem && (
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={customColors.accessory}
                    onChange={(e) => onColorChange("accessory", e.target.value)}
                    className="h-6 w-6 rounded-full border-2 border-[#2D2D2D] cursor-pointer p-0 overflow-hidden shadow-[1px_1px_0px_#2D2D2D]"
                    title="Ganti warna kustom aksesoris"
                  />
                </div>
              )}
            </div>

            {accessoryItem ? (
              <div className="group relative rounded-2xl bg-white border-[3px] border-[#2D2D2D] p-3 shadow-[3px_3px_0px_#2D2D2D] transition-transform hover:-translate-y-1">
                <div
                  className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-[#2D2D2D]/30 mb-2 transition-colors"
                  style={{
                    backgroundColor: customColors.accessory ? `${customColors.accessory}25` : "#F8F8F8",
                  }}
                >
                  <img
                    src={accessoryItem.imageUrl}
                    alt={accessoryItem.name}
                    className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color transition-colors"
                    style={{ backgroundColor: customColors.accessory }}
                  />
                  <button
                    onClick={() => onRemoveItem(accessoryItem)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 hover:bg-[#FF6B6B] text-[#2D2D2D] hover:text-white border-2 border-[#2D2D2D] flex items-center justify-center transition-colors shadow-[1px_1px_0px_#2D2D2D]"
                    title="Hapus item"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-[#2D2D2D] shrink-0"
                      style={{ backgroundColor: customColors.accessory }}
                    />
                    <h5 className="text-xs font-black text-[#2D2D2D] line-clamp-1 font-nunito">
                      {accessoryItem.name}
                    </h5>
                  </div>
                  {accessoryItem.price && (
                    <p className="text-[11px] font-bold text-[#2D2D2D]/70 font-mono">
                      Rp {accessoryItem.price.toLocaleString("id-ID")}
                    </p>
                  )}
                  <a
                    href={accessoryItem.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center justify-center gap-1 w-full rounded-lg bg-[#FFF8E7] hover:bg-[#FFE66D] border-2 border-[#2D2D2D] py-1 text-[10px] font-black text-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D] transition-colors"
                  >
                    Beli Aksesoris <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#2D2D2D]/40 bg-white/60 p-4 text-center">
                <p className="text-[11px] font-bold text-[#2D2D2D]/60">Belum ada aksesoris</p>
                <span className="text-[10px] text-[#2D2D2D]/40">Pilih dari lemari di samping</span>
              </div>
            )}
          </div>

          {/* Slot Outerwear (Jika Ada) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#2D2D2D] flex items-center gap-1 font-nunito">
                Outerwear
              </span>
              {outerItem && (
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={customColors.outer}
                    onChange={(e) => onColorChange("outer", e.target.value)}
                    className="h-6 w-6 rounded-full border-2 border-[#2D2D2D] cursor-pointer p-0 overflow-hidden shadow-[1px_1px_0px_#2D2D2D]"
                    title="Ganti warna kustom outer"
                  />
                </div>
              )}
            </div>

            {outerItem ? (
              <div className="group relative rounded-2xl bg-white border-[3px] border-[#2D2D2D] p-3 shadow-[3px_3px_0px_#2D2D2D] transition-transform hover:-translate-y-1">
                <div
                  className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-[#2D2D2D]/30 mb-2 transition-colors"
                  style={{
                    backgroundColor: customColors.outer ? `${customColors.outer}25` : "#F8F8F8",
                  }}
                >
                  <img
                    src={outerItem.imageUrl}
                    alt={outerItem.name}
                    className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color transition-colors"
                    style={{ backgroundColor: customColors.outer }}
                  />
                  <button
                    onClick={() => onRemoveItem(outerItem)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 hover:bg-[#FF6B6B] text-[#2D2D2D] hover:text-white border-2 border-[#2D2D2D] flex items-center justify-center transition-colors shadow-[1px_1px_0px_#2D2D2D]"
                    title="Hapus outer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-[#2D2D2D] shrink-0"
                      style={{ backgroundColor: customColors.outer }}
                    />
                    <h5 className="text-xs font-black text-[#2D2D2D] line-clamp-1 font-nunito">
                      {outerItem.name}
                    </h5>
                  </div>
                  {outerItem.price && (
                    <p className="text-[11px] font-bold text-[#2D2D2D]/70 font-mono">
                      Rp {outerItem.price.toLocaleString("id-ID")}
                    </p>
                  )}
                  <a
                    href={outerItem.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center justify-center gap-1 w-full rounded-lg bg-[#FFF8E7] hover:bg-[#FFE66D] border-2 border-[#2D2D2D] py-1 text-[10px] font-black text-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D] transition-colors"
                  >
                    Beli Outer <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#2D2D2D]/40 bg-white/60 p-3 text-center">
                <span className="text-[10px] font-bold text-[#2D2D2D]/50">+ Tambah Outerwear</span>
              </div>
            )}
          </div>
        </div>

        {/* Kolom 2: PUSAT UTAMA (Atasan & Bawahan) */}
        <div className="md:col-span-6 flex flex-col gap-4">
          {/* SLOT ATASAN (TOP) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FF6B6B] text-white px-2.5 py-0.5 text-xs font-black border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] font-nunito">
                  1. Atasan (Top)
                </span>
                {topItem && (
                  <span className="text-[11px] font-bold text-[#2D2D2D]/70">
                    Warna Terpilih
                  </span>
                )}
              </div>
              {topItem && (
                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
                  <span className="text-[10px] font-black text-[#2D2D2D] uppercase font-mono">
                    {customColors.top}
                  </span>
                  <input
                    type="color"
                    value={customColors.top}
                    onChange={(e) => onColorChange("top", e.target.value)}
                    className="h-6 w-6 rounded-full border border-[#2D2D2D] cursor-pointer p-0 overflow-hidden"
                    title="Pilih warna atasan"
                  />
                </div>
              )}
            </div>

            {topItem ? (
              <div className="group relative rounded-3xl bg-white border-[3px] border-[#2D2D2D] p-4 shadow-[4px_4px_0px_#2D2D2D] transition-all hover:-translate-y-1">
                <div
                  className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-[#2D2D2D]/30 mb-3 transition-colors flex items-center justify-center"
                  style={{
                    backgroundColor: customColors.top ? `${customColors.top}20` : "#F8F8F8",
                  }}
                >
                  <img
                    src={topItem.imageUrl}
                    alt={topItem.name}
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform p-1"
                  />
                  {/* Color Overlay Tint Effect */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color transition-colors"
                    style={{ backgroundColor: customColors.top }}
                  />
                  <button
                    onClick={() => onRemoveItem(topItem)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/95 hover:bg-[#FF6B6B] text-[#2D2D2D] hover:text-white border-2 border-[#2D2D2D] flex items-center justify-center transition-colors shadow-[2px_2px_0px_#2D2D2D]"
                    title="Ganti / Hapus Atasan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-[#2D2D2D] line-clamp-1 font-nunito">
                      {topItem.name}
                    </h4>
                    <p className="text-xs font-bold text-[#2D2D2D]/70 font-mono">
                      {topItem.brand} • Rp {(topItem.price || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <a
                    href={topItem.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FFE66D] hover:bg-[#FFD8C0] border-2 border-[#2D2D2D] px-3.5 py-1.5 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] transition-transform active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    Beli Atasan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-[#2D2D2D]/40 bg-white/70 p-8 text-center space-y-2">
                <p className="text-xs font-black text-[#2D2D2D]">Belum ada atasan yang dipilih</p>
                <p className="text-[11px] text-[#2D2D2D]/60 font-semibold">
                  Klik item atasan pada daftar lemari di sebelah kanan
                </p>
              </div>
            )}
          </div>

          {/* SLOT BAWAHAN (BOTTOM) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#4ECDC4] text-[#2D2D2D] px-2.5 py-0.5 text-xs font-black border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] font-nunito">
                  2. Bawahan (Bottom)
                </span>
                {bottomItem && (
                  <span className="text-[11px] font-bold text-[#2D2D2D]/70">
                    Warna Terpilih
                  </span>
                )}
              </div>
              {bottomItem && (
                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
                  <span className="text-[10px] font-black text-[#2D2D2D] uppercase font-mono">
                    {customColors.bottom}
                  </span>
                  <input
                    type="color"
                    value={customColors.bottom}
                    onChange={(e) => onColorChange("bottom", e.target.value)}
                    className="h-6 w-6 rounded-full border border-[#2D2D2D] cursor-pointer p-0 overflow-hidden"
                    title="Pilih warna bawahan"
                  />
                </div>
              )}
            </div>

            {bottomItem ? (
              <div className="group relative rounded-3xl bg-white border-[3px] border-[#2D2D2D] p-4 shadow-[4px_4px_0px_#2D2D2D] transition-all hover:-translate-y-1">
                <div
                  className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-[#2D2D2D]/30 mb-3 transition-colors flex items-center justify-center"
                  style={{
                    backgroundColor: customColors.bottom ? `${customColors.bottom}20` : "#F8F8F8",
                  }}
                >
                  <img
                    src={bottomItem.imageUrl}
                    alt={bottomItem.name}
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform p-1"
                  />
                  {/* Color Overlay Tint Effect */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color transition-colors"
                    style={{ backgroundColor: customColors.bottom }}
                  />
                  <button
                    onClick={() => onRemoveItem(bottomItem)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/95 hover:bg-[#FF6B6B] text-[#2D2D2D] hover:text-white border-2 border-[#2D2D2D] flex items-center justify-center transition-colors shadow-[2px_2px_0px_#2D2D2D]"
                    title="Ganti / Hapus Bawahan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-[#2D2D2D] line-clamp-1 font-nunito">
                      {bottomItem.name}
                    </h4>
                    <p className="text-xs font-bold text-[#2D2D2D]/70 font-mono">
                      {bottomItem.brand} • Rp {(bottomItem.price || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <a
                    href={bottomItem.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#C8F7DC] hover:bg-[#A8E6CF] border-2 border-[#2D2D2D] px-3.5 py-1.5 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] transition-transform active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    Beli Bawahan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-[#2D2D2D]/40 bg-white/70 p-8 text-center space-y-2">
                <p className="text-xs font-black text-[#2D2D2D]">Belum ada bawahan yang dipilih</p>
                <p className="text-[11px] text-[#2D2D2D]/60 font-semibold">
                  Pilih celana atau rok dari lemari di samping
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom 3: Sepatu & Info Total */}
        <div className="md:col-span-3 flex flex-col gap-4 justify-center">
          {/* Slot Sepatu (Shoes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#2D2D2D] flex items-center gap-1 font-nunito">
                Sepatu / Alas Kaki
              </span>
              {shoesItem && (
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={customColors.shoes}
                    onChange={(e) => onColorChange("shoes", e.target.value)}
                    className="h-6 w-6 rounded-full border-2 border-[#2D2D2D] cursor-pointer p-0 overflow-hidden shadow-[1px_1px_0px_#2D2D2D]"
                    title="Ganti warna kustom sepatu"
                  />
                </div>
              )}
            </div>

            {shoesItem ? (
              <div className="group relative rounded-2xl bg-white border-[3px] border-[#2D2D2D] p-3 shadow-[3px_3px_0px_#2D2D2D] transition-transform hover:-translate-y-1">
                <div
                  className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-[#2D2D2D]/30 mb-2 transition-colors"
                  style={{
                    backgroundColor: customColors.shoes ? `${customColors.shoes}25` : "#F8F8F8",
                  }}
                >
                  <img
                    src={shoesItem.imageUrl}
                    alt={shoesItem.name}
                    className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color transition-colors"
                    style={{ backgroundColor: customColors.shoes }}
                  />
                  <button
                    onClick={() => onRemoveItem(shoesItem)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 hover:bg-[#FF6B6B] text-[#2D2D2D] hover:text-white border-2 border-[#2D2D2D] flex items-center justify-center transition-colors shadow-[1px_1px_0px_#2D2D2D]"
                    title="Hapus sepatu"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-[#2D2D2D] shrink-0"
                      style={{ backgroundColor: customColors.shoes }}
                    />
                    <h5 className="text-xs font-black text-[#2D2D2D] line-clamp-1 font-nunito">
                      {shoesItem.name}
                    </h5>
                  </div>
                  {shoesItem.price && (
                    <p className="text-[11px] font-bold text-[#2D2D2D]/70 font-mono">
                      Rp {shoesItem.price.toLocaleString("id-ID")}
                    </p>
                  )}
                  <a
                    href={shoesItem.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center justify-center gap-1 w-full rounded-lg bg-[#FFF8E7] hover:bg-[#FFE66D] border-2 border-[#2D2D2D] py-1 text-[10px] font-black text-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D] transition-colors"
                  >
                    Beli Sepatu <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#2D2D2D]/40 bg-white/60 p-4 text-center">
                <p className="text-[11px] font-bold text-[#2D2D2D]/60">Belum ada sepatu</p>
                <span className="text-[10px] text-[#2D2D2D]/40">Pilih dari lemari di samping</span>
              </div>
            )}
          </div>

          {/* Quick Palet Warna Preview Box */}
          <div className="rounded-2xl bg-white border-2 border-[#2D2D2D] p-3 shadow-[2px_2px_0px_#2D2D2D] space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2D2D2D] block font-nunito">
              Kombinasi Warna Busana
            </span>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <div
                  className="h-6 w-6 rounded-full border-2 border-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D]"
                  style={{ backgroundColor: customColors.top }}
                  title={`Atasan: ${customColors.top}`}
                />
                <div
                  className="h-6 w-6 rounded-full border-2 border-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D]"
                  style={{ backgroundColor: customColors.bottom }}
                  title={`Bawahan: ${customColors.bottom}`}
                />
                <div
                  className="h-6 w-6 rounded-full border-2 border-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D]"
                  style={{ backgroundColor: customColors.accessory }}
                  title={`Aksesoris: ${customColors.accessory}`}
                />
                <div
                  className="h-6 w-6 rounded-full border-2 border-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D]"
                  style={{ backgroundColor: customColors.shoes }}
                  title={`Sepatu: ${customColors.shoes}`}
                />
              </div>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 font-mono">
                Harmoni Gaya
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Studio Info */}
      <div className="mt-6 pt-3 border-t-2 border-[#2D2D2D]/20 flex flex-wrap items-center justify-between text-xs font-bold text-[#2D2D2D]/80">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-[#2D2D2D]">
            Curated OOTD Studio
          </span>
          <span className="text-[#2D2D2D]/40">•</span>
          <span className="text-[11px]">Bebas atur dan kombinasikan warna sesuai selera</span>
        </div>
        <div className="text-[11px] font-black text-[#2D2D2D] font-mono">
          🎨 Klik ikon warna pada setiap pakaian untuk menyesuaikan nuansa
        </div>
      </div>
    </div>
  );
}
