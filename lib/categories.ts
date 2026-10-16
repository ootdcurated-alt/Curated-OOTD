export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-all", name: "Semua Koleksi", slug: "all", description: "Semua kurasi outfit pilihan" },
  { id: "cat-streetwear", name: "Streetwear", slug: "streetwear", description: "Oversized silhouettes, cargo pants, boxy hoodies, dan urban aesthetics" },
  { id: "cat-kasual", name: "Casual Essentials", slug: "kasual", description: "Koleksi harian santai, nyaman, dan versatile untuk berbagai aktivitas" },
  { id: "cat-smart-casual", name: "Smart Casual", slug: "smart-casual", description: "Kombinasi tailored blazer, knitwear, chino, dan loafers semi-formal" },
  { id: "cat-minimalis", name: "Minimalist & Earth Tone", slug: "minimalis", description: "Potongan clean, palet netral (beige, sand, olive), tanpa grafis berlebih" },
  { id: "cat-vintage", name: "Vintage & Retro", slug: "vintage", description: "Nuansa klasik 90-an, leather jacket, washed denim, dan aksen nostalgia" },
  { id: "cat-formal", name: "Formal & Tailored", slug: "formal", description: "Setelan jas berstruktur, gaun pesta elegan, dan pakaian acara resmi" },
  { id: "cat-athleisure", name: "Athleisure & Sporty", slug: "sporty", description: "Kenyamanan busana olahraga yang dipadukan dengan gaya street modern" },
];

const STORAGE_KEY = "curated_ootd_custom_categories";

export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") {
    return DEFAULT_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Pastikan data yang tersimpan tidak memiliki emoji atau format lama jika user pernah menyimpan
      const cleaned = parsed.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        created_at: item.created_at,
      }));
      return cleaned;
    }
  } catch (err) {
    console.error("Failed to read categories from localStorage", err);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event("categories_updated"));
  } catch (err) {
    console.error("Failed to save categories to localStorage", err);
  }
}

export function addCategory(name: string, description?: string): Category {
  const categories = getStoredCategories();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    slug: slug || `category-${Date.now()}`,
    description: description?.trim() || "",
    created_at: new Date().toISOString(),
  };

  const updated = [...categories, newCat];
  saveCategories(updated);
  return newCat;
}

export function deleteCategory(id: string): void {
  const categories = getStoredCategories();
  const updated = categories.filter((c) => c.id !== id);
  saveCategories(updated);
}
