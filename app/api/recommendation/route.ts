import { NextRequest, NextResponse } from "next/server";
import { getConsultationResponse, SKIN_TONE_DATA, RecommendationResponse } from "@/lib/skinToneAdvisor";

export async function POST(req: NextRequest) {
  try {
    const { question, skinTone } = await req.json();

    if (skinTone && SKIN_TONE_DATA[skinTone]) {
      return NextResponse.json({
        success: true,
        data: SKIN_TONE_DATA[skinTone],
        source: "preset",
      });
    }

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { success: false, message: "Pertanyaan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Default fallback lokal terlebih dahulu
    const fallbackRecommendation = getConsultationResponse(question);

    const xaiApiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

    // Jika API Key Grok (xAI) belum dikonfigurasi, gunakan engine analitik lokal kami
    if (!xaiApiKey) {
      return NextResponse.json({
        success: true,
        data: fallbackRecommendation,
        source: "local_curator",
        note: "Tambahkan GROK_API_KEY di file .env.local untuk mengaktifkan Grok AI secara live.",
      });
    }

    // Panggil xAI (Grok) API endpoint
    try {
      const systemPrompt = `Anda adalah Fashion Color & Styling Consultant AI profesional untuk Curated OOTD.
Tugas Anda adalah menganalisis pertanyaan seputar rekomendasi warna pakaian, tone kulit (misal kulit sawo matang/cokelat, kuning langsat, putih/terang, deep/gelap), potongan outfit, dan etika berbusana (cowok/cewek).

Kembalikan respon HANYA dalam format JSON valid persis dengan struktur berikut (tanpa markdown backtick jika memungkinkan, atau format JSON bersih):
{
  "skinToneKey": "cokelat" | "kuning_langsat" | "gelap" | "terang" | "custom",
  "skinToneTitle": "Judul rekomendasi singkat profesional",
  "summary": "Penjelasan ringkas 2-3 kalimat mengenai karakteristik warna dan rekomendasi gaya yang tepat sesuai pertanyaan.",
  "undertoneAnalysis": "Analisis undertone singkat (warm/cool/neutral)",
  "tips": {
    "title": "Formula Gaya",
    "advice": "Saran paduan outfit yang spesifik, proporsional, dan stylish",
    "colorPalette": [
      {"name": "Nama Warna 1", "hex": "#HEXCODE"},
      {"name": "Nama Warna 2", "hex": "#HEXCODE"},
      {"name": "Nama Warna 3", "hex": "#HEXCODE"},
      {"name": "Nama Warna 4", "hex": "#HEXCODE"},
      {"name": "Nama Warna 5", "hex": "#HEXCODE"},
      {"name": "Nama Warna 6", "hex": "#HEXCODE"},
      {"name": "Nama Warna 7", "hex": "#HEXCODE"}
    ],
    "avoidColors": [
      "Warna yang perlu dihindari 1",
      "Warna yang perlu dihindari 2"
    ],
    "recommendedStyles": ["NamaStyle1", "NamaStyle2", "NamaStyle3"],
    "examplePieces": [
      {"name": "Nama Produk Busana 1", "category": "Atasan", "reason": "Alasan pemilihan"},
      {"name": "Nama Produk Busana 2", "category": "Bawahan", "reason": "Alasan pemilihan"},
      {"name": "Nama Produk Busana 3", "category": "Alas Kaki", "reason": "Alasan pemilihan"}
    ]
  },
  "quickPrompts": [
    "Contoh pertanyaan lanjutan 1",
    "Contoh pertanyaan lanjutan 2",
    "Contoh pertanyaan lanjutan 3"
  ]
}`;

      const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${xaiApiKey}`,
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          temperature: 0.5,
          max_tokens: 1200,
        }),
      });

      if (!aiResponse.ok) {
        console.warn("xAI Grok response error:", await aiResponse.text());
        return NextResponse.json({
          success: true,
          data: fallbackRecommendation,
          source: "fallback_after_grok_err",
        });
      }

      const grokData = await aiResponse.json();
      const rawContent = grokData.choices?.[0]?.message?.content || "";

      // Bersihkan kemungkinan markdown formatting pada output JSON
      const cleanedJson = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed: RecommendationResponse = JSON.parse(cleanedJson);

      return NextResponse.json({
        success: true,
        data: parsed,
        source: "grok_ai",
      });
    } catch (grokErr) {
      console.error("Grok processing failed, fallback used:", grokErr);
      return NextResponse.json({
        success: true,
        data: fallbackRecommendation,
        source: "fallback",
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
