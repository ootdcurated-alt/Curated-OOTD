import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site";

/**
 * Sitemap dinamis: halaman statis + seluruh halaman detail outfit publik.
 * Dibuat saat build, jadi outfit yang dihapus tidak akan ikut terdaftar.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/creator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let outfitRoutes: MetadataRoute.Sitemap = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("outfits")
        .select("id, updated_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      outfitRoutes = (data ?? []).map((outfit) => ({
        url: `${baseUrl}/outfit/${outfit.id}`,
        lastModified: outfit.updated_at ? new Date(outfit.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    } catch {
      // Jika pengambilan data gagal, sitemap tetap berisi halaman statis.
    }
  }

  return [...staticRoutes, ...outfitRoutes];
}
