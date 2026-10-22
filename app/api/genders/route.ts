import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/admin";
import { DEFAULT_GENDERS, GenderCategory } from "@/lib/categories";

// ─── Helper Cek Admin ────────────────────────────────────────────────────────
async function checkAdmin() {
  const cookieStore = await cookies();
  const hasAdminCookie =
    cookieStore.get("admin_session")?.value === "adminootd_authenticated";
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { isAdmin: hasAdminCookie || isUserAdmin(data?.claims), supabase };
}

// ─── GET /api/genders ────────────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gender_categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, genders: DEFAULT_GENDERS });
    }

    // Gabungkan dengan default bawaan
    const combined: GenderCategory[] = [...data];
    for (const def of DEFAULT_GENDERS) {
      if (!combined.some((g) => g.slug === def.slug)) {
        combined.push(def);
      }
    }

    return NextResponse.json({ success: true, genders: combined });
  } catch {
    return NextResponse.json({ success: true, genders: DEFAULT_GENDERS });
  }
}

// ─── POST /api/genders ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { isAdmin, supabase } = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Admin yang bisa mengelola gender." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama gender wajib diisi." },
        { status: 400 }
      );
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("gender_categories")
      .insert({
        name: name.trim(),
        slug: slug || `gender-${Date.now()}`,
        description: description?.trim() || "",
      })
      .select()
      .single();

    if (error) {
      // Fallback lokal jika tabel belum dibuat di Supabase
      return NextResponse.json({
        success: true,
        gender: {
          id: `gen-${Date.now()}`,
          name: name.trim(),
          slug,
          description: description?.trim() || "",
        },
        local: true,
      });
    }

    return NextResponse.json({ success: true, gender: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/genders ─────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { isAdmin, supabase } = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, slug } = body;

    if (!id && !slug) {
      return NextResponse.json(
        { success: false, message: "id atau slug gender wajib disertakan." },
        { status: 400 }
      );
    }

    if (slug === "all" || slug === "pria" || slug === "wanita" || slug === "anak-anak") {
      return NextResponse.json(
        { success: false, message: "Kategori gender utama sistem tidak dapat dihapus." },
        { status: 400 }
      );
    }

    let query = supabase.from("gender_categories").delete();
    if (id) {
      await query.eq("id", id);
    } else {
      await query.eq("slug", slug);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
