export interface OutfitCreationItem {
  id: string;
  category: "top" | "bottom" | "outer" | "shoes" | "accessory";
  name: string;
  brand?: string;
  price?: number;
  imageUrl: string;
  purchaseUrl: string;
  colorName?: string;
  hexColor?: string;
  // Metadata filter untuk mencocokkan outfit dengan profil pengguna
  suitableGender?: ("pria" | "wanita")[];
  suitableBodyTypes?: ("berisi" | "kurus" | "standar" | "atletis")[];
  suitableSkinTones?: string[];
  styles?: string[]; // e.g. "streetwear", "kasual", "smart-casual", "sporty", "vintage", "formal", "minimalis"
}

export interface UserCustomOutfit {
  id: string;
  title: string;
  description: string;
  skinToneRecommendation?: string;
  category: string; // e.g. "streetwear", "kasual", "smart-casual"
  bodyType?: "berisi" | "kurus" | "standar" | "atletis";
  gender?: "pria" | "wanita";
  weight?: number; // kg
  height?: number; // cm
  modelImageUrl?: string;
  tags: string[];
  items: OutfitCreationItem[];
  canvasBgColor?: string;
  createdAt: string;
  authorName?: string;
  customColors?: {
    top?: string;
    bottom?: string;
    outer?: string;
    shoes?: string;
    accessory?: string;
  };
}

export const PRESET_WARDROBE_ITEMS: OutfitCreationItem[] = [];

const USER_CUSTOM_OUTFITS_KEY = "curated_ootd_user_creations";

export function getUserCreatedOutfits(): UserCustomOutfit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_CUSTOM_OUTFITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read user outfits", err);
    return [];
  }
}

export function saveUserCreatedOutfit(outfit: Omit<UserCustomOutfit, "id" | "createdAt">): UserCustomOutfit {
  const current = getUserCreatedOutfits();
  const created: UserCustomOutfit = {
    ...outfit,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [created, ...current];
  try {
    localStorage.setItem(USER_CUSTOM_OUTFITS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("user_outfits_updated"));
  } catch (err) {
    console.error("Failed to save custom outfit", err);
  }
  return created;
}

export function deleteUserCreatedOutfit(id: string): void {
  const current = getUserCreatedOutfits();
  const updated = current.filter((o) => o.id !== id);
  try {
    localStorage.setItem(USER_CUSTOM_OUTFITS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("user_outfits_updated"));
  } catch (err) {
    console.error("Failed to delete custom outfit", err);
  }
}
