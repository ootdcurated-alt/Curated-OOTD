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
import { normalizeOutfitItems } from "@/lib/outfitItems";

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

  const displayOutfits: Outfit[] = (outfits ?? []).map((o: any) => ({
    ...o,
    items: normalizeOutfitItems(o.outfit_items || o.items),
  }));

  // Ulasan/testimoni — RLS menyaring: pengunjung hanya melihat ulasan yang
  // sudah disetujui admin, sedangkan pemilik ulasan melihat miliknya sendiri.
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .order("created_at", { ascending: false });

  const reviews: Review[] = reviewsData ?? [];
  const currentUserId = (user as any)?.sub ?? null;

  return (
    <main className="container max-w-7xl py-3 sm:py-8 px-3 sm:px-6 space-y-5 sm:space-y-8 w-full min-w-0">
      {/* ====  Hero Section — tanpa kotak, rata tengah atas ==== */}
      <section className="mx-auto w-full max-w-2xl pt-1 sm:pt-4 pb-1 text-center flex flex-col items-center justify-start gap-3 sm:gap-5 px-1">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] sm:text-xs font-black uppercase tracking-wide sm:tracking-[0.2em] text-foreground/50 leading-snug max-w-[320px] sm:max-w-none">
          <img
            src="/logo-icon.png"
            alt=""
            className="h-4 w-4 object-contain opacity-80"
            aria-hidden
          />
          <span>Kurasi Premium</span>
          <span className="text-foreground/30 hidden sm:inline" aria-hidden>·</span>
          <span>Vibe Gen Z</span>
          <span className="text-foreground/30" aria-hidden>·</span>
          <span>Inspirasi Harian</span>
        </p>

        <div className="space-y-2.5 sm:space-y-4 w-full">
          <h1 className="text-[1.65rem] leading-tight font-black tracking-tight sm:text-4xl md:text-[2.75rem] text-foreground font-nunito text-balance px-1">
            Tingkatkan{" "}
            <span className="text-primary italic">Gaya Kamu</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold text-muted-foreground max-w-lg mx-auto leading-relaxed text-balance">
            Jelajahi inspirasi outfit harian, padu padan gaya di Studio, dan belanja gaya terbaik secara langsung.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto pt-1 max-w-sm sm:max-w-none mx-auto">
          <GuestGuardLink
            href="/creator"
            isLoggedIn={isLoggedIn}
            className="cartoon-btn touch-target bg-primary text-white px-6 py-3 sm:py-2.5 text-sm text-center shadow-cartoon-sm min-h-[44px] flex items-center justify-center"
          >
            Mulai Berkarya
          </GuestGuardLink>
          <GuestGuardLink
            href="/creator#advisor"
            isLoggedIn={isLoggedIn}
            className="cartoon-btn touch-target bg-white/90 text-foreground border border-border px-6 py-3 sm:py-2.5 text-sm text-center shadow-cartoon-sm min-h-[44px] flex items-center justify-center"
          >
            Panduan Warna Kulit
          </GuestGuardLink>
        </div>
      </section>

      {/* ====  Feature Cards  ==== */}
      <div className={`grid grid-cols-1 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-5 sm:gap-6`}>
        <GuestGuardLink
          href="/creator"
          isLoggedIn={isLoggedIn}
          className="group cartoon-card bg-white/60 p-5 sm:p-7 flex flex-col justify-between hover:bg-white/80 transition-all border-white/40 shadow-cartoon-sm"
        >
          <div className="space-y-6">
            <div className="icon-3d h-14 w-14 rounded-3xl border border-border bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 group-hover:scale-110 transition-all">
              <Brush className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-black text-xl sm:text-2xl text-foreground font-nunito tracking-tight">
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
          className="group cartoon-card bg-white/60 p-5 sm:p-7 flex flex-col justify-between hover:bg-white/80 transition-all border-white/40 shadow-cartoon-sm"
        >
          <div className="space-y-6">
            <div className="icon-3d h-14 w-14 rounded-3xl border border-border bg-accent/10 flex items-center justify-center text-accent group-hover:-rotate-12 group-hover:scale-110 transition-all">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm10-10a4 4 0 100-8 4 4 0 000 8zm-8-3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-xl sm:text-2xl text-foreground font-nunito tracking-tight">
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
            className="group cartoon-card bg-white/60 p-5 sm:p-7 flex flex-col justify-between hover:bg-white/80 transition-all border-white/40 shadow-cartoon-sm"
          >
            <div className="space-y-6">
              <div className="icon-3d h-14 w-14 rounded-3xl border border-border bg-cartoon-purple/10 flex items-center justify-center text-cartoon-purple group-hover:rotate-6 group-hover:scale-110 transition-all">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-xl sm:text-2xl text-foreground font-nunito tracking-tight">
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
