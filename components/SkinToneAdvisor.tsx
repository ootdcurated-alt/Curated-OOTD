"use client";

import { useState } from "react";
import { RecommendationResponse, SKIN_TONE_DATA, getConsultationResponse } from "@/lib/skinToneAdvisor";
import Link from "next/link";

interface SkinToneAdvisorProps {
  onApplyPalette?: (paletteColors: string[]) => void;
}

export default function SkinToneAdvisor({ onApplyPalette }: SkinToneAdvisorProps) {
  const [query, setQuery] = useState("outfit apa yang cocok untuk kulit cokelat?");
  const [activeSkinKey, setActiveSkinKey] = useState<string>("cokelat");
  const [result, setResult] = useState<RecommendationResponse>(SKIN_TONE_DATA.cokelat);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAsk = async (customText?: string) => {
    const textToQuery = customText !== undefined ? customText : query;
    if (!textToQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToQuery }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        if (json.data.skinToneKey) {
          setActiveSkinKey(json.data.skinToneKey);
        }
      } else {
        const fallback = getConsultationResponse(textToQuery);
        setResult(fallback);
        setActiveSkinKey(fallback.skinToneKey);
      }
    } catch (err) {
      console.error("Consultation fetch error, using fallback:", err);
      const fallback = getConsultationResponse(textToQuery);
      setResult(fallback);
      setActiveSkinKey(fallback.skinToneKey);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (key: string) => {
    setActiveSkinKey(key);
    const data = SKIN_TONE_DATA[key];
    if (data) {
      setResult(data);
      setQuery(data.quickPrompts[0] || `Outfit untuk kulit ${key}`);
    }
  };

  return (
    <div id="advisor" className="cartoon-card bg-white p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#2D2D2D]/20 pb-5">
        <div className="space-y-1.5 max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-[#FFE66D] text-[#2D2D2D] px-3 py-0.5 rounded-full border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
            Personal Color Consultation
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-nunito tracking-tight text-[#2D2D2D]">
            Rekomendasi Busana Berdasarkan Karakteristik Kulit
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D]/75 leading-relaxed">
            Panduan kurasi warna dan siluet busana yang diselaraskan dengan undertone kulit Anda.
          </p>
        </div>

        {/* Quick Tone Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#FFF8E7] rounded-2xl border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] text-xs font-black">
          <button
            onClick={() => handleQuickSelect("cokelat")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSkinKey === "cokelat"
                ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_#2D2D2D] -translate-x-0.5 -translate-y-0.5"
                : "text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-white"
            }`}
          >
            Sawo Matang
          </button>
          <button
            onClick={() => handleQuickSelect("kuning_langsat")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSkinKey === "kuning_langsat"
                ? "bg-[#FFE66D] text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] -translate-x-0.5 -translate-y-0.5"
                : "text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-white"
            }`}
          >
            Kuning Langsat
          </button>
          <button
            onClick={() => handleQuickSelect("gelap")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSkinKey === "gelap"
                ? "bg-[#A78BFA] text-white shadow-[2px_2px_0px_#2D2D2D] -translate-x-0.5 -translate-y-0.5"
                : "text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-white"
            }`}
          >
            Deep / Gelap
          </button>
          <button
            onClick={() => handleQuickSelect("terang")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSkinKey === "terang"
                ? "bg-[#4ECDC4] text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] -translate-x-0.5 -translate-y-0.5"
                : "text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-white"
            }`}
          >
            Cerah / Fair
          </button>
        </div>
      </div>

      {/* Input Consultation Bar */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Tanyakan analisis busana (contoh: outfit apa yang cocok untuk kulit cokelat?)"
            className="w-full rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFF8E7] px-4 py-3 pr-32 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/50 focus:outline-none shadow-[3px_3px_0px_#2D2D2D]"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="cartoon-btn absolute right-2 bg-[#FF6B6B] text-white px-5 py-2 text-xs font-black disabled:opacity-50"
          >
            {loading ? "Menganalisis..." : "Konsultasi"}
          </button>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#2D2D2D] font-black mr-1">Rekomendasi topik:</span>
          {result.quickPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(prompt);
                handleAsk(prompt);
              }}
              className="rounded-full border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3 py-1 text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:bg-[#FFE66D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="space-y-6 rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFF8E7] p-5 sm:p-6 shadow-[4px_4px_0px_#2D2D2D]">
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black font-nunito tracking-tight text-[#2D2D2D]">
              {result.skinToneTitle}
            </h3>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#2D2D2D]/80">
              {result.summary}
            </p>
          </div>

          {/* Color Palette Grid */}
          <div className="space-y-3 rounded-2xl border-2 border-[#2D2D2D] bg-white p-4 shadow-[3px_3px_0px_#2D2D2D]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">
                Palet Warna Rekomendasi
              </span>
              <span className="text-[11px] font-bold text-[#2D2D2D]/60">
                Harmoni Spektrum Terpilih
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
              {result.tips.colorPalette.map((color, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-2 rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] text-center shadow-[2px_2px_0px_#2D2D2D]"
                >
                  <div
                    className="h-9 w-full rounded-lg border-2 border-[#2D2D2D]"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="mt-1.5 text-xs font-black line-clamp-1 text-[#2D2D2D]">
                    {color.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#2D2D2D]/60 uppercase">
                    {color.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advice & Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-[#2D2D2D] bg-white p-4 space-y-2 shadow-[3px_3px_0px_#2D2D2D]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">
                Panduan Padu Padan
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D]/80 leading-relaxed">
                {result.tips.advice}
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {result.tips.recommendedStyles.map((style, i) => (
                  <span
                    key={i}
                    className="rounded-full border-2 border-[#2D2D2D] bg-[#FFE66D] px-2.5 py-0.5 text-[11px] font-black text-[#2D2D2D] shadow-[1.5px_1.5px_0px_#2D2D2D]"
                  >
                    #{style}
                  </span>
                ))}
              </div>
            </div>

            {result.tips.avoidColors && (
              <div className="rounded-2xl border-2 border-[#2D2D2D] bg-white p-4 space-y-2 shadow-[3px_3px_0px_#2D2D2D]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B6B]">
                  Catatan Keselarasan Warna
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-[#2D2D2D]/80">
                  {result.tips.avoidColors.map((avoid, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#FF6B6B] font-black">&mdash;</span>
                      <span>{avoid}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggested Pieces */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D]">
                Item Kurasi &amp; Tautan Pembelian
              </span>
              <Link
                href="/creator"
                className="text-xs text-[#FF6B6B] font-black hover:underline"
              >
                Susun di Outfit Studio &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {result.tips.examplePieces.map((piece, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-[#2D2D2D] bg-white p-3.5 flex flex-col justify-between space-y-3 shadow-[3px_3px_0px_#2D2D2D]"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C8F7DC] border border-[#2D2D2D] text-[#2D2D2D]">
                      {piece.category}
                    </span>
                    <h5 className="text-xs font-black text-[#2D2D2D] line-clamp-2">
                      {piece.name}
                    </h5>
                    <p className="text-[11px] font-semibold text-[#2D2D2D]/70 leading-snug">
                      {piece.reason}
                    </p>
                  </div>
                  <a
                    href={`https://shopee.co.id/search?keyword=${encodeURIComponent(piece.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cartoon-btn text-center bg-[#FF6B6B] text-white py-2 text-xs font-black w-full"
                  >
                    Cek di Marketplace &rarr;
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
