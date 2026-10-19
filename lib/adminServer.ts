import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isUserAdmin } from "@/lib/admin";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_VALUE = "adminootd_authenticated";

export interface AdminContext {
  isAdmin: boolean;
  /** ID user Supabase bila admin login lewat akun Supabase (bukan cookie panel). */
  userId: string | null;
  /** Identitas admin untuk dicatat pada kolom reviewed_by. */
  label: string;
}

/**
 * Memvalidasi hak akses admin pada route handler.
 * Dua jalur yang diterima: cookie sesi panel admin, atau akun Supabase
 * yang terdeteksi sebagai admin melalui lib/admin.isUserAdmin.
 */
export async function getAdminContext(): Promise<AdminContext> {
  const cookieStore = await cookies();
  const hasAdminCookie =
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims: any = data?.claims;

  const email = claims?.email || (hasAdminCookie ? "adminootd@gmail.com" : "");
  const username = claims?.user_metadata?.username || claims?.user_metadata?.name;

  return {
    isAdmin: hasAdminCookie || isUserAdmin(claims),
    userId: (claims?.sub as string) || null,
    label: String(username || email || "admin"),
  };
}

/**
 * Klien service role untuk operasi admin (melewati RLS).
 * Semua pemanggilnya tetap wajib sudah divalidasi lewat getAdminContext().
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createServiceClient(url, key);
}

export type AdminProfile = {
  username: string;
  email: string;
  avatar_url: string;
};

const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  username: "adminootd",
  email: "adminootd@gmail.com",
  avatar_url: "",
};

/** Profil panel admin (DB admin_settings, fallback cookie). */
export async function getAdminProfile(): Promise<AdminProfile> {
  const db = getServiceClient();
  if (db) {
    try {
      const { data } = await db
        .from("admin_settings")
        .select("username, email, avatar_url")
        .eq("id", 1)
        .single();
      if (data) {
        return {
          username: data.username || DEFAULT_ADMIN_PROFILE.username,
          email: data.email || DEFAULT_ADMIN_PROFILE.email,
          avatar_url: data.avatar_url || "",
        };
      }
    } catch {
      // fallback ke cookie
    }
  }

  const cookieStore = await cookies();
  const profileCookie = cookieStore.get("admin_profile")?.value;
  if (profileCookie) {
    try {
      const parsed = JSON.parse(profileCookie) as Partial<AdminProfile>;
      return {
        username: parsed.username || DEFAULT_ADMIN_PROFILE.username,
        email: parsed.email || DEFAULT_ADMIN_PROFILE.email,
        avatar_url: parsed.avatar_url || "",
      };
    } catch {
      // ignore
    }
  }

  return { ...DEFAULT_ADMIN_PROFILE };
}
