import type { Outfit } from "@/components/OutfitCard";

const STORAGE_KEY = "curated_ootd_wishlist";
export const WISHLIST_UPDATED_EVENT = "wishlist_updated";

export type WishlistOutfit = Pick<
  Outfit,
  "id" | "title" | "image_url" | "description" | "tags"
>;

function readAll(): WishlistOutfit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: WishlistOutfit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT));
}

export function getWishlist(): WishlistOutfit[] {
  return readAll();
}

export function isInWishlist(outfitId: string): boolean {
  return readAll().some((o) => o.id === outfitId);
}

/** Menambah atau menghapus outfit; mengembalikan true jika sekarang ada di favorit. */
export function toggleWishlistEntry(outfit: WishlistOutfit): boolean {
  const list = readAll();
  const idx = list.findIndex((o) => o.id === outfit.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeAll(list);
    return false;
  }
  writeAll([
    {
      id: outfit.id,
      title: outfit.title,
      image_url: outfit.image_url,
      description: outfit.description,
      tags: outfit.tags,
    },
    ...list,
  ]);
  return true;
}

export function removeFromWishlist(outfitId: string) {
  writeAll(readAll().filter((o) => o.id !== outfitId));
}
