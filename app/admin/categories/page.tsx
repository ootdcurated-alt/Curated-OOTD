import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/admin";
import CategoryManager from "@/components/CategoryManager";
import Link from "next/link";
import { redirect } from "next/navigation";


export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isAdmin = hasAdminCookie || isUserAdmin(user);

  if (!isAdmin) {
    redirect("/admin");
  }

  return (
    <main className="container max-w-7xl py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0CBDC] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-nunito tracking-tight text-[#4A3B45]">
            Kategori Outfit
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#4A3B45]/70 mt-1">
            Konfigurasi taksonomi dan kurasi gaya busana untuk katalog OOTD.
          </p>
        </div>
        <Link
          href="/admin"
          className="cartoon-btn inline-flex items-center gap-1.5 self-start sm:self-auto bg-white px-4 py-2 text-xs font-black text-[#4A3B45] border border-[#F5D0E0]"
        >
          &larr; Kembali ke Dashboard
        </Link>
      </div>

      <CategoryManager />
    </main>
  );
}
