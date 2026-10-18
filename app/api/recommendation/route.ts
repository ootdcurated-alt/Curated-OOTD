import { NextRequest, NextResponse } from "next/server";
import {
  getConsultationResponse,
  SKIN_TONE_DATA,
  RecommendationResponse,
} from "@/lib/skinToneAdvisor";

// Model AI yang digunakan (Gunakan Gemini untuk gratis/free tier)
const GEMINI_MODEL = "gemini-1.5-flash";
const GROK_MODEL = "grok-2-1212"; // Fallback model

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
    
    // Gunakan Gemini API Key sebagai prioritas untuk fitur gratis
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const xaiApiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

    // Jika tidak ada API Key sama sekali, kembalikan fallback lokal
    if (!geminiApiKey && !xaiApiKey) {
      return NextResponse.json({
        success: true,
        data: fallbackRecommendation,
        source: "local_curator",
        note: "Tambahkan GEMINI_API_KEY di .env.local untuk mengaktifkan AI Gratis.",
      });
    }

    const systemPrompt = `Kamu adalah Fashion & Styling Consultant AI untuk Curated OOTD, platform fashion Indonesia.
Tugasmu memberikan rekomendasi fashion yang akurat berdasarkan pertanyaan user. Pertanyaan bisa seputar:
1. Warna pakaian berdasarkan warna kulit (sawo matang, kuning langsat, cerah, gelap).
2. Potongan outfit berdasarkan bentuk tubuh atau berat badan.
3. Padu padan gaya busana (streetwear, formal, casual, dll).
4. Tips fashion umum.

Jawab HANYA dengan JSON valid, tanpa markdown, tanpa teks di luar JSON. Gunakan struktur berikut:
{
  "skinToneKey": "cokelat" | "kuning_langsat" | "gelap" | "terang" | "custom",
  "skinToneTitle": "Judul rekomendasi yang menjawab pertanyaan user (misal: Tips Outfit untuk Berat Badan 70kg)",
  "summary": "Jawaban langsung dan penjelasan singkat (2-3 kalimat) yang menjawab inti pertanyaan user.",
  "undertoneAnalysis": "Analisis singkat terkait pertanyaan (misal: analisis siluet untuk berat badan tertentu atau undertone warna).",
  "tips": {
    "title": "Formula Gaya",
    "advice": "Saran spesifik dan praktis untuk menjawab pertanyaan user.",
    "colorPalette": [
      {"name": "Nama Warna 1", "hex": "#XXXXXX"},
      {"name": "Nama Warna 2", "hex": "#XXXXXX"},
      {"name": "Nama Warna 3", "hex": "#XXXXXX"},
      {"name": "Nama Warna 4", "hex": "#XXXXXX"},
      {"name": "Nama Warna 5", "hex": "#XXXXXX"}
    ],
    "avoidColors": ["hal yang perlu dihindari 1", "hal yang perlu dihindari 2"],
    "recommendedStyles": ["Style1", "Style2", "Style3"],
    "examplePieces": [
      {"name": "Produk atasan", "category": "Atasan", "reason": "Alasan kenapa cocok"},
      {"name": "Produk bawahan", "category": "Bawahan", "reason": "Alasan kenapa cocok"}
    ]
  },
  "quickPrompts": [
    "Pertanyaan lanjutan relevan 1",
    "Pertanyaan lanjutan relevan 2",
    "Pertanyaan lanjutan relevan 3"
  ]
}

PENTING: Pastikan "skinToneTitle" dan "summary" benar-benar menjawab pertanyaan user secara spesifik, bukan hanya template warna kulit.`;

    try {
      let rawContent = "";
      let usedSource = "grok_ai";

      if (geminiApiKey) {
        // Gunakan Google Gemini API (Free Tier)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nPertanyaan User: ${question.trim()}` }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1500,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          usedSource = "gemini_ai";
        } else {
          const errText = await geminiRes.text();
          console.error(`Gemini API Error (${geminiRes.status}):`, errText);
        }
      } 
      
      // Fallback ke Grok jika Gemini gagal atau tidak ada
      if (!rawContent && xaiApiKey) {
        const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
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
          signal: AbortSignal.timeout(15000),
        });

        if (grokRes.ok) {
          const grokData = await grokRes.json();
          rawContent = grokData.choices?.[0]?.message?.content || "";
          usedSource = "grok_ai";
        }
      }

      if (!rawContent) {
        return NextResponse.json({
          success: true,
          data: fallbackRecommendation,
          source: "fallback_no_api_response",
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
        source: usedSource,
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
