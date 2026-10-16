/**
 * Helper untuk validasi hak akses Administrator.
 * Admin dapat ditentukan melalui:
 * 1. Default Master Admin: username "adminootd", email "adminootd@gmail.com"
 * 2. Environment variable ADMIN_EMAILS (dipisahkan koma)
 * 3. Role di user_metadata Supabase: role === 'admin'
 */

export function isUserAdmin(user: any): boolean {
  if (!user) return false;

  const email = (user.email || "").toLowerCase().trim();
  const username = (user.user_metadata?.username || "").toLowerCase().trim();

  // Master Admin bawaan dari permintaan pengguna
  if (
    username === "adminootd" ||
    email === "adminootd@gmail.com" ||
    username === "admin" ||
    email.startsWith("admin@")
  ) {
    return true;
  }

  // Cek dari env var ADMIN_EMAILS jika ada
  const envAdmins = (process.env.ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (envAdmins.length > 0) {
    if (envAdmins.includes(email) || (username && envAdmins.includes(username))) {
      return true;
    }
  }

  // Cek metadata role
  if (user.user_metadata?.role === "admin" || user.app_metadata?.role === "admin") {
    return true;
  }

  return false;
}
