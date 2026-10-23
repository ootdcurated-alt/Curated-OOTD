import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { REVIEW_COLUMNS } from "@/lib/reviews";
import { getAccountDeletionState } from "@/lib/accountDeletion";

const MAX_COMMENT_LENGTH = 600;

// ─── GET /api/reviews ───────────────────────────────────────
// Mengambil daftar ulasan untuk halaman publik. Hanya ulasan berstatus
// 'approved' yang dikembalikan; pemilik ulasan juga bisa melihat ulasannya
// sendiri (status apa pun) agar tahu apakah masih menunggu atau ditolak.
// Ulasan milik akun yang sedang dalam proses penghapusan disembunyikan dari user lain.
// RLS di database memfilter hal yang sama sebagai lapisan kedua.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = (claimsData?.claims?.sub as string) || null;

    let query = supabase
      .from("reviews")
      .select(REVIEW_COLUMNS)
      .order("created_at", { ascending: false });

    query = userId
      ? query.or(`status.eq.approved,user_id.eq.${userId}`)
      : query.eq("status", "approved");

    const { data, error } = await query;

    if (error) {
      console.error("Gagal memuat ulasan:", error.message);
      return NextResponse.json(
        { success: false, reviews: [], message: "Gagal memuat ulasan." },
        { status: 500 }
      );
    }

    // Ambil daftar user_id yang akun-nya sedang pending deletion
    // menggunakan service client, lalu filter review mereka dari tampilan publik
    let pendingDeletionUserIds = new Set<string>();
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key) {
        const admin = createAdminClient(url, key, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        // Ambil hanya user yang punya pending_account_deletion_at di metadata
        const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
        if (usersPage?.users) {
          for (const u of usersPage.users) {
            const state = getAccountDeletionState(u.user_metadata);
            if (state.isPending) {
              pendingDeletionUserIds.add(u.id);
            }
          }
        }
      }
    } catch {
      // Jika gagal, lanjut tanpa filter — lebih baik tampil daripada error total
    }

    // Filter: sembunyikan review dari akun pending deletion, kecuali review milik diri sendiri
    const filtered = (data ?? []).filter((r: any) => {
      if (!r.user_id) return true; // review admin (user_id null) selalu tampil
      if (r.user_id === userId) return true; // review milik sendiri tetap tampil
      return !pendingDeletionUserIds.has(r.user_id);
    });

    return NextResponse.json({ success: true, reviews: filtered });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, reviews: [], message: "Gagal memuat ulasan." },
      { status: 500 }
    );
  }
}

// ─── POST /api/reviews ──────────────────────────────────────
// Menyimpan (membuat atau memperbarui) ulasan milik user yang login.
// Status SELALU dipaksa 'pending' agar user biasa tidak bisa mempublikasikan
// ulasannya sendiri; persetujuan hanya bisa dilakukan admin.
// Akun yang sedang pending deletion tidak diizinkan submit ulasan.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return NextResponse.json(
        { success: false, message: "Silakan masuk atau daftar dulu untuk menulis ulasan." },
        { status: 401 }
      );
    }

    const user = userData.user;

    // Blokir akun yang sedang dalam proses penghapusan
    const deletion = getAccountDeletionState(user.user_metadata);
    if (deletion.isPending) {
      return NextResponse.json(
        { success: false, message: "Akun Anda sedang dalam proses penghapusan. Pulihkan akun terlebih dahulu untuk menulis ulasan." },
        { status: 403 }
      );
    }
    const body = await request.json().catch(() => null);

    const rating = Number(body?.rating);
    const comment =
      typeof body?.comment === "string"
        ? body.comment.trim().slice(0, MAX_COMMENT_LENGTH)
        : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Peringkat bintang harus bernilai 1 sampai 5." },
        { status: 400 }
      );
    }

    // Nama & foto profil diambil dari tabel profiles, dengan cadangan dari metadata akun
    let displayName =
      user.user_metadata?.username ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Pengguna";
    let avatarUrl = user.user_metadata?.avatar_url || "";

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      if (profile.username) displayName = profile.username;
      if (profile.avatar_url) avatarUrl = profile.avatar_url;
    }

    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: user.id,
        rating,
        comment,
        display_name: displayName,
        avatar_url: avatarUrl,
        // Ulasan baru maupun yang diperbarui harus disetujui admin dulu.
        // Riwayat moderasi sebelumnya direset karena isinya berubah.
        status: "pending",
        is_admin_review: false,
        reviewed_at: null,
        reviewed_by: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Gagal menyimpan ulasan:", error.message);
      return NextResponse.json(
        { success: false, message: "Ulasan gagal disimpan. Coba lagi sebentar." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ulasan berhasil dikirim dan menunggu persetujuan admin.",
    });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menyimpan ulasan." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/reviews ────────────────────────────────────
// Menghapus ulasan milik user yang sedang login.
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return NextResponse.json(
        { success: false, message: "Silakan masuk dulu untuk menghapus ulasan." },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", userData.user.id);

    if (error) {
      console.error("Gagal menghapus ulasan:", error.message);
      return NextResponse.json(
        { success: false, message: "Ulasan gagal dihapus." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Ulasan berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus ulasan." },
      { status: 500 }
    );
  }
}
