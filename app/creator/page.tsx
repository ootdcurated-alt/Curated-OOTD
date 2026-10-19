import OutfitStudio from "@/components/OutfitStudio";
import SkinToneAdvisor from "@/components/SkinToneAdvisor";
import Link from "next/link";

export default function CreatorPage() {
  return (
    <main className="container max-w-7xl py-8 px-4 sm:px-6 space-y-12">
      <div className="space-y-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-white px-3.5 py-1.5 text-xs font-black text-[#4A3B45] shadow-sm mb-3 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        >
          &larr; Kembali ke Galeri
        </Link>
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-[#FFE0EC] text-[#4A3B45] px-3 py-0.5 rounded-full border border-[#F5D0E0] shadow-sm">
            Studio Kreasi &amp; Styling Pribadi
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-nunito tracking-tight text-[#4A3B45] pt-1">
          Studio Padu Padan Outfit
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-[#4A3B45]/75 max-w-2xl leading-relaxed">
          Kreasikan paduan busana pada kanvas interaktif dengan rujukan produk dan tautan pembelian resmi.
        </p>
      </div>

      {/* Skin Tone Advisor */}
      <SkinToneAdvisor />

      {/* Outfit Creator Studio */}
      <OutfitStudio />
    </main>
  );
}
