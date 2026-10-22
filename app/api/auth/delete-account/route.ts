import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Kata sandi wajib diisi untuk menghapus akun." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid. Silakan masuk kembali." },
        { status: 401 }
      );
    }

    const email = userData.user.email;
    const userId = userData.user.id;

    // Verifikasi kata sandi sebelum hapus permanen
    const verifyClient = createAdminClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: verifyError } = await verifyClient.auth.signInWithPassword({
      email,
      password,
    });

    if (verifyError) {
      return NextResponse.json(
        { success: false, message: "Kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    // Hapus permanen langsung — tanpa masa tenggang
    const admin = getSupabaseAdmin();
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: deleteError.message || "Gagal menghapus akun." },
        { status: 500 }
      );
    }

    // Sign out sesi aktif
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Akun Anda telah dihapus permanen.",
    });
  } catch (err: unknown) {
    console.error("POST /api/auth/delete-account error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus akun.",
      },
      { status: 500 }
    );
  }
}
