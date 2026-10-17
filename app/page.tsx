import HomeClient from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Outfit } from "@/components/OutfitCard";
import { cookies } from "next/headers";
import { isUserAdmin } from "@/lib/admin";

export const instant = false;

export default async function Home() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims;
  const isAdmin = hasAdminCookie || isUserAdmin(user);

  const { data: outfits } = await supabase
    .from("outfits")
    .select("*, outfit_items(*)")
    .order("created_at", { ascending: false });

  const displayOutfits: Outfit[] = outfits ?? [];

  return (
    <main className="container max-w-7xl py-5 sm:py-10 px-3 sm:px-6 space-y-6 sm:space-y-12">
      {/* ====  Hero Section  ==== */}
      <div className="relative overflow-hidden cartoon-card bg-[#FFF8E7] p-5 sm:p-14 text-center">
        {/* Decorative shapes — hidden on mobile to reduce clutter */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#FFE66D] border-[3px] border-[#2D2D2D] opacity-40 animate-float pointer-events-none hidden sm:block" />
        <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-3xl bg-[#C8F7DC] border-[3px] border-[#2D2D2D] opacity-40 rotate-12 animate-float-delay pointer-events-none hidden sm:block" />
        <div className="absolute top-8 right-12 h-14 w-14 rounded-2xl bg-[#E8D5FF] border-[3px] border-[#2D2D2D] opacity-50 -rotate-12 animate-wiggle pointer-events-none hidden sm:block" />

        <div className="relative z-10 space-y-4 sm:space-y-6 max-w-3xl mx-auto flex flex-col items-center">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#2D2D2D] bg-[#FFE66D] px-3 py-1 shadow-[3px_3px_0px_#2D2D2D] font-black text-[10px] sm:text-xs text-[#2D2D2D] tracking-wide uppercase">
            <img
              src="/logo-icon.png"
              alt="Curated OOTD Icon"
              className="h-4 w-4 sm:h-5 sm:w-5 object-contain"
            />
            <span>Pakaian Pilihan • Gaya Lebih Baik • Setiap Hari</span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl font-black tracking-tight sm:text-5xl lg:text-6xl text-[#2D2D2D] font-nunito leading-tight">
              Eksplorasi Gaya Outfit{" "}
              <span className="text-[#FF6B6B] underline decoration-[#FFE66D] decoration-wavy underline-offset-4 sm:underline-offset-8">
                Terkurasi
              </span>
            </h1>
            <p className="text-xs sm:text-base font-bold text-[#2D2D2D]/80 max-w-xl mx-auto leading-relaxed">
              Temukan kurasi busana harian, padu padankan gaya di Studio Kreasi, dan belanja produk lewat link afiliasi pilihan.
            </p>
          </div>

          {/* Buttons — 2 column grid on mobile, row on desktop */}
          <div className="w-full pt-1 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-4">
            <Link
              href="/creator"
              className="cartoon-btn bg-[#FF6B6B] text-white px-3 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm text-center"
            >
              Studio Kreasi
            </Link>
            <Link
              href="/creator#advisor"
              className="cartoon-btn bg-[#4ECDC4] text-[#2D2D2D] px-3 py-2.5 text-xs sm:px-5 sm:py-3 sm:text-sm text-center"
            >
              Warna Kulit
            </Link>
            <Link
              href="/wishlist"
              className="cartoon-btn bg-[#FFE66D] text-[#2D2D2D] px-3 py-2.5 text-xs sm:px-5 sm:py-3 sm:text-sm text-center col-span-2 sm:col-span-1"
            >
              Wishlist Saya
            </Link>
          </div>
        </div>
      </div>

      {/* ====  Feature Cards  ==== */}
      <div className={`grid grid-cols-1 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-6`}>
        <Link
          href="/creator"
          className="group cartoon-card bg-white p-6 flex flex-col justify-between hover:bg-[#FFD8C0]/30"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FF6B6B] shadow-[3px_3px_0px_#2D2D2D] flex items-center justify-center text-white group-hover:rotate-6 transition-transform">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-lg text-[#2D2D2D] group-hover:text-[#FF6B6B] transition-colors font-nunito">
                Studio Kreasi Outfit
              </h3>
              <p className="mt-1.5 text-xs font-semibold text-[#2D2D2D]/80 leading-relaxed">
                Kustomisasi dan padu-padankan atasan, bawahan, serta aksesoris secara bebas sesuai warna favorit Anda.
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#FF6B6B] mt-5 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Buka Studio &rarr;
          </span>
        </Link>

        <Link
          href="/creator#advisor"
          className="group cartoon-card bg-white p-6 flex flex-col justify-between hover:bg-[#C8F7DC]/30"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl border-[3px] border-[#2D2D2D] bg-[#4ECDC4] shadow-[3px_3px_0px_#2D2D2D] flex items-center justify-center text-[#2D2D2D] group-hover:rotate-6 transition-transform">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm10-10a4 4 0 100-8 4 4 0 000 8zm-8-3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-lg text-[#2D2D2D] group-hover:text-[#4ECDC4] transition-colors font-nunito">
                Analisis Warna Personal
              </h3>
              <p className="mt-1.5 text-xs font-semibold text-[#2D2D2D]/80 leading-relaxed">
                Panduan rekomendasi palet warna busana optimal sesuai tone kulit Anda.
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#4ECDC4] mt-5 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Konsultasi Sekarang &rarr;
          </span>
        </Link>

        {isAdmin && (
          <Link
            href="/admin/categories"
            className="group cartoon-card bg-white p-6 flex flex-col justify-between hover:bg-[#E8D5FF]/30"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFE66D] shadow-[3px_3px_0px_#2D2D2D] flex items-center justify-center text-[#2D2D2D] group-hover:rotate-6 transition-transform">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-lg text-[#2D2D2D] group-hover:text-[#A78BFA] transition-colors font-nunito">
                  Manajemen Kategori
                </h3>
                <p className="mt-1.5 text-xs font-semibold text-[#2D2D2D]/80 leading-relaxed">
                  Pengaturan klasifikasi dan taksonomi gaya busana katalog outfit.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-[#2D2D2D] mt-5 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Kelola Kategori &rarr;
            </span>
          </Link>
        )}
      </div>

      {/* ====  Outfit Grid Feed with Category Filter  ==== */}
      <HomeClient outfits={displayOutfits} />
    </main>
  );
}
