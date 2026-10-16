import { NextRequest, NextResponse } from "next/server";
import {
  getConsultationResponse,
  SKIN_TONE_DATA,
  RecommendationResponse,
} from "@/lib/skinToneAdvisor";

// Model Grok yang digunakan — grok-3-mini hemat token & gratis di free tier
const GROK_MODEL = "grok-3-mini";

export async function POST(req: NextRequest) {
  try {
    const { question, skinTone } = await req.json();

    // Shortcut: jika request langsung berdasarkan skin tone key
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

    const fallbackRecommendation = getConsultationResponse(question);
    const xaiApiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

    // Jika API Key belum diisi, kembalikan fallback lokal
    if (!xaiApiKey) {
      return NextResponse.json({
        success: true,
        data: fallbackRecommendation,
        source: "local_curator",
        note: "Tambahkan XAI_API_KEY di .env.local untuk mengaktifkan Grok AI.",
      });
    }

    const systemPrompt = `Kamu adalah Fashion Color & Styling Consultant AI untuk Curated OOTD, platform fashion Indonesia.
Tugasmu menganalisis pertanyaan seputar rekomendasi warna pakaian berdasarkan warna kulit (sawo matang/cokelat, kuning langsat, terang/putih, gelap/deep), potongan outfit, dan gaya busana.

Jawab HANYA dengan JSON valid, tanpa markdown, tanpa backtick, tanpa teks di luar JSON. Gunakan struktur berikut persis:
{
  "skinToneKey": "cokelat" | "kuning_langsat" | "gelap" | "terang" | "custom",
  "skinToneTitle": "judul rekomendasi singkat",
  "summary": "penjelasan 2-3 kalimat tentang karakteristik dan rekomendasi",
  "undertoneAnalysis": "warm / cool / neutral",
  "tips": {
    "title": "Formula Gaya",
    "advice": "saran paduan outfit yang spesifik",
    "colorPalette": [
      {"name": "Nama Warna", "hex": "#XXXXXX"},
      {"name": "Nama Warna", "hex": "#XXXXXX"},
      {"name": "Nama Warna", "hex": "#XXXXXX"},
      {"name": "Nama Warna", "hex": "#XXXXXX"},
      {"name": "Nama Warna", "hex": "#XXXXXX"},
      {"name": "Nama Warna", "hex": "#XXXXXX"},
      {"name": "Nama Warna", "hex": "#XXXXXX"}
    ],
    "avoidColors": ["warna yang perlu dihindari 1", "warna yang perlu dihindari 2"],
    "recommendedStyles": ["Style1", "Style2", "Style3"],
    "examplePieces": [
      {"name": "nama produk busana", "category": "Atasan", "reason": "alasan pemilihan"},
      {"name": "nama produk busana", "category": "Bawahan", "reason": "alasan pemilihan"},
      {"name": "nama produk busana", "category": "Alas Kaki", "reason": "alasan pemilihan"},
      {"name": "nama aksesoris", "category": "Aksesoris", "reason": "alasan pemilihan"}
    ]
  },
  "quickPrompts": [
    "pertanyaan lanjutan relevan 1",
    "pertanyaan lanjutan relevan 2",
    "pertanyaan lanjutan relevan 3"
  ]
}`;

    try {
      const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${xaiApiKey}`,
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question.trim() },
          ],
          temperature: 0.4,
          max_tokens: 1500,
        }),
        // Timeout 15 detik
        signal: AbortSignal.timeout(15000),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.warn(`Grok API error ${aiResponse.status}:`, errText);
        return NextResponse.json({
          success: true,
          data: fallbackRecommendation,
          source: "fallback_api_error",
        });
      }

      const grokData = await aiResponse.json();
      const rawContent: string = grokData.choices?.[0]?.message?.content || "";

      if (!rawContent) {
        return NextResponse.json({
          success: true,
          data: fallbackRecommendation,
          source: "fallback_empty_response",
        });
      }

      // Bersihkan kemungkinan markdown wrapping dari output
      const cleanedJson = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed: RecommendationResponse = JSON.parse(cleanedJson);

      // Validasi struktur minimal sebelum dikirim
      if (!parsed.skinToneTitle || !parsed.tips?.colorPalette) {
        throw new Error("Struktur respons Grok tidak valid");
      }

      return NextResponse.json({
        success: true,
        data: parsed,
        source: "grok_ai",
      });
    } catch (grokErr: any) {
      console.error("Grok processing failed:", grokErr?.message || grokErr);
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
