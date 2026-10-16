import Link from "next/link";
import { Heart, Sparkles, PlusCircle, BarChart3, Brush, Palette } from "lucide-react";
import { AuthButton } from "./auth-button";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/admin";

export default async function Navbar() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isAdmin = hasAdminCookie || isUserAdmin(user);

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-[#2D2D2D] bg-[#FFF8E7]/95 backdrop-blur">
      <div className="container flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-2xl border-[3px] border-[#2D2D2D] bg-white p-1.5 shadow-[3px_3px_0px_#2D2D2D] transition-transform duration-200 group-hover:rotate-6">
            <img
              src="/logo-icon.png"
              alt="Curated OOTD Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center text-xl sm:text-2xl font-black tracking-tight font-nunito leading-none text-[#2D2D2D]">
              <span>Curated</span>
              <span className="text-[#FF6B6B] ml-1">OOTD</span>
            </div>
            <span className="text-[10px] tracking-wider text-[#2D2D2D]/70 hidden sm:block font-extrabold mt-1">
              Pakaian Pilihan • Gaya Lebih Baik
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/creator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#2D2D2D] bg-white text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#2D2D2D] transition-all"
          >
            <Brush className="h-4 w-4 text-[#4ECDC4]" />
            <span className="hidden sm:inline">Kreasi Outfit</span>
          </Link>
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#2D2D2D] bg-white text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#2D2D2D] transition-all"
          >
            <Heart className="h-4 w-4 text-[#FF6B6B]" />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#2D2D2D] bg-white text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#2D2D2D] transition-all"
            >
              <PlusCircle className="h-4 w-4 text-[#A78BFA]" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="h-5 w-[2px] bg-[#2D2D2D]/30 mx-1 hidden sm:block" />

          {/* Tombol Auth */}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
