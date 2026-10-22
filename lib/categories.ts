export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-all", name: "Semua Koleksi", slug: "all", description: "Semua kurasi outfit pilihan" },
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
