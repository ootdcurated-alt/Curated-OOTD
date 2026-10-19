import HomeClient from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Outfit } from "@/components/OutfitCard";
import { cookies } from "next/headers";
import { isUserAdmin } from "@/lib/admin";
import GuestGuardLink from "@/components/GuestGuardLink";
import Testimonials from "@/components/Testimonials";
import { Review, REVIEW_COLUMNS } from "@/lib/reviews";
import { Brush } from "lucide-react";

export default async function Home() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims;
  const isAdmin = hasAdminCookie || isUserAdmin(user);
  const isLoggedIn = !!user || hasAdminCookie;

  const { data: outfits } = await supabase
    .from("outfits")
    .select("*, outfit_items(*)")
    .order("created_at", { ascending: false });

  const displayOutfits: Outfit[] = outfits ?? [];

  // Ulasan/testimoni — RLS menyaring: pengunjung hanya melihat ulasan yang
  // sudah disetujui admin, sedangkan pemilik ulasan melihat miliknya sendiri.
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .order("created_at", { ascending: false });

  const reviews: Review[] = reviewsData ?? [];
  const currentUserId = (user as any)?.sub ?? null;

  return (
    <main className="container max-w-7xl py-5 sm:py-10 px-3 sm:px-6 space-y-6 sm:space-y-12">
      {/* ====  Hero Section  ==== */}
      <div className="relative overflow-hidden cartoon-card bg-white/40 p-6 sm:p-20 text-center border-white/50 backdrop-blur-2xl">
        {/* Decorative elements — Gen Z Neon Shapes */}
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-float-delay pointer-events-none" />
        <div className="absolute top-1/4 right-10 h-20 w-20 rounded-[2rem] bg-cartoon-yellow/20 blur-2xl -rotate-12 animate-wiggle pointer-events-none hidden sm:block" />

        <div className="relative z-10 space-y-6 sm:space-y-8 max-w-4xl mx-auto flex flex-col items-center">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-1.5 shadow-cartoon-sm font-black text-[10px] sm:text-xs text-foreground tracking-widest uppercase backdrop-blur-md">
            <img
              src="/logo-icon.png"
              alt="Ikon Curated OOTD"
              className="h-5 w-5 object-contain"
            />
            <span>Kurasi Premium • Vibe Gen Z • Inspirasi Harian</span>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h1 className="text-4xl font-black tracking-tighter sm:text-7xl lg:text-8xl text-foreground font-nunito leading-[0.9] text-balance">
              Tingkatkan{" "}
              <span className="text-primary italic relative">
                Gaya Kamu
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-accent/30 -z-10 rounded-full blur-sm" />
              </span>
            </h1>
            <p className="text-sm sm:text-lg font-bold text-foreground/70 max-w-2xl mx-auto leading-relaxed text-balance">
              Jelajahi inspirasi outfit harian, padu padan gaya di Studio, dan belanja gaya terbaik secara langsung.
            </p>
          </div>

          {/* Buttons — Modern Pill Shapes */}
          <div className="w-full pt-4 grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-5">
            <GuestGuardLink
              href="/creator"
              isLoggedIn={isLoggedIn}
              className="cartoon-btn bg-primary text-white px-8 py-4 text-sm sm:text-base text-center shadow-cartoon-lg hover:scale-105 active:scale-95 transition-all"
            >
              Mulai Berkarya
            </GuestGuardLink>
            <GuestGuardLink
              href="/creator#advisor"
              isLoggedIn={isLoggedIn}
              className="cartoon-btn bg-white text-foreground border border-border px-8 py-4 text-sm sm:text-base text-center shadow-cartoon-sm hover:scale-105 active:scale-95 transition-all"
            >
              Panduan Warna Kulit
            </GuestGuardLink>
          </div>
        </div>
      </div>

      {/* ====  Feature Cards  ==== */}
      <div className={`grid grid-cols-1 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-8`}>
        <GuestGuardLink
          href="/creator"
          isLoggedIn={isLoggedIn}
          className="group cartoon-card bg-white/60 p-8 flex flex-col justify-between hover:bg-white/80 transition-all border-white/40 shadow-cartoon-sm"
        >
          <div className="space-y-6">
            <div className="h-14 w-14 rounded-3xl border border-border bg-primary/10 shadow-cartoon-sm flex items-center justify-center text-primary group-hover:rotate-12 group-hover:scale-110 transition-all">
              <Brush className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-foreground font-nunito tracking-tight">
                Studio Kreasi
              </h3>
              <p className="mt-2 text-sm font-bold text-foreground/60 leading-relaxed">
                Padu padan atasan, bawahan, dan aksesori dengan warna favorit Anda di ruang 3D yang modern.
              </p>
            </div>
          </div>
          <span className="text-sm font-black text-primary mt-8 inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform">
            Coba Studio &rarr;
          </span>
        </GuestGuardLink>

        <GuestGuardLink
          href="/creator#advisor"
          isLoggedIn={isLoggedIn}
          className="group cartoon-card bg-white/60 p-8 flex flex-col justify-between hover:bg-white/80 transition-all border-white/40 shadow-cartoon-sm"
        >
          <div className="space-y-6">
            <div className="h-14 w-14 rounded-3xl border border-border bg-accent/10 shadow-cartoon-sm flex items-center justify-center text-accent group-hover:-rotate-12 group-hover:scale-110 transition-all">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm10-10a4 4 0 100-8 4 4 0 000 8zm-8-3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-2xl text-foreground font-nunito tracking-tight">
                Analisis Warna Pribadi
              </h3>
              <p className="mt-2 text-sm font-bold text-foreground/60 leading-relaxed">
                Dapatkan rekomendasi warna berbasis AI yang paling cocok dengan warna kulit unik Anda.
              </p>
            </div>
          </div>
          <span className="text-sm font-black text-accent mt-8 inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform">
            Analisis Sekarang &rarr;
          </span>
        </GuestGuardLink>

        {isAdmin && (
          <Link
            href="/admin/categories"
            className="group cartoon-card bg-white/60 p-8 flex flex-col justify-between hover:bg-white/80 transition-all border-white/40 shadow-cartoon-sm"
          >
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-3xl border border-border bg-cartoon-purple/10 shadow-cartoon-sm flex items-center justify-center text-cartoon-purple group-hover:rotate-6 group-hover:scale-110 transition-all">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-2xl text-foreground font-nunito tracking-tight">
                  Dasbor Admin
                </h3>
                <p className="mt-2 text-sm font-bold text-foreground/60 leading-relaxed">
                  Kelola kategori, tinjau outfit, dan pantau analitik platform.
                </p>
              </div>
            </div>
            <span className="text-sm font-black text-cartoon-purple mt-8 inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Kelola Platform &rarr;
            </span>
          </Link>
        )}
      </div>

      {/* ====  Outfit Grid Feed with Category Filter  ==== */}
      <HomeClient outfits={displayOutfits} isLoggedIn={isLoggedIn} />

      {/* ====  Testimoni & Ulasan Pengguna (bintang 1-5)  ==== */}
      <Testimonials
        initialReviews={reviews}
        currentUserId={currentUserId}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
      />
    </main>
  );
}
