export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface GenderCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subGenders?: { id: string; name: string; slug: string }[];
}

export const DEFAULT_GENDERS: GenderCategory[] = [
  { id: "gen-all", name: "Semua", slug: "all", description: "Semua outfit untuk semua kalangan" },
  { id: "gen-pria", name: "Pria", slug: "pria", description: "Inspirasi outfit pria dewasa" },
  { id: "gen-wanita", name: "Wanita", slug: "wanita", description: "Inspirasi outfit wanita modern" },
  {
    id: "gen-anak",
    name: "Anak-Anak",
    slug: "anak-anak",
    description: "Inspirasi busana anak laki-laki & perempuan",
    subGenders: [
      { id: "gen-anak-pria", name: "Anak Pria (Laki-laki)", slug: "anak-pria" },
      { id: "gen-anak-wanita", name: "Anak Wanita (Perempuan)", slug: "anak-wanita" },
    ],
  },
];

// Kategori gaya awal: pakaian, makeup, skincare, aksesoris
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-pakaian", name: "Pakaian", slug: "pakaian", description: "Inspirasi koleksi pakaian, baju, celana, dan fashion outfit" },
  { id: "cat-makeup", name: "Makeup", slug: "makeup", description: "Inspirasi riasan, kosmetik, lipstik, dan beauty look" },
  { id: "cat-skincare", name: "Skincare", slug: "skincare", description: "Perawatan kulit harian dan produk skincare pilihan" },
  { id: "cat-aksesoris", name: "Aksesoris", slug: "aksesoris", description: "Aksesoris penunjang gaya seperti tas, kacamata, topi, perhiasan, dan sepatu" },
];

const STORAGE_KEY = "curated_ootd_custom_categories";

// ── LocalStorage helpers (fallback saat Supabase belum tersedia) ──────────────

export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter keluar kategori gender lama yang mungkin tersimpan di cache
      const genderSlugs = new Set(["pria", "wanita", "anak-anak", "anak-pria", "anak-wanita"]);
      const filtered = parsed.filter((c: Category) => !genderSlugs.has(c.slug?.toLowerCase()));
      
      // Pastikan kategori default selalu ada jika belum ada
      const combined = [...filtered];
      for (const def of DEFAULT_CATEGORIES) {
        if (!combined.some((c) => c.slug === def.slug)) {
          combined.push(def);
        }
      }
      return combined;
    }
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

// ── Gender Categories Helpers ────────────────────────────────────────────────
const GENDER_STORAGE_KEY = "curated_ootd_genders";

export function getStoredGenders(): GenderCategory[] {
  if (typeof window === "undefined") return DEFAULT_GENDERS;
  try {
    const raw = localStorage.getItem(GENDER_STORAGE_KEY);
    if (!raw) return DEFAULT_GENDERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const combined = [...parsed];
      for (const def of DEFAULT_GENDERS) {
        if (!combined.some((g) => g.slug === def.slug)) {
          combined.push(def);
        }
      }
      return combined;
    }
  } catch {
    // ignore
  }
  return DEFAULT_GENDERS;
}

export function saveGenders(genders: GenderCategory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GENDER_STORAGE_KEY, JSON.stringify(genders));
    window.dispatchEvent(new Event("genders_updated"));
  } catch {
    // ignore
  }
}

export function addGenderLocal(name: string, description?: string): GenderCategory {
  const genders = getStoredGenders();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const newGender: GenderCategory = {
    id: `gen-${Date.now()}`,
    name: name.trim(),
    slug: slug || `gender-${Date.now()}`,
    description: description?.trim() || "",
  };

  saveGenders([...genders, newGender]);
  return newGender;
}

export function deleteGenderLocal(id: string): void {
  const genders = getStoredGenders();
  saveGenders(genders.filter((g) => g.id !== id));
}

// Legacy aliases supaya komponen lama tidak break
export const addCategory = addCategoryLocal;
export const deleteCategory = deleteCategoryLocal;
