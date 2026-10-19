import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isUserAdmin } from "@/lib/admin";
import AdminReviewManager from "@/components/AdminReviewManager";
import { Review, REVIEW_COLUMNS } from "@/lib/reviews";
import Link from "next/link";
import { redirect } from "next/navigation";

// Mengambil SEMUA ulasan (termasuk yang belum disetujui) memakai service role
async function getAllReviews(): Promise<Review[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return [];

  const db = createServiceClient(url, key);
  const { data } = await db
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .order("created_at", { ascending: false });

  return (data as Review[]) ?? [];
}

export default async function AdminReviewsPage() {
  const cookieStore = await cookies();
  const hasAdminCookie =
    cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isAdmin = hasAdminCookie || isUserAdmin(user);

  if (!isAdmin) {
    redirect("/admin");
  }

  const reviews = await getAllReviews();

  return (
    <main className="container max-w-5xl py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0CBDC] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-nunito tracking-tight text-[#4A3B45]">
            Ulasan &amp; Testimoni
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#4A3B45]/70 mt-1">
            Setujui, sembunyikan, atau hapus ulasan pengguna, serta tulis testimoni resmi admin.
          </p>
        </div>
        <Link
          href="/admin"
          className="cartoon-btn inline-flex items-center gap-1.5 self-start sm:self-auto bg-white px-4 py-2 text-xs font-black text-[#4A3B45] border border-[#F5D0E0]"
        >
          &larr; Kembali ke Dashboard
        </Link>
      </div>

      <AdminReviewManager initialReviews={reviews} />
    </main>
  );
}
