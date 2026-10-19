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
    <header className="sticky top-0 z-50 w-full border-b border-[#F5D0E0] bg-[#FFF5F8]/95 backdrop-blur">
      <div className="container flex h-14 sm:h-18 max-w-7xl items-center justify-between px-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl border border-[#F5D0E0] bg-white p-1 sm:p-1.5 shadow-sm transition-transform duration-200 group-hover:rotate-6">
            <img src="/logo-icon.png" alt="Curated OOTD Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center text-lg sm:text-2xl font-black tracking-tight font-nunito leading-none text-[#4A3B45]">
              <span>Curated</span>
              <span className="text-[#CC3D72] ml-1">OOTD</span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-wider text-[#4A3B45]/70 hidden sm:block font-extrabold mt-1">
              Pakaian Pilihan • Gaya Lebih Baik
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3">
          <GuestGuardLink
            href="/creator"
            isLoggedIn={isLoggedIn}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-[#F5D0E0] bg-white text-xs font-black text-[#4A3B45] shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-md transition-all"
          >
            <Brush className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F48FB1]" />
            <span className="hidden sm:inline">Kreasi Outfit</span>
          </GuestGuardLink>

          <GuestGuardLink
            href="/wishlist"
            isLoggedIn={isLoggedIn}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-[#F5D0E0] bg-white text-xs font-black text-[#4A3B45] shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-md transition-all"
          >
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#CC3D72]" />
            <span className="hidden sm:inline">Wishlist</span>
          </GuestGuardLink>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-[#F5D0E0] bg-white text-xs font-black text-[#4A3B45] shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-md transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C87DB8]" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="h-5 w-[2px] bg-[#4A3B45]/30 mx-0.5 sm:mx-1 hidden sm:block" />
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
