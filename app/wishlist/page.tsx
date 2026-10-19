"use client";

import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import OutfitGrid from "@/components/OutfitGrid";

export default function WishlistPage() {
  return (
    <main className="container max-w-7xl py-8 px-4 sm:px-6 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-[#F5D0E0] bg-white px-3.5 py-1.5 text-xs font-black text-[#4A3B45] shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
      </Link>

      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl border border-[#F5D0E0] bg-[#CC3D72] shadow-sm flex items-center justify-center text-white">
          <Heart className="h-6 w-6 fill-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-nunito tracking-tight text-[#4A3B45]">
            Wishlist Saya
          </h1>
          <p className="text-xs font-bold text-[#4A3B45]/70">
            Daftar lookbook dan outfit favorit pilihan Anda
          </p>
        </div>
      </div>

      <div className="cartoon-card bg-white p-12 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F5D0E0] bg-[#FFC2D9] shadow-sm">
          <Heart className="h-8 w-8 text-[#CC3D72]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black font-nunito text-[#4A3B45]">
            Belum Ada Outfit Tersimpan
          </h3>
          <p className="text-xs font-semibold text-[#4A3B45]/70 max-w-md mx-auto">
            Simpan outfit yang Anda sukai dengan menekan ikon hati pada galeri untuk dilihat kembali kapan saja.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="cartoon-btn inline-block bg-[#CC3D72] text-white px-6 py-2.5 text-xs sm:text-sm font-black"
          >
            Jelajahi Inspirasi OOTD Sekarang &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
