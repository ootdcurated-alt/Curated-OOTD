import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAccountDeletionState } from "@/lib/accountDeletion";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Menghapus permanen akun jika masa tenggang 3 hari sudah lewat. */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid." }, { status: 401 });
    }

    const user = userData.user;
    const deletion = getAccountDeletionState(user.user_metadata);

    if (!deletion.isPending) {
      return NextResponse.json({ success: true, finalized: false });
    }

    if (!deletion.isExpired) {
      return NextResponse.json(
        { success: false, message: "Akun masih dalam masa tenggang pemulihan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    await admin.auth.admin.deleteUser(user.id);
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      finalized: true,
      message: "Akun telah dihapus permanen.",
    });
  } catch (err: unknown) {
    console.error("POST /api/auth/finalize-account-deletion error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan.",
      },
      { status: 500 }
    );
  }
}
