import type { OutfitItem } from "@/components/OutfitCard";

/** Normalisasi baris outfit_items dari Supabase (angka bisa string/null). */
export function normalizeOutfitItems(raw: unknown): OutfitItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    const xRaw = row.x;
    const yRaw = row.y;
    const priceRaw = row.price;

    return {
      id: String(row.id ?? ""),
      name: String(row.name ?? "Produk"),
      brand: row.brand ? String(row.brand) : undefined,
      affiliate_url: String(row.affiliate_url ?? ""),
      price:
        priceRaw != null && priceRaw !== "" && !Number.isNaN(Number(priceRaw))
          ? Number(priceRaw)
          : undefined,
      x:
        xRaw != null && xRaw !== "" && !Number.isNaN(Number(xRaw))
          ? Number(xRaw)
          : undefined,
      y:
        yRaw != null && yRaw !== "" && !Number.isNaN(Number(yRaw))
          ? Number(yRaw)
          : undefined,
    };
  });
}
