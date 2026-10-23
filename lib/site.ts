/**
 * Base URL situs untuk metadata, sitemap.xml, dan robots.txt.
 * Urutan prioritas:
 * 1. NEXT_PUBLIC_SITE_URL (isi manual, mis. domain kustom)
 * 2. URL (diisi otomatis oleh Netlify saat build)
 * 3. DEPLOY_PRIME_URL (URL preview Netlify)
 * 4. http://localhost:3000 (pengembangan lokal)
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "https://mycuratedootd.netlify.app";

  return raw.replace(/\/+$/, "");
}
