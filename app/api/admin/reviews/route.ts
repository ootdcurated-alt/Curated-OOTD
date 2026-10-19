import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, getServiceClient } from "@/lib/adminServer";
import { REVIEW_COLUMNS, type ReviewStatus } from "@/lib/reviews";

const MAX_COMMENT_LENGTH = 600;
const MAX_NAME_LENGTH = 60;

const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

// ─── helper respons ─────────────────────────────────────────
function adminOnly() {
  return NextResponse.json(
    { success: false, message: "Akses ditolak. Hanya admin yang boleh melakukan aksi ini." },
    { status: 403 }
  );
}

function notConfigured() {
  return NextResponse.json(
    { success: false, message: "Supabase belum dikonfigurasi." },
    { status: 500 }
  );
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && (VALID_STATUSES as string[]).includes(value);
}

// ─── GET /api/admin/reviews ─────────────────────────────────
// Daftar SEMUA testimony (pending, approved, rejected) untuk dashboard admin.
export async function GET() {
  try {
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) return adminOnly();

    const db = getServiceClient();
    if (!db) return notConfigured();

    const { data, error } = await db
      .from("reviews")
      .select(REVIEW_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat ulasan admin:", error.message);
      return NextResponse.json(
        { success: false, reviews: [], message: "Gagal memuat ulasan." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reviews: data ?? [] });
  } catch (error: any) {
    console.error("GET /api/admin/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, reviews: [], message: "Gagal memuat ulasan." },
      { status: 500 }
    );
  }
}

// ─── POST /api/admin/reviews ────────────────────────────────
// Admin menambah testimony secara manual (CREATE).
// Body: { rating, comment, display_name?, status?, replace_official? }
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, label } = await getAdminContext();
    if (!isAdmin) return adminOnly();

    const db = getServiceClient();
    if (!db) return notConfigured();

    const body = await request.json().catch(() => null);

    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return badRequest("Peringkat bintang harus bernilai 1 sampai 5.");
    }

    const comment =
      typeof body?.comment === "string"
        ? body.comment.trim().slice(0, MAX_COMMENT_LENGTH)
        : "";

    let status: ReviewStatus = "approved";
    if (body?.status !== undefined && body?.status !== null && body?.status !== "") {
      if (!isReviewStatus(body.status)) {
        return badRequest("Status harus bernilai pending, approved, atau rejected.");
      }
      status = body.status;
    }

    // Nama tampilan: dari form admin, atau jatuh ke identitas resmi tim
    let displayName =
      typeof body?.display_name === "string"
        ? body.display_name.trim().slice(0, MAX_NAME_LENGTH)
        : "";
    let avatarUrl = "";

    if (!displayName) {
      const { data: settings } = await db
        .from("admin_settings")
        .select("username, avatar_url")
        .eq("id", 1)
        .maybeSingle();
      displayName = settings?.username || "Tim Curated OOTD";
      avatarUrl = settings?.avatar_url || "";
    }

    // Form testimoni resmi di halaman publik menggantikan testimoni admin sebelumnya
    if (body?.replace_official === true) {
      await db
        .from("reviews")
        .delete()
        .is("user_id", null)
        .eq("is_admin_review", true);
    }

    const now = new Date().toISOString();
    const { data, error } = await db
      .from("reviews")
      .insert({
        user_id: null,
        rating,
        comment,
        display_name: displayName,
        avatar_url: avatarUrl,
        status,
        is_admin_review: true,
        reviewed_at: status === "pending" ? null : now,
        reviewed_by: status === "pending" ? null : label,
      })
      .select(REVIEW_COLUMNS)
      .single();

    if (error) {
      console.error("Gagal menyimpan testimoni admin:", error.message);
      return NextResponse.json(
        { success: false, message: "Testimoni gagal disimpan." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: data,
      message:
        status === "approved"
          ? "Testimoni berhasil ditambahkan dan langsung tayang."
          : "Testimoni berhasil ditambahkan.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menyimpan testimoni." },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/reviews ───────────────────────────────
// UPDATE (edit isi testimony) sekaligus APPROVE / REJECT.
// Body: { id, status?, rating?, comment?, display_name? }
export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin, label } = await getAdminContext();
    if (!isAdmin) return adminOnly();

    const db = getServiceClient();
    if (!db) return notConfigured();

    const body = await request.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return badRequest("id testimony wajib disertakan.");

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updated_at: now };
    let statusChanged: ReviewStatus | null = null;

    // Perubahan status = tindakan moderasi (approve / reject / kembalikan ke pending)
    if (body?.status !== undefined) {
      if (!isReviewStatus(body.status)) {
        return badRequest("Status harus bernilai pending, approved, atau rejected.");
      }
      statusChanged = body.status;
      patch.status = body.status;
      patch.reviewed_at = body.status === "pending" ? null : now;
      patch.reviewed_by = body.status === "pending" ? null : label;
    }

    if (body?.rating !== undefined) {
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return badRequest("Peringkat bintang harus bernilai 1 sampai 5.");
      }
      patch.rating = rating;
    }

    if (body?.comment !== undefined) {
      if (typeof body.comment !== "string") {
        return badRequest("Isi testimony harus berupa teks.");
      }
      patch.comment = body.comment.trim().slice(0, MAX_COMMENT_LENGTH);
    }

    if (body?.display_name !== undefined) {
      const name =
        typeof body.display_name === "string"
          ? body.display_name.trim().slice(0, MAX_NAME_LENGTH)
          : "";
      if (!name) return badRequest("Nama pengirim tidak boleh kosong.");
      patch.display_name = name;
    }

    const hasEditableField = ["status", "rating", "comment", "display_name"].some(
      (key) => body?.[key] !== undefined
    );
    if (!hasEditableField) return badRequest("Tidak ada perubahan yang dikirim.");

    const { data, error } = await db
      .from("reviews")
      .update(patch)
      .eq("id", id)
      .select(REVIEW_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error("Gagal memperbarui ulasan:", error.message);
      return NextResponse.json(
        { success: false, message: "Testimoni gagal diperbarui." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Testimoni tidak ditemukan." },
        { status: 404 }
      );
    }

    // Moderasi selesai -> notifikasi terkait ditandai sudah dibaca
    if (statusChanged && statusChanged !== "pending") {
      await db
        .from("admin_notifications")
        .update({ is_read: true, read_at: now })
        .eq("review_id", id)
        .eq("is_read", false);
    }

    const message =
      statusChanged === "approved"
        ? "Testimoni disetujui dan sekarang tayang di halaman publik."
        : statusChanged === "rejected"
          ? "Testimoni ditolak dan tidak ditampilkan ke publik."
          : "Testimoni berhasil diperbarui.";

    return NextResponse.json({ success: true, review: data, message });
  } catch (error: any) {
    console.error("PATCH /api/admin/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memperbarui testimoni." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/reviews?id=... ───────────────────────
// Menghapus testimony apa pun (termasuk milik user).
export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) return adminOnly();

    const db = getServiceClient();
    if (!db) return notConfigured();

    let id = request.nextUrl.searchParams.get("id") || "";
    if (!id) {
      const body = await request.json().catch(() => null);
      id = typeof body?.id === "string" ? body.id : "";
    }

    if (!id) return badRequest("id testimony wajib disertakan.");

    const { error } = await db.from("reviews").delete().eq("id", id);

    if (error) {
      console.error("Gagal menghapus ulasan:", error.message);
      return NextResponse.json(
        { success: false, message: "Testimoni gagal dihapus." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Testimoni berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/admin/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus testimoni." },
      { status: 500 }
    );
  }
}
