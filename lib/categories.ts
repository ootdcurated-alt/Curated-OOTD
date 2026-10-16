export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-all",         name: "Semua Koleksi",           slug: "all",          description: "Semua kurasi outfit pilihan" },
  { id: "cat-streetwear",  name: "Streetwear",              slug: "streetwear",   description: "Oversized silhouettes, cargo pants, boxy hoodies, dan urban aesthetics" },
  { id: "cat-kasual",      name: "Casual Essentials",       slug: "kasual",       description: "Koleksi harian santai, nyaman, dan versatile untuk berbagai aktivitas" },
  { id: "cat-smart-casual",name: "Smart Casual",            slug: "smart-casual", description: "Kombinasi tailored blazer, knitwear, chino, dan loafers semi-formal" },
  { id: "cat-minimalis",   name: "Minimalist & Earth Tone", slug: "minimalis",    description: "Potongan clean, palet netral (beige, sand, olive), tanpa grafis berlebih" },
  { id: "cat-vintage",     name: "Vintage & Retro",         slug: "vintage",      description: "Nuansa klasik 90-an, leather jacket, washed denim, dan aksen nostalgia" },
  { id: "cat-formal",      name: "Formal & Tailored",       slug: "formal",       description: "Setelan jas berstruktur, gaun pesta elegan, dan pakaian acara resmi" },
  { id: "cat-sporty",      name: "Athleisure & Sporty",     slug: "sporty",       description: "Kenyamanan busana olahraga yang dipadukan dengan gaya street modern" },
];

const STORAGE_KEY = "curated_ootd_custom_categories";

// ── LocalStorage helpers (fallback saat Supabase belum tersedia) ──────────────

export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event("categories_updated"));
  } catch {
    // ignore
  }
}

/** Sync kategori dari Supabase ke localStorage agar tersedia saat offline */
export function syncCategoriesToLocal(categories: Category[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // ignore
  }
}

// ── localStorage write helpers (tetap dipakai sebagai cache lokal) ───────────

export function addCategoryLocal(name: string, description?: string): Category {
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

  saveCategories([...categories, newCat]);
  return newCat;
}

export function deleteCategoryLocal(id: string): void {
  const categories = getStoredCategories();
  saveCategories(categories.filter((c) => c.id !== id));
}

// Legacy aliases supaya komponen lama tidak break
export const addCategory = addCategoryLocal;
export const deleteCategory = deleteCategoryLocal;
