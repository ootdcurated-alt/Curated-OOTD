import OutfitStudio from "@/components/OutfitStudio";
import SkinToneAdvisor from "@/components/SkinToneAdvisor";
import Link from "next/link";

export default function CreatorPage() {
  return (
    <main className="container max-w-7xl py-8 px-4 sm:px-6 space-y-12">
      <div className="space-y-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2D2D2D] bg-white px-3.5 py-1.5 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] mb-3 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        >
          &larr; Kembali ke Galeri
        </Link>
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-[#C8F7DC] text-[#2D2D2D] px-3 py-0.5 rounded-full border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
            Studio Kreasi &amp; Styling Pribadi
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-nunito tracking-tight text-[#2D2D2D] pt-1">
          Studio Padu Padan Outfit
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D]/75 max-w-2xl leading-relaxed">
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
