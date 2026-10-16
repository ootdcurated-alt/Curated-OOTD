export interface StyleTip {
  title: string;
  advice: string;
  colorPalette: { name: string; hex: string }[];
  avoidColors?: string[];
  recommendedStyles: string[];
  examplePieces: { name: string; category: string; reason: string }[];
}

export interface RecommendationResponse {
  skinToneKey: string;
  skinToneTitle: string;
  summary: string;
  undertoneAnalysis: string;
  tips: StyleTip;
  quickPrompts: string[];
}

export const SKIN_TONE_DATA: Record<string, RecommendationResponse> = {
  cokelat: {
    skinToneKey: "cokelat",
    skinToneTitle: "Kulit Cokelat / Sawo Matang (Warm & Tan Undertone)",
    summary:
      "Kulit sawo matang atau eksotis memiliki nuansa warm undertone alami yang memancarkan pesona tropis. Warna hangat, kontras seimbang, dan earth tone akan membuat kulit Anda terlihat bersinar (glowing), sehat, dan berkarakter kuat.",
    undertoneAnalysis:
      "Karakteristik sawo matang Indonesia umumnya condong ke warm hingga neutral-warm dengan kilau keemasan. Menghindari warna yang terlalu kusam (dull greyish) dan memilih warna kaya pigmen seperti Terracotta, Mustard, Olive, serta Broken White adalah kunci utama.",
    tips: {
      title: "Formula Warna Terbaik untuk Kulit Cokelat / Sawo Matang",
      advice:
        "Gunakan aturan kontras kontemporer: padukan warna terang bernuansa hangat (seperti Broken White, Warm Cream) dengan warna kontras dalam (Deep Navy, Forest Green, Terracotta, Rich Chocolate). Jangan gunakan warna abu-abu pucat atau neon pudar tanpa layering.",
      colorPalette: [
        { name: "Terracotta Warm", hex: "#C86D51" },
        { name: "Mustard Gold", hex: "#E5A93C" },
        { name: "Deep Olive / Army", hex: "#556B2F" },
        { name: "Broken White / Ivory", hex: "#F5F2EB" },
        { name: "Rich Chocolate Brown", hex: "#4B2810" },
        { name: "Deep Navy Blue", hex: "#1C2841" },
        { name: "Sage Green Light", hex: "#9CAF88" },
      ],
      avoidColors: [
        "Abu-abu pudar dingin (Cool Slate / Heather Grey tanpa aksen)",
        "Kuning neon pucat (membuat wajah tampak kusam)",
        "Magenta pucat dingin / Lilac pudar berlebih",
      ],
      recommendedStyles: ["Earth Tone Minimalist", "Urban Streetwear Baggy", "Smart Casual Warm Linen", "Vintage Retro 90s"],
      examplePieces: [
        {
          name: "Cuban Collar Sage Green Linen Shirt",
          category: "Atasan",
          reason: "Warna sage memberikan efek segar kontras tanpa menenggelamkan kehangatan kulit.",
        },
        {
          name: "Broken White Boxy Heavyweight T-Shirt",
          category: "Inner / Atasan",
          reason: "Broken white jauh lebih ramah dibanding pure optical white dingin yang kadang terlalu kontras kasar.",
        },
        {
          name: "Pleated Wide Leg Pants Deep Olive / Terracotta",
          category: "Bawahan",
          reason: "Warna tanah menciptakan ilusi proporsi mewah dan elegan pada pria maupun wanita sawo matang.",
        },
        {
          name: "Dark Brown Polished Loafers / Clean Gumsole Sneakers",
          category: "Sepatu",
          reason: "Aksen sol cokelat karet atau kulit cokelat mengikat keseluruhan look natural.",
        },
      ],
    },
    quickPrompts: [
      "Warna apa yang cocok untuk kulit sawo matang?",
      "Outfit apa yang cocok untuk kulit cokelat?",
      "Rekomendasi warna baju cowok sawo matang",
      "Apakah warna sage green cocok untuk kulit cokelat?",
      "OOTD streetwear untuk kulit sawo matang",
    ],
  },

  kuning_langsat: {
    skinToneKey: "kuning_langsat",
    skinToneTitle: "Kulit Kuning Langsat (Neutral Warm)",
    summary:
      "Kulit kuning langsat sangat fleksibel. Warna-warna pastel hangat, coral, emerald green, dan navy tua akan membuat kompleksi wajah terlihat cerah dan segar.",
    undertoneAnalysis:
      "Memiliki perpaduan pigmen kuning cerah alami. Sangat cocok dengan palet permata (jewel tones) dan warna alam lembut.",
    tips: {
      title: "Panduan Gaya Kulit Kuning Langsat",
      advice:
        "Padukan atasan warna cerah hangat seperti Peach, Coral, atau Sky Blue dengan celana berkarakter seperti dark denim atau khaki.",
      colorPalette: [
        { name: "Coral Peach", hex: "#F88379" },
        { name: "Emerald Green", hex: "#1B4D3E" },
        { name: "Warm Khaki", hex: "#C3B091" },
        { name: "Classic Navy", hex: "#000080" },
        { name: "Sky Blue", hex: "#87CEEB" },
      ],
      avoidColors: ["Kuning neon menyilaukan", "Mustard kusam"],
      recommendedStyles: ["Korean Minimalist", "Smart Casual Blazer", "Casual Weekend Chic"],
      examplePieces: [
        {
          name: "Linen Shirt Sky Blue",
          category: "Atasan",
          reason: "Memberikan kilau cerah dan kontras sejuk yang proporsional.",
        },
        {
          name: "Chino Pants Warm Khaki",
          category: "Bawahan",
          reason: "Netral serbaguna untuk aktivitas formal maupun kasual.",
        },
      ],
    },
    quickPrompts: [
      "Warna baju untuk kulit kuning langsat",
      "Gaya outfit cowok kuning langsat",
      "Apakah warna hitam cocok untuk kulit kuning langsat?",
    ],
  },

  gelap: {
    skinToneKey: "gelap",
    skinToneTitle: "Kulit Gelap Eksotis / Deep Dark Skin Tone",
    summary:
      "Kulit deep dark memiliki keunggulan spektakuler: mampu mengenakan warna-warna kontras tinggi, bold jewel tones, dan monokrom putih bersih dengan sangat stand out!",
    undertoneAnalysis:
      "Kontras tinggi adalah sahabat terbaik Anda. Pure White, Cobalt Blue, Bold Gold, Burgundy, dan Emerald menciptakan visual yang memukau dan berkelas tinggi.",
    tips: {
      title: "Eksplorasi Kontras Tinggi dan Warna Berani",
      advice:
        "Jangan ragu memakai Pure Optical White, Merah Maroon / Burgundy pekat, atau Kuning Emas. Kenakan aksesori emas berkilau untuk sentuhan luxury maksimal.",
      colorPalette: [
        { name: "Pure Bright White", hex: "#FFFFFF" },
        { name: "Cobalt Royal Blue", hex: "#0047AB" },
        { name: "Deep Burgundy", hex: "#800020" },
        { name: "Rich Gold", hex: "#DAA520" },
        { name: "Emerald Jewel", hex: "#046307" },
      ],
      avoidColors: ["Cokelat kusam yang sama persis dengan warna kulit tanpa pembeda kontras"],
      recommendedStyles: ["High-Street Fashion", "Old Money Monokrom", "Edgy Modern Streetwear"],
      examplePieces: [
        {
          name: "Pure White Oversized Shirt / Tee",
          category: "Atasan",
          reason: "Kontras bersih paling ikonik yang membuat aura wajah langsung menyala.",
        },
        {
          name: "Burgundy Oversized Jacket",
          category: "Outer",
          reason: "Warna mewah berkarakter yang sangat flattering untuk deep skin tone.",
        },
      ],
    },
    quickPrompts: [
      "Warna baju untuk kulit hitam / gelap",
      "OOTD kontras tinggi untuk deep skin",
    ],
  },

  terang: {
    skinToneKey: "terang",
    skinToneTitle: "Kulit Putih / Cerah (Fair / Cool Undertone)",
    summary:
      "Kulit cerah cenderung memiliki undertone sejuk atau netral. Pilihan warna pastel elegan, navy, forest green, dan earthy charcoal akan mencegah tampilan terlihat pucat.",
    undertoneAnalysis:
      "Perlu warna dengan saturasi medium hingga tinggi agar tidak tampak 'washed out' (pucat). Hindari mengenakan full outfit warna beige nude tanpa layering kontras.",
    tips: {
      title: "Keseimbangan Kontras untuk Kulit Cerah",
      advice:
        "Gunakan pakaian bernada dalam seperti Navy, Maroon, Bottle Green, atau pastel sejuk seperti Lavender dan Mint.",
      colorPalette: [
        { name: "Deep Navy", hex: "#1A2A44" },
        { name: "Forest Green", hex: "#228B22" },
        { name: "Soft Lavender", hex: "#E6E6FA" },
        { name: "Wine Red", hex: "#722F37" },
        { name: "Charcoal Grey", hex: "#36454F" },
      ],
      avoidColors: ["Beige nude pucat tanpa kontras", "Putih pucat total tanpa aksesoris"],
      recommendedStyles: ["Minimalist Smart Casual", "Preppy Look", "Monochrome Streetwear"],
      examplePieces: [
        {
          name: "Navy Blue Relaxed Blazer",
          category: "Outer",
          reason: "Menonjolkan garis wajah dengan tegas dan tidak monoton.",
        },
      ],
    },
    quickPrompts: [
      "Warna baju untuk kulit putih terang",
      "Kombinasi warna agar tidak terlihat pucat",
    ],
  },
};

export function getConsultationResponse(query: string): RecommendationResponse {
  const normalized = query.toLowerCase();

  if (
    normalized.includes("cokelat") ||
    normalized.includes("coklat") ||
    normalized.includes("sawo matang") ||
    normalized.includes("tan") ||
    normalized.includes("gelap hangat") ||
    normalized.includes("kulit sawo")
  ) {
    return SKIN_TONE_DATA.cokelat;
  }

  if (
    normalized.includes("kuning") ||
    normalized.includes("langsat") ||
    normalized.includes("kuning langsat")
  ) {
    return SKIN_TONE_DATA.kuning_langsat;
  }

  if (
    normalized.includes("gelap") ||
    normalized.includes("hitam") ||
    normalized.includes("deep") ||
    normalized.includes("dark")
  ) {
    return SKIN_TONE_DATA.gelap;
  }

  if (
    normalized.includes("putih") ||
    normalized.includes("cerah") ||
    normalized.includes("terang") ||
    normalized.includes("fair")
  ) {
    return SKIN_TONE_DATA.terang;
  }

  // Default default: sawo matang / cokelat (pertanyaan utama user)
  return SKIN_TONE_DATA.cokelat;
}
