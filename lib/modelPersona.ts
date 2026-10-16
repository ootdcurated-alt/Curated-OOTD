export interface ModelPersona {
  id: string;
  name: string;
  gender: "pria" | "wanita";
  bodyType: "berisi" | "kurus" | "standar" | "atletis";
  weight: number; // kg
  height: number; // cm
  skinTone: "cokelat" | "kuning_langsat" | "gelap" | "terang";
  imageUrl: string;
  description: string;
}

export const MODEL_PERSONAS: ModelPersona[] = [
  // PRIA
  {
    id: "m-berisi-cokelat",
    name: "Arya (Berisi / Plus-Size)",
    gender: "pria",
    bodyType: "berisi",
    weight: 85,
    height: 173,
    skinTone: "cokelat",
    imageUrl: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=700&q=80",
    description: "Postur berisi & tegap, proporsional untuk siluet oversized dan tailored layering.",
  },
  {
    id: "m-kurus-cokelat",
    name: "Rian (Kurus / Slim Fit)",
    gender: "pria",
    bodyType: "kurus",
    weight: 56,
    height: 175,
    skinTone: "cokelat",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
    description: "Postur ramping / skinny, ideal untuk boxy cutting, dropped shoulder, dan wide-leg pants.",
  },
  {
    id: "m-standar-kuning",
    name: "Dimas (Standar / Regular)",
    gender: "pria",
    bodyType: "standar",
    weight: 68,
    height: 172,
    skinTone: "kuning_langsat",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80",
    description: "Postur proporsional serbaguna untuk gaya smart casual, knitwear, dan kasual harian.",
  },
  {
    id: "m-atletis-gelap",
    name: "Malik (Atletis / V-Taper)",
    gender: "pria",
    bodyType: "atletis",
    weight: 78,
    height: 180,
    skinTone: "gelap",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
    description: "Bahu lebar dan postur atletis, sangat cocok untuk streetwear tegas dan utility jackets.",
  },
  {
    id: "m-kurus-terang",
    name: "Leo (Kurus / Clean Cut)",
    gender: "pria",
    bodyType: "kurus",
    weight: 58,
    height: 178,
    skinTone: "terang",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
    description: "Postur tinggi ramping, cocok untuk minimalist aesthetic, trench coat, dan kemeja santai.",
  },

  // WANITA
  {
    id: "w-berisi-cokelat",
    name: "Tara (Berisi / Curvy)",
    gender: "wanita",
    bodyType: "berisi",
    weight: 74,
    height: 162,
    skinTone: "cokelat",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80",
    description: "Postur curvy berisi memikat, sangat anggun dengan high-waisted pants dan loose blazer.",
  },
  {
    id: "w-kurus-kuning",
    name: "Nisa (Kurus / Petite Slim)",
    gender: "wanita",
    bodyType: "kurus",
    weight: 45,
    height: 158,
    skinTone: "kuning_langsat",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
    description: "Postur petite ramping, terlihat jenjang dengan cropped tops dan celana high-waist.",
  },
  {
    id: "w-standar-cokelat",
    name: "Maya (Standar / Balanced)",
    gender: "wanita",
    bodyType: "standar",
    weight: 55,
    height: 165,
    skinTone: "cokelat",
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=700&q=80",
    description: "Proporsi seimbang untuk paduan dress elegan, linen wear, dan smart office style.",
  },
  {
    id: "w-berisi-terang",
    name: "Clara (Berisi / Mid-Size)",
    gender: "wanita",
    bodyType: "berisi",
    weight: 70,
    height: 164,
    skinTone: "terang",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80",
    description: "Postur mid-size berisi dengan proporsi menarik untuk outerwear drapey dan dress flowing.",
  },
];

export function findMatchingModel(
  gender: "pria" | "wanita",
  bodyType: "berisi" | "kurus" | "standar" | "atletis",
  skinTone: string
): ModelPersona {
  const exact = MODEL_PERSONAS.find(
    (m) =>
      m.gender === gender &&
      m.bodyType === bodyType &&
      (m.skinTone === skinTone || skinTone === "semua")
  );
  if (exact) return exact;

  const matchBody = MODEL_PERSONAS.find(
    (m) => m.gender === gender && m.bodyType === bodyType
  );
  if (matchBody) return matchBody;

  const matchGender = MODEL_PERSONAS.find((m) => m.gender === gender);
  return matchGender || MODEL_PERSONAS[0];
}
