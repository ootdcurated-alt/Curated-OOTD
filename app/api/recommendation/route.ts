import { NextRequest, NextResponse } from "next/server";
import {
  getConsultationResponse,
  SKIN_TONE_DATA,
  RecommendationResponse,
} from "@/lib/skinToneAdvisor";
import { generateGeminiText } from "@/lib/geminiClient";

const GROK_MODEL = process.env.GROK_MODEL || "grok-2-1212";

function parseRecommendationJson(raw: string): RecommendationResponse {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as RecommendationResponse;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON AI tidak valid");
    return JSON.parse(match[0]) as RecommendationResponse;
  }
}

function isValidRecommendation(data: RecommendationResponse): boolean {
  return Boolean(data.skinToneTitle && data.tips?.colorPalette?.length);
}

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

    const fallbackRecommendation = getConsultationResponse(question);
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    const xaiApiKey = (process.env.XAI_API_KEY || process.env.GROK_API_KEY)?.trim();

    if (!geminiApiKey && !xaiApiKey) {
      return NextResponse.json({
        success: true,
        data: fallbackRecommendation,
        source: "local_curator",
        note: "Tambahkan GEMINI_API_KEY di .env.local lalu restart npm run dev.",
      });
    }

    const systemPrompt = `Kamu Fashion Consultant AI untuk Curated OOTD (Indonesia). Jawab HANYA JSON valid tanpa markdown:
{
  "skinToneKey": "cokelat"|"kuning_langsat"|"gelap"|"terang"|"custom",
  "skinToneTitle": "judul spesifik jawaban",
  "summary": "2-3 kalimat jawaban",
  "undertoneAnalysis": "analisis singkat",
  "tips": {
    "title": "Formula Gaya",
    "advice": "saran praktis",
    "colorPalette": [{"name":"...","hex":"#XXXXXX"} x5],
    "avoidColors": ["..."],
    "recommendedStyles": ["..."],
    "examplePieces": [{"name":"...","category":"Atasan|Bawahan","reason":"..."}]
  },
  "quickPrompts": ["...","...","..."]
}`;

    const fullPrompt = `${systemPrompt}\n\nPertanyaan: ${question.trim()}`;

    if (geminiApiKey) {
      const gemini = await generateGeminiText(
        geminiApiKey,
        fullPrompt,
        process.env.GEMINI_MODEL
      );

      if (gemini?.text) {
        try {
          const parsed = parseRecommendationJson(gemini.text);
          if (isValidRecommendation(parsed)) {
            return NextResponse.json({
              success: true,
              data: parsed,
              source: "gemini_ai",
              model: gemini.model,
            });
          }
        } catch (parseErr: unknown) {
          console.error("Gemini JSON parse error:", parseErr);
        }
      }
    }

    if (xaiApiKey && xaiApiKey.startsWith("xai-")) {
      try {
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
          signal: AbortSignal.timeout(12000),
        });

        if (grokRes.ok) {
          const grokData = await grokRes.json();
          const rawContent = grokData.choices?.[0]?.message?.content || "";
          if (rawContent) {
            const parsed = parseRecommendationJson(rawContent);
            if (isValidRecommendation(parsed)) {
              return NextResponse.json({
                success: true,
                data: parsed,
                source: "grok_ai",
              });
            }
          }
        } else {
          console.error("Grok API Error:", await grokRes.text());
        }
      } catch (grokErr) {
        console.error("Grok request failed:", grokErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: fallbackRecommendation,
      source: "fallback_no_api_response",
      note: "Gemini sibuk atau quota habis — coba lagi beberapa menit. Pastikan GEMINI_API_KEY valid di .env.local.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
