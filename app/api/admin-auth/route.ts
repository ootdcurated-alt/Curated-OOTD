import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Service role client — bisa akses admin_settings tanpa RLS
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Ambil kredensial admin dari Supabase, fallback ke default
async function getAdminCredentials() {
  const db = getAdminClient();
  if (db) {
    const { data } = await db
      .from("admin_settings")
      .select("username, email, password, avatar_url")
      .eq("id", 1)
      .single();
    if (data) return data;
  }
  return {
    username: "adminootd",
    email: "adminootd@gmail.com",
    password: "admin1027",
    avatar_url: "",
  };
}

// ─── GET /api/admin-auth ─────────────────────────────────────
export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  if (!isAdmin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const creds = await getAdminCredentials();

  // Gabungkan dengan cookie cache (avatar bisa di-override cookie sementara)
  const profileCookie = cookieStore.get("admin_profile")?.value;
  let avatarFromCookie = "";
  if (profileCookie) {
    try { avatarFromCookie = JSON.parse(profileCookie)?.avatar_url ?? ""; } catch {}
  }

  return NextResponse.json({
    authenticated: true,
    profile: {
      username: creds.username,
      email: creds.email,
      avatar_url: avatarFromCookie || creds.avatar_url,
    },
  });
}

// ─── POST /api/admin-auth ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, avatar_url, new_password, new_username, new_email } = body;
    const cookieStore = await cookies();

    // ── LOGIN ────────────────────────────────────────────────
    if (action === "login") {
      const cleanUser = (username || "").trim().toLowerCase();
      const creds = await getAdminCredentials();

      const isValidAdmin =
        (cleanUser === creds.username.toLowerCase() ||
          cleanUser === creds.email.toLowerCase()) &&
        password === creds.password;

      if (isValidAdmin) {
        cookieStore.set("admin_session", "adminootd_authenticated", {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });

        // Simpan cache profil minimal ke cookie (hindari avatar_url jika terlalu besar)
        cookieStore.set(
          "admin_profile",
          JSON.stringify({
            username: creds.username,
            email: creds.email,
          }),
          { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" }
        );

        return NextResponse.json({ success: true, user: { username: creds.username, email: creds.email, role: "admin" } });
      }

      return NextResponse.json(
        { success: false, message: "Username/email atau kata sandi salah." },
        { status: 401 }
      );
    }

    // ── LOGOUT ───────────────────────────────────────────────
    if (action === "logout") {
      cookieStore.delete("admin_session");
      cookieStore.delete("admin_profile");
      return NextResponse.json({ success: true });
    }

    // ── UPDATE PROFILE ───────────────────────────────────────
    if (action === "update_profile") {
      const isAdminSession = cookieStore.get("admin_session")?.value === "adminootd_authenticated";
      if (!isAdminSession) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const db = getAdminClient();
      const updatePayload: Record<string, string> = {};

      if (typeof new_username === "string" && new_username.trim()) {
        updatePayload.username = new_username.trim();
      }
      if (typeof new_email === "string" && new_email.trim()) {
        updatePayload.email = new_email.trim();
      }
      if (typeof avatar_url === "string") {
        updatePayload.avatar_url = avatar_url;
      }
      if (typeof new_password === "string" && new_password.trim()) {
        updatePayload.password = new_password.trim();
      }

      // Simpan ke Supabase jika tersedia
      if (db && Object.keys(updatePayload).length > 1) {
        const { error } = await db
          .from("admin_settings")
          .update(updatePayload)
          .eq("id", 1);

        if (error) {
          console.error("Supabase admin_settings update error:", error.message);
          // Lanjut fallback ke cookie saja
        }
      }

      // Update cookie cache agar langsung terasa tanpa reload
      const existing = cookieStore.get("admin_profile")?.value;
      let profileData: Record<string, string> = { username: "adminootd", email: "adminootd@gmail.com", avatar_url: "" };
      if (existing) {
        try { profileData = JSON.parse(existing); } catch {}
      }
      if (updatePayload.username) profileData.username = updatePayload.username;
      if (updatePayload.email) profileData.email = updatePayload.email;
      // Jangan simpan avatar_url di cookie cache untuk menghindari HTTP 431

      cookieStore.set("admin_profile", JSON.stringify({
        username: profileData.username,
        email: profileData.email,
      }), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });

      return NextResponse.json({ success: true, message: "Profil admin berhasil diperbarui" });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error) {
    console.error("admin-auth error:", error);
    return NextResponse.json({ success: false, message: "Kesalahan server" }, { status: 500 });
  }
}
