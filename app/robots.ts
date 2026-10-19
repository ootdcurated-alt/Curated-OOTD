import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Halaman privat / area admin tidak boleh diindeks.
      disallow: ["/admin", "/admin/", "/api/", "/auth/", "/protected"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
