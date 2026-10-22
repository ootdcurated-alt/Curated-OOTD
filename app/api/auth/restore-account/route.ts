import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  clearDeletionMetadata,
  getAccountDeletionState,
} from "@/lib/accountDeletion";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

function getSupabaseAdmin() {
  return createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Verifikasi kredensial — dapatkan session token awal
    const anonClient = createAdminClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData?.user || !signInData?.session) {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    const user = signInData.user;
    const deletion = getAccountDeletionState(user.user_metadata);

    if (!deletion.isPending) {
      return NextResponse.json(
        { success: false, message: "Akun ini tidak dalam proses penghapusan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    if (deletion.isExpired) {
      await admin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        {
          success: false,
          message: "Masa pemulihan 3 hari sudah habis. Akun telah dihapus permanen.",
        },
        { status: 410 }
      );
    }

    // 2. Pulihkan akun — hapus deletion metadata via service role
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: clearDeletionMetadata(user.user_metadata),
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message || "Gagal memulihkan akun." },
        { status: 500 }
      );
    }

    // 3. Refresh token agar access token baru tidak lagi membawa deletion metadata
    //    Token lama masih encode metadata lama di JWT — harus di-refresh dulu
    const refreshClient = createAdminClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: refreshData, error: refreshError } = await refreshClient.auth.refreshSession({
      refresh_token: signInData.session.refresh_token,
    });

    // Pilih token: gunakan hasil refresh jika berhasil, fallback ke token awal
    const finalSession =
      !refreshError && refreshData?.session
        ? refreshData.session
        : signInData.session;

    // 4. Kembalikan token ke client — client akan set session di browser
    //    (SSR setSession tidak bisa menulis cookie dari route handler)
    return NextResponse.json({
      success: true,
      message: "Akun berhasil dipulihkan. Selamat datang kembali!",
      access_token: finalSession.access_token,
      refresh_token: finalSession.refresh_token,
    });
  } catch (err: unknown) {
    console.error("POST /api/auth/restore-account error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan saat memulihkan akun.",
      },
      { status: 500 }
    );
  }
}
