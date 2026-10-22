import { NextRequest, NextResponse } from "next/server";
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

/** Menyimpan avatar/username ke tabel profiles + user_metadata (bypass RLS). */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const user = userData.user;

    // Akun yang sedang pending deletion tidak boleh mengubah profil
    const deletion = getAccountDeletionState(user.user_metadata);
    if (deletion.isPending) {
      return NextResponse.json(
        { success: false, message: "Akun sedang dalam proses penghapusan." },
        { status: 403 }
      );
    }
    const body = await req.json();
    const avatarUrl = typeof body.avatar_url === "string" ? body.avatar_url : undefined;
    const username = typeof body.username === "string" ? body.username.trim() : undefined;

    const profileRow: Record<string, string> = {
      id: user.id,
      email: user.email || "",
    };
    if (username !== undefined) profileRow.username = username;
    if (avatarUrl !== undefined) profileRow.avatar_url = avatarUrl;

    const admin = getSupabaseAdmin();
    const { error: profileError } = await admin
      .from("profiles")
      .upsert(profileRow, { onConflict: "id" });

    if (profileError) {
      return NextResponse.json(
        { success: false, message: profileError.message || "Gagal menyimpan profil." },
        { status: 500 }
      );
    }

    const metadata = { ...(user.user_metadata ?? {}) };
    let metadataChanged = false;
    if (avatarUrl !== undefined) {
      metadata.avatar_url = avatarUrl;
      metadataChanged = true;
    }
    if (username !== undefined) {
      metadata.username = username;
      metadataChanged = true;
    }

    if (metadataChanged) {
      const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: metadata,
      });
      if (metaError) {
        return NextResponse.json(
          { success: false, message: metaError.message || "Gagal memperbarui metadata akun." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("POST /api/profile/sync error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan profil.",
      },
      { status: 500 }
    );
  }
}
