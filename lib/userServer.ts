import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
};

const DEFAULT_USER_PROFILE: UserProfile = {
  id: "",
  username: "Pengguna",
  email: "",
  avatar_url: "",
};

/**
 * Membuat service role client yang bisa bypass RLS.
 * Mirip dengan getServiceClient() di adminServer.ts.
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createServiceClient(url, key);
}

/**
 * Mengambil profil user biasa dari tabel `profiles` menggunakan service client
 * (bypass RLS) — pola yang sama seperti getAdminProfile() untuk admin.
 *
 * Fallback: user_metadata dari Supabase Auth session.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return null;

  const authUser = data.user;
  const userId = authUser.id;
  const email = authUser.email || "";

  // Nilai awal dari user_metadata (fallback jika DB tidak tersedia)
  let username =
    authUser.user_metadata?.username ||
    authUser.user_metadata?.name ||
    email.split("@")[0] ||
    DEFAULT_USER_PROFILE.username;
  let avatarUrl: string = authUser.user_metadata?.avatar_url || "";

  // Ambil dari tabel profiles menggunakan service client (bypass RLS)
  // — sama persis dengan cara admin mengambil dari admin_settings
  const db = getServiceClient();
  if (db) {
    try {
      const { data: profileRow } = await db
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (profileRow) {
        if (profileRow.avatar_url) avatarUrl = profileRow.avatar_url;
        if (profileRow.username) username = profileRow.username;
      }
    } catch {
      // Fallback ke user_metadata jika query gagal
    }
  }

  return {
    id: userId,
    username,
    email,
    avatar_url: avatarUrl,
  };
}
