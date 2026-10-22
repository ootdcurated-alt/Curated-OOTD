import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/admin";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

// ─── helper: cek apakah request datang dari admin ────────────────────────────
async function checkAdmin() {
  const cookieStore = await cookies();
  const hasAdminCookie =
    cookieStore.get("admin_session")?.value === "adminootd_authenticated";
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { isAdmin: hasAdminCookie || isUserAdmin(data?.claims), supabase };
}

// ─── GET /api/categories ─────────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      // Supabase kosong atau belum dikonfigurasi — kembalikan default bawaan
      return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
    }

    // Jika di database sudah ada kategori kustom, pastikan kategori dasar tetap ada
    const combined = [...data];
    for (const def of DEFAULT_CATEGORIES) {
      if (!combined.some((c) => c.slug === def.slug)) {
        combined.push(def);
      }
    }

    return NextResponse.json({ success: true, categories: combined });
  } catch {
    return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
  }
}

// ─── POST /api/categories ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { isAdmin, supabase } = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Admin yang bisa mengelola kategori." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi." },
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
      .from("categories")
      .insert({
        name: name.trim(),
        slug: slug || `category-${Date.now()}`,
        description: description?.trim() || "",
      })
      .select()
      .single();

    if (error) {
      // Jika Supabase belum dikonfigurasi, buat objek lokal saja
      if (error.message?.includes("not configured") || error.code === "PGRST116") {
        return NextResponse.json({
          success: true,
          category: {
            id: `cat-${Date.now()}`,
            name: name.trim(),
            slug,
            description: description?.trim() || "",
            created_at: new Date().toISOString(),
          },
          local: true,
        });
      }
      throw error;
    }

    return NextResponse.json({ success: true, category: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/categories ──────────────────────────────────────────────────
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
        { success: false, message: "id atau slug kategori wajib disertakan." },
        { status: 400 }
      );
    }

    if (slug === "all") {
      return NextResponse.json(
        { success: false, message: "Kategori 'Semua Koleksi' tidak dapat dihapus." },
        { status: 400 }
      );
    }

    let query = supabase.from("categories").delete();
    if (id) {
      const { error } = await query.eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await query.eq("slug", slug);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
