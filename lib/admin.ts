/**
 * Admin ditentukan murni dari Supabase:
 * - app_metadata.role === 'admin'  (di-set via Supabase Dashboard atau service role)
 * - user_metadata.role === 'admin' (bisa di-set via Raw JSON di Auth > Users)
 * - ADMIN_EMAILS env var sebagai fallback darurat
 */
export function isUserAdmin(user: any): boolean {
  if (!user) return false;

  // Cek role dari app_metadata (paling aman, hanya bisa diubah via service role)
  if (user.app_metadata?.role === "admin") return true;

  // Cek role dari user_metadata
  if (user.user_metadata?.role === "admin") return true;

  // Fallback: ADMIN_EMAILS env var (untuk emergency access)
  const envAdmins = (process.env.ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (envAdmins.length > 0) {
    const email = (user.email || "").toLowerCase().trim();
    if (envAdmins.includes(email)) return true;
  }

  return false;
}
