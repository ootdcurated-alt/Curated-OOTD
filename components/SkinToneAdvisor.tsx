"use client";

import { useState } from "react";
import { RecommendationResponse, SKIN_TONE_DATA, getConsultationResponse } from "@/lib/skinToneAdvisor";
import Link from "next/link";
import { Sparkles, Bot, BookOpen, AlertCircle, Loader2 } from "lucide-react";

interface SkinToneAdvisorProps {
  onApplyPalette?: (paletteColors: string[]) => void;
}

type SourceType = "grok_ai" | "gemini_ai" | "preset" | "fallback" | "fallback_api_error" | "fallback_empty_response" | "fallback_no_api_response" | "local_curator" | null;

export default function SkinToneAdvisor({ onApplyPalette }: SkinToneAdvisorProps) {
  const [query, setQuery] = useState("");
  const [activeSkinKey, setActiveSkinKey] = useState<string>("cokelat");
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [source, setSource] = useState<SourceType>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (customText?: string) => {
    const textToQuery = customText !== undefined ? customText : query;
    if (!textToQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToQuery }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        setSource(json.source || "fallback");
        if (json.data.skinToneKey && json.data.skinToneKey !== "custom") {
          setActiveSkinKey(json.data.skinToneKey);
        }
      } else {
        const fallback = getConsultationResponse(textToQuery);
        setResult(fallback);
        setSource("fallback");
        setActiveSkinKey(fallback.skinToneKey);
      }
    } catch (err) {
      console.error("Consultation fetch error:", err);
      const fallback = getConsultationResponse(textToQuery);
      setResult(fallback);
      setSource("fallback");
      setActiveSkinKey(fallback.skinToneKey);
      setError("Gagal menghubungi AI. Menampilkan rekomendasi dari basis data lokal.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (key: string) => {
    setActiveSkinKey(key);
    const data = SKIN_TONE_DATA[key];
    if (data) {
      setResult(data);
      setSource("preset");
      setQuery(""); // Clear query when selecting preset
    }
  };

  const isFromAI = source === "grok_ai" || source === "gemini_ai";
  const isFromFallback = source && !isFromAI && source !== "preset";

  return (
    <div id="advisor" className="cartoon-card bg-white p-5 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#2D2D2D]/20 pb-5">
        <div className="space-y-1.5 max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-[#FFE66D] text-[#2D2D2D] px-3 py-0.5 rounded-full border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
            <Sparkles className="h-3 w-3" /> Konsultasi Grok AI
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-nunito tracking-tight text-[#2D2D2D]">
            {result && source !== "preset" ? "Hasil Konsultasi Fashion" : "Rekomendasi Busana & Styling"}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D]/75 leading-relaxed">
            Tanyakan apapun seputar fashion — dijawab langsung oleh AI.
          </p>
        </div>

        {/* Quick Tone Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#FFF8E7] rounded-2xl border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] text-xs font-black">
          {[
            { key: "cokelat", label: "Sawo Matang", active: "bg-[#FF6B6B] text-white" },
            { key: "kuning_langsat", label: "Kuning Langsat", active: "bg-[#FFE66D] text-[#2D2D2D]" },
            { key: "gelap", label: "Deep / Gelap", active: "bg-[#A78BFA] text-white" },
            { key: "terang", label: "Cerah / Fair", active: "bg-[#4ECDC4] text-[#2D2D2D]" },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => handleQuickSelect(key)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSkinKey === key
                  ? `${active} shadow-[2px_2px_0px_#2D2D2D] -translate-x-0.5 -translate-y-0.5`
                  : "text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="space-y-3">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
            placeholder="Tanya rekomendasi outfit (contoh: outfit untuk berat badan 70kg)"
            className="w-full rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFF8E7] px-4 py-3 pr-36 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none shadow-[3px_3px_0px_#2D2D2D]"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="cartoon-btn absolute right-2 bg-[#FF6B6B] text-white px-4 py-2 text-xs font-black disabled:opacity-50 flex items-center gap-1.5 min-w-[110px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Bot className="h-3.5 w-3.5" />
                Tanya Grok AI
              </>
            )}
          </button>
        </div>

        {/* Quick Prompts */}
        {result && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#2D2D2D] font-black">Topik cepat:</span>
            {result.quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => { setQuery(prompt); handleAsk(prompt); }}
                className="rounded-full border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3 py-1 text-[11px] font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:bg-[#FFE66D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFF8E7] p-6 space-y-4 shadow-[4px_4px_0px_#2D2D2D] animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#FFE66D] border-2 border-[#2D2D2D] flex items-center justify-center">
              <Bot className="h-5 w-5 text-[#2D2D2D] animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-[#2D2D2D]/10 rounded-lg" />
              <div className="h-3 w-64 bg-[#2D2D2D]/10 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="rounded-xl border-2 border-[#2D2D2D]/20 bg-[#2D2D2D]/5 h-16" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-[#2D2D2D]/10 rounded" />
            <div className="h-3 w-4/5 bg-[#2D2D2D]/10 rounded" />
            <div className="h-3 w-3/5 bg-[#2D2D2D]/10 rounded" />
          </div>
          <p className="text-center text-xs font-black text-[#2D2D2D]/50">
            Grok AI sedang menganalisis pertanyaan kamu...
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && !loading && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-[#FF6B6B] bg-[#FFD8C0] px-4 py-3 text-xs font-bold text-[#2D2D2D]">
          <AlertCircle className="h-4 w-4 text-[#FF6B6B] shrink-0" />
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className="space-y-5 rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFF8E7] p-5 sm:p-6 shadow-[4px_4px_0px_#2D2D2D]">

          {/* Source badge */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-0.5">
              <h3 className="text-lg sm:text-xl font-black font-nunito tracking-tight text-[#2D2D2D]">
                {result.skinToneTitle}
              </h3>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#2D2D2D]/80">
                {result.summary}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#2D2D2D] text-[11px] font-black shadow-[2px_2px_0px_#2D2D2D] shrink-0 ${
              isFromAI ? "bg-[#C8F7DC] text-[#2D2D2D]" : "bg-[#FFE66D] text-[#2D2D2D]"
            }`}>
              {isFromAI ? (
                <><Bot className="h-3 w-3" /> Dijawab Grok AI</>
              ) : (
                <><BookOpen className="h-3 w-3" /> Basis Data Lokal</>
              )}
            </span>
          </div>

          {/* Undertone */}
          {result.undertoneAnalysis && (
            <div className="rounded-xl border-2 border-[#2D2D2D] bg-white px-4 py-3 shadow-[2px_2px_0px_#2D2D2D]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2D2D2D]/60">Analisis Undertone</span>
              <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D] mt-0.5">{result.undertoneAnalysis}</p>
            </div>
          )}

          {/* Color Palette */}
          <div className="space-y-3 rounded-2xl border-2 border-[#2D2D2D] bg-white p-4 shadow-[3px_3px_0px_#2D2D2D]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">
                Palet Warna Rekomendasi
              </span>
              {onApplyPalette && (
                <button
                  onClick={() => onApplyPalette(result.tips.colorPalette.map(c => c.hex))}
                  className="text-[11px] font-black text-[#FF6B6B] hover:underline"
                >
                  Terapkan ke Studio →
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
              {result.tips.colorPalette.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] text-center shadow-[2px_2px_0px_#2D2D2D]">
                  <div className="h-9 w-full rounded-lg border-2 border-[#2D2D2D]" style={{ backgroundColor: color.hex }} />
                  <span className="mt-1.5 text-[10px] font-black line-clamp-2 text-[#2D2D2D] leading-tight">{color.name}</span>
                  <span className="text-[9px] font-mono font-bold text-[#2D2D2D]/50 uppercase">{color.hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advice + Avoid grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-[#2D2D2D] bg-white p-4 space-y-2 shadow-[3px_3px_0px_#2D2D2D]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">Panduan Padu Padan</h4>
              <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D]/80 leading-relaxed">{result.tips.advice}</p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {result.tips.recommendedStyles.map((style, i) => (
                  <span key={i} className="rounded-full border-2 border-[#2D2D2D] bg-[#FFE66D] px-2.5 py-0.5 text-[11px] font-black text-[#2D2D2D] shadow-[1.5px_1.5px_0px_#2D2D2D]">
                    #{style}
                  </span>
                ))}
              </div>
            </div>

            {result.tips.avoidColors && result.tips.avoidColors.length > 0 && (
              <div className="rounded-2xl border-2 border-[#2D2D2D] bg-white p-4 space-y-2 shadow-[3px_3px_0px_#2D2D2D]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B6B]">Warna yang Perlu Dihindari</h4>
                <ul className="space-y-1.5">
                  {result.tips.avoidColors.map((avoid, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-[#2D2D2D]/80">
                      <span className="text-[#FF6B6B] font-black mt-0.5">✕</span>
                      <span>{avoid}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Example Pieces — only if AI returned them */}
          {result.tips.examplePieces && result.tips.examplePieces.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">
                  Item Rekomendasi AI
                </span>
                <Link href="/creator" className="text-xs text-[#FF6B6B] font-black hover:underline">
                  Susun di Outfit Studio →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.tips.examplePieces.map((piece, idx) => (
                  <div key={idx} className="rounded-2xl border-2 border-[#2D2D2D] bg-white p-3.5 flex flex-col justify-between space-y-3 shadow-[3px_3px_0px_#2D2D2D]">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C8F7DC] border border-[#2D2D2D] text-[#2D2D2D]">
                        {piece.category}
                      </span>
                      <h5 className="text-xs font-black text-[#2D2D2D] line-clamp-2">{piece.name}</h5>
                      <p className="text-[11px] font-semibold text-[#2D2D2D]/70 leading-snug">{piece.reason}</p>
                    </div>
                    <a
                      href={`https://shopee.co.id/search?keyword=${encodeURIComponent(piece.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cartoon-btn text-center bg-[#FF6B6B] text-white py-2 text-xs font-black w-full"
                    >
                      Cek di Shopee →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI disclaimer */}
          {isFromAI && (
            <p className="text-[10px] font-bold text-[#2D2D2D]/40 text-center pt-1">
              Jawaban dihasilkan oleh Grok AI · Dapat bervariasi tiap konsultasi
            </p>
          )}
        </div>
      )}

      {/* Empty state — belum ada hasil */}
      {!result && !loading && (
        <div className="rounded-2xl border-[3px] border-dashed border-[#2D2D2D]/30 bg-[#FFF8E7] p-10 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFE66D] shadow-[3px_3px_0px_#2D2D2D]">
            <Bot className="h-7 w-7 text-[#2D2D2D]" />
          </div>
          <p className="text-sm font-black text-[#2D2D2D]">Belum ada hasil konsultasi</p>
          <p className="text-xs font-bold text-[#2D2D2D]/60">
            Ketik pertanyaan fashion kamu di atas atau pilih warna kulit untuk memulai
          </p>
        </div>
      )}
    </div>
  );
}
