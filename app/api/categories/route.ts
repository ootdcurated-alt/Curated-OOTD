import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const hasAdminCookie = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    const isAdmin = hasAdminCookie || isUserAdmin(user);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Fitur kategori hanya dapat dikelola oleh Admin." },
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

    return NextResponse.json({
      success: true,
      category: {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: description?.trim() || "",
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
