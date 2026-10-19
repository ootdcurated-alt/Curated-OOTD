import Link from "next/link";
import { Heart, PlusCircle, Brush } from "lucide-react";
import { AuthButton } from "./auth-button";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/admin";
import GuestGuardLink from "./GuestGuardLink";

export default async function Navbar() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isAdmin = hasAdminCookie || isUserAdmin(user);
  const isLoggedIn = !!user || hasAdminCookie;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/60 backdrop-blur-xl">
      <div className="container flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1.25rem] border border-border bg-white p-1.5 sm:p-2 shadow-cartoon-sm transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
            <img src="/logo-icon.png" alt="Curated OOTD Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center text-xl sm:text-2xl font-black tracking-tighter font-nunito leading-none text-foreground">
              <span>Curated</span>
              <span className="text-primary ml-1">OOTD</span>
            </div>
            <span className="text-[10px] tracking-widest text-foreground/60 hidden sm:block font-black uppercase mt-1">
              Pakaian Pilihan • Gaya Lebih Baik
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <GuestGuardLink
            href="/creator"
            isLoggedIn={isLoggedIn}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-xs font-black text-foreground shadow-cartoon-sm hover:scale-105 hover:shadow-cartoon transition-all"
          >
            <Brush className="h-4 w-4 text-accent" />
            <span className="hidden md:inline">Kreasi Outfit</span>
          </GuestGuardLink>

          <GuestGuardLink
            href="/wishlist"
            isLoggedIn={isLoggedIn}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-xs font-black text-foreground shadow-cartoon-sm hover:scale-105 hover:shadow-cartoon transition-all"
          >
            <Heart className="h-4 w-4 text-primary" />
            <span className="hidden md:inline">Favorit</span>
          </GuestGuardLink>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-xs font-black text-foreground shadow-cartoon-sm hover:scale-105 hover:shadow-cartoon transition-all"
            >
              <PlusCircle className="h-4 w-4 text-cartoon-purple" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          <div className="h-6 w-[1.5px] bg-foreground/10 mx-1 hidden sm:block" />
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
