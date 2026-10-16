"use client";

import React, { useRef, useState } from "react";
import { OutfitCreationItem } from "@/lib/creatorStore";

export interface MannequinProps {
  gender: "pria" | "wanita";
  bodyType: "berisi" | "kurus" | "standar" | "atletis";
  weight: number; // 40 - 120 kg
  height: number; // 145 - 195 cm
  skinTone: string; // "cokelat" | "kuning_langsat" | "gelap" | "terang" | "semua"
  selectedItems?: OutfitCreationItem[];
}

function getLuxurySkinPalette(skinTone: string) {
  switch (skinTone) {
    case "cokelat":
      return {
        base: "#8E5B3D",
        highlight: "#B27C5B",
        shadow: "#5E361F",
        accent: "#C68E6B",
      };
    case "kuning_langsat":
      return {
        base: "#D8A775",
        highlight: "#EFC69B",
        shadow: "#9D6E42",
        accent: "#F7D8B5",
      };
    case "gelap":
      return {
        base: "#4A2E1D",
        highlight: "#684530",
        shadow: "#2E190D",
        accent: "#7A523A",
      };
    case "terang":
      return {
        base: "#E8C2AC",
        highlight: "#FDE0D0",
        shadow: "#B58C77",
        accent: "#FFF0E6",
      };
    default:
      return {
        base: "#9B6748",
        highlight: "#BD8765",
        shadow: "#643B23",
        accent: "#D29E7A",
      };
  }
}

export default function Mannequin3DViewer({
  gender,
  bodyType,
  weight,
  height,
  skinTone,
  selectedItems = [],
}: MannequinProps) {
  // Sudut rotasi 360 derajat horizontal
  const [rotationAngle, setRotationAngle] = useState(0); // 0 - 360
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number }>({ x: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    setRotationAngle((prev) => (prev + deltaX * 0.9) % 360);
    lastMousePos.current = { x: e.clientX };
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastMousePos.current = { x: e.touches[0].clientX };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.current.x;
    setRotationAngle((prev) => (prev + deltaX * 0.9) % 360);
    lastMousePos.current = { x: e.touches[0].clientX };
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Normalisasi sudut ke 0 - 360 derajat
  const normalizedAngle = ((rotationAngle % 360) + 360) % 360;

  // View state berdasarkan derajat putaran:
  // 0° (+/- 45°): Tampak Depan
  // 45° - 135°: Profil Kanan (Tampak Samping Kanan)
  // 135° - 225°: Tampak Belakang
  // 225° - 315°: Profil Kiri (Tampak Samping Kiri)
  const isBackView = normalizedAngle >= 135 && normalizedAngle <= 225;
  const isRightSide = normalizedAngle > 45 && normalizedAngle < 135;
  const isLeftSide = normalizedAngle > 225 && normalizedAngle < 315;
  const isSideView = isRightSide || isLeftSide;

  // Indikator nama arah putaran
  let viewLabel = "Tampak Depan";
  if (isBackView) viewLabel = "Tampak Belakang";
  else if (isRightSide) viewLabel = "Tampak Samping Kanan";
  else if (isLeftSide) viewLabel = "Tampak Samping Kiri";

  // Deteksi baju yang sedang dipilih oleh user di lemari
  const activeTop = selectedItems.find((i) => i.category === "top");
  const activeOuter = selectedItems.find((i) => i.category === "outer");
  const activeBottom = selectedItems.find((i) => i.category === "bottom");
  const activeShoes = selectedItems.find((i) => i.category === "shoes");
  const activeAcc = selectedItems.find((i) => i.category === "accessory");

  // Warna pakaian terpilih
  const topColor = activeTop?.hexColor || "#25272D";
  const outerColor = activeOuter?.hexColor || null;
  const bottomColor = activeBottom?.hexColor || "#1E2024";
  const shoesColor = activeShoes?.hexColor || "#141517";

  // Proporsi Tubuh Realistis
  const isMale = gender === "pria";
  const heightRatio = height / 172;
  const weightFactor = (weight - 40) / 80; // 0 - 1

  // Lebar bahu
  const shoulderBase = isSideView ? 30 : (isMale ? 58 : 48);
  const shoulderMorph = (bodyType === "atletis" ? 1.2 : bodyType === "berisi" ? 1.12 : bodyType === "kurus" ? 0.92 : 1.0);
  const shoulderW = (shoulderBase + weightFactor * 14) * shoulderMorph;

  // Dada & Lingkar Torso
  const chestW = (isSideView ? 34 : (isMale ? 52 : 46)) + weightFactor * 18;

  // Pinggang (Waist Curve)
  let waistW = (isSideView ? 30 : (isMale ? 40 : 34)) + weightFactor * 26;
  if (bodyType === "berisi") waistW *= 1.22;
  if (bodyType === "kurus") waistW *= 0.86;
  if (bodyType === "atletis") waistW *= 0.88;

  // Pinggul (Hips Curve)
  let hipW = (isSideView ? 32 : (isMale ? 44 : 50)) + weightFactor * 22;
  if (!isMale && bodyType === "berisi") hipW *= 1.2;

  // Paha & Kaki
  const thighW = (18 + weightFactor * 14) * (bodyType === "berisi" ? 1.18 : bodyType === "kurus" ? 0.88 : 1);
  const calfW = (12 + weightFactor * 8) * (bodyType === "berisi" ? 1.15 : 1);
  const armW = (12 + weightFactor * 10) * (bodyType === "atletis" ? 1.25 : bodyType === "berisi" ? 1.15 : 1);

  const palette = getLuxurySkinPalette(skinTone);

  return (
    <div className="relative w-full flex flex-col items-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#18191B] via-[#121315] to-[#0A0B0C] border border-white/10 shadow-2xl">
      {/* Studio Lighting Ambient Glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: palette.accent }}
      />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

      {/* 3D Viewport */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[450px] sm:h-[490px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Soft Studio Floor Pedestal & Shadow */}
        <div
          className="absolute bottom-8 w-48 h-10 rounded-full blur-sm opacity-60 bg-black pointer-events-none transition-all duration-300"
          style={{
            transform: `scale(${1 + weightFactor * 0.3}) scaleX(${zoom})`,
          }}
        />

        {/* Brushed Studio Metal Base */}
        <div
          className="absolute bottom-7 w-40 h-3.5 rounded-full bg-gradient-to-r from-[#2B2D31] via-[#52565E] to-[#1E2024] border border-white/15 shadow-lg pointer-events-none"
          style={{ transform: `scale(${zoom})` }}
        />
        <div
          className="absolute bottom-9 w-2 h-14 bg-gradient-to-r from-[#3B3D42] via-[#6B707B] to-[#2B2D31] pointer-events-none shadow"
          style={{ transform: `scale(${zoom})` }}
        />

        {/* Visual Mannequin Stage - Anatomical Rendering without flattening */}
        <div
          className="relative transition-transform duration-100 flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            height: "100%",
            width: "320px",
          }}
        >
          <svg
            viewBox="0 0 320 480"
            className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            style={{
              transform: `scaleY(${heightRatio})`,
              transformOrigin: "bottom center",
            }}
          >
            <defs>
              {/* Radial Lighting Shaders for Skin Tone */}
              <radialGradient id="mannequinHead" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={palette.accent} stopOpacity="0.9" />
                <stop offset="35%" stopColor={palette.highlight} />
                <stop offset="75%" stopColor={palette.base} />
                <stop offset="100%" stopColor={palette.shadow} />
              </radialGradient>

              <linearGradient id="mannequinTorso" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={palette.shadow} />
                <stop offset="30%" stopColor={palette.highlight} />
                <stop offset="70%" stopColor={palette.base} />
                <stop offset="100%" stopColor={palette.shadow} />
              </linearGradient>

              <linearGradient id="mannequinLimbs" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={palette.shadow} />
                <stop offset="35%" stopColor={palette.highlight} />
                <stop offset="70%" stopColor={palette.base} />
                <stop offset="100%" stopColor={palette.shadow} />
              </linearGradient>

              {/* Shading Baju Dipakai (Top Gradient) */}
              <linearGradient id="topFabric" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={topColor} stopOpacity="0.8" />
                <stop offset="35%" stopColor={topColor} />
                <stop offset="100%" stopColor={topColor} stopOpacity="0.75" />
              </linearGradient>

              {/* Shading Celana Dipakai (Bottom Gradient) */}
              <linearGradient id="bottomFabric" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={bottomColor} stopOpacity="0.8" />
                <stop offset="40%" stopColor={bottomColor} />
                <stop offset="100%" stopColor={bottomColor} stopOpacity="0.75" />
              </linearGradient>

              {/* Shading Outerwear Dipakai (Jika ada) */}
              {outerColor && (
                <linearGradient id="outerFabric" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={outerColor} stopOpacity="0.85" />
                  <stop offset="40%" stopColor={outerColor} />
                  <stop offset="100%" stopColor={outerColor} stopOpacity="0.7" />
                </linearGradient>
              )}

              {/* Shading Sepatu Dipakai */}
              <linearGradient id="shoesFabric" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={shoesColor} stopOpacity="0.85" />
                <stop offset="35%" stopColor={shoesColor} />
                <stop offset="100%" stopColor={shoesColor} stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* ==== 1. KEPALA & LEHER (Head & Neck) ==== */}
            {/* Leher Mannequin */}
            <path
              d={`
                M ${160 - (10 + weightFactor * 3)} 72
                C ${160 - (10 + weightFactor * 3)} 88, ${160 - (12 + weightFactor * 4)} 94, ${160 - (16 + weightFactor * 4)} 100
                L ${160 + (16 + weightFactor * 4)} 100
                C ${160 + (12 + weightFactor * 4)} 94, ${160 + (10 + weightFactor * 3)} 88, ${160 + (10 + weightFactor * 3)} 72
                Z
              `}
              fill="url(#mannequinTorso)"
            />

            {/* Kepala Oval Studio */}
            <ellipse
              cx="160"
              cy="48"
              rx={19 + (bodyType === "berisi" ? 2 : 0)}
              ry={25 + (bodyType === "berisi" ? 1.5 : 0)}
              fill="url(#mannequinHead)"
            />

            {/* Tutup Cap Studio Kepala */}
            <ellipse cx="160" cy="24" rx="7" ry="3" fill="url(#mannequinHead)" opacity="0.9" />

            {/* ==== 2. LENGAN (Arms) ==== */}
            {!isSideView ? (
              <>
                {/* Lengan Kiri */}
                <g>
                  <path
                    d={`
                      M ${160 - shoulderW + 3} 104
                      C ${160 - shoulderW - armW * 0.4} 125, ${160 - shoulderW - armW * 0.3} 155, ${160 - shoulderW - 1} 185
                      L ${160 - shoulderW + armW * 0.8} 185
                      C ${160 - shoulderW + armW * 0.7} 155, ${160 - shoulderW + armW * 0.8} 125, ${160 - shoulderW + armW * 0.9} 108
                      Z
                    `}
                    fill="url(#mannequinLimbs)"
                  />
                  <path
                    d={`
                      M ${160 - shoulderW - 1} 185
                      C ${160 - shoulderW - armW * 0.2} 220, ${160 - shoulderW - armW * 0.1} 245, ${160 - shoulderW} 265
                      L ${160 - shoulderW + armW * 0.7} 265
                      C ${160 - shoulderW + armW * 0.8} 245, ${160 - shoulderW + armW * 0.85} 220, ${160 - shoulderW + armW * 0.8} 185
                      Z
                    `}
                    fill="url(#mannequinLimbs)"
                  />
                  <ellipse
                    cx={160 - shoulderW + armW * 0.35}
                    cy="274"
                    rx={armW * 0.45}
                    ry="9"
                    fill="url(#mannequinLimbs)"
                  />
                </g>

                {/* Lengan Kanan */}
                <g>
                  <path
                    d={`
                      M ${160 + shoulderW - 3} 104
                      C ${160 + shoulderW + armW * 0.4} 125, ${160 + shoulderW + armW * 0.3} 155, ${160 + shoulderW + 1} 185
                      L ${160 + shoulderW - armW * 0.8} 185
                      C ${160 + shoulderW - armW * 0.7} 155, ${160 + shoulderW - armW * 0.8} 125, ${160 + shoulderW - armW * 0.9} 108
                      Z
                    `}
                    fill="url(#mannequinLimbs)"
                  />
                  <path
                    d={`
                      M ${160 + shoulderW + 1} 185
                      C ${160 + shoulderW + armW * 0.2} 220, ${160 + shoulderW + armW * 0.1} 245, ${160 + shoulderW} 265
                      L ${160 + shoulderW - armW * 0.7} 265
                      C ${160 + shoulderW - armW * 0.8} 245, ${160 + shoulderW - armW * 0.85} 220, ${160 + shoulderW - armW * 0.8} 185
                      Z
                    `}
                    fill="url(#mannequinLimbs)"
                  />
                  <ellipse
                    cx={160 + shoulderW - armW * 0.35}
                    cy="274"
                    rx={armW * 0.45}
                    ry="9"
                    fill="url(#mannequinLimbs)"
                  />
                </g>
              </>
            ) : (
              /* Lengan Samping Realistis */
              <g>
                <path
                  d={`
                    M 152 104
                    C 142 135, 142 165, 146 195
                    L ${146 + armW} 195
                    C ${146 + armW} 165, ${148 + armW} 135, 168 104
                    Z
                  `}
                  fill="url(#mannequinLimbs)"
                />
                <path
                  d={`
                    M 146 195
                    C 148 230, 150 255, 152 270
                    L ${152 + armW * 0.8} 270
                    C ${152 + armW * 0.8} 255, ${146 + armW} 230, ${146 + armW} 195
                    Z
                  `}
                  fill="url(#mannequinLimbs)"
                />
                <ellipse cx={152 + armW * 0.4} cy="278" rx={armW * 0.45} ry="9" fill="url(#mannequinLimbs)" />
              </g>
            )}

            {/* ==== 3. BAJU ATASAN YANG MEMAKAI WARNA & POTONGAN PILIHAN USER ==== */}
            {/* Kaos / Atasan Dipakai pada Mannequin */}
            <path
              d={`
                M ${160 - shoulderW} 102
                C ${160 - shoulderW * 0.4} 98, ${160 + shoulderW * 0.4} 98, ${160 + shoulderW} 102
                C ${160 + chestW} 120, ${160 + chestW * 0.95} 145, ${160 + waistW} 175
                C ${160 + waistW * 1.02} 195, ${160 + hipW * 0.95} 215, ${160 + hipW} 230
                L ${160 - hipW} 230
                C ${160 - hipW * 0.95} 215, ${160 - waistW * 1.02} 195, ${160 - waistW} 175
                C ${160 - chestW * 0.95} 145, ${160 - chestW} 120, ${160 - shoulderW} 102
                Z
              `}
              fill="url(#topFabric)"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />

            {/* Kerah Baju Atasan (Kerah Depan / Garis Jahitan Belakang) */}
            {!isBackView ? (
              <path
                d={`
                  M ${160 - (20 + weightFactor * 3)} 100
                  C ${160 - 10} 115, ${160 + 10} 115, ${160 + (20 + weightFactor * 3)} 100
                `}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.8"
              />
            ) : (
              <path
                d={`
                  M ${160 - (20 + weightFactor * 3)} 100
                  C ${160 - 10} 105, ${160 + 10} 105, ${160 + (20 + weightFactor * 3)} 100
                `}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
              />
            )}

            {/* Outerwear (Blazer / Jacket / Hoodie) jika dipilih user */}
            {outerColor && !isSideView && (
              <g>
                {/* Sisi Kiri Outer */}
                <path
                  d={`
                    M ${160 - shoulderW - 2} 100
                    L ${160 - shoulderW * 0.3} 100
                    L ${160 - 12} 175
                    L ${160 - hipW * 0.7} 245
                    L ${160 - hipW - 3} 240
                    C ${160 - waistW - 4} 190, ${160 - chestW - 4} 130, ${160 - shoulderW - 2} 100
                    Z
                  `}
                  fill="url(#outerFabric)"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                />
                {/* Sisi Kanan Outer */}
                <path
                  d={`
                    M ${160 + shoulderW + 2} 100
                    L ${160 + shoulderW * 0.3} 100
                    L ${160 + 12} 175
                    L ${160 + hipW * 0.7} 245
                    L ${160 + hipW + 3} 240
                    C ${160 + waistW + 4} 190, ${160 + chestW + 4} 130, ${160 + shoulderW + 2} 100
                    Z
                  `}
                  fill="url(#outerFabric)"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* ==== 4. CELANA BAWAHAN YANG MEMAKAI PILIHAN USER ==== */}
            {!isSideView ? (
              <>
                {/* Pinggul & Sabuk */}
                <path
                  d={`
                    M ${160 - hipW} 228
                    L ${160 + hipW} 228
                    L ${160 + hipW * 0.98} 242
                    C ${160} 245, ${160} 245, ${160 - hipW * 0.98} 242
                    Z
                  `}
                  fill="url(#bottomFabric)"
                />

                {/* Kaki Kiri Celana */}
                <path
                  d={`
                    M ${160 - hipW * 0.96} 242
                    C ${160 - hipW * 0.9} 290, ${160 - thighW - 12} 335, ${160 - calfW - 10} 385
                    L ${160 - calfW - 8} 440
                    L ${160 - 8} 440
                    L ${160 - 10} 385
                    C ${160 - 14} 335, ${160 - 18} 280, ${160 - 4} 255
                    Z
                  `}
                  fill="url(#bottomFabric)"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />

                {/* Kaki Kanan Celana */}
                <path
                  d={`
                    M ${160 + hipW * 0.96} 242
                    C ${160 + hipW * 0.9} 290, ${160 + thighW + 12} 335, ${160 + calfW + 10} 385
                    L ${160 + calfW + 8} 440
                    L ${160 + 8} 440
                    L ${160 + 10} 385
                    C ${160 + 14} 335, ${160 + 18} 280, ${160 + 4} 255
                    Z
                  `}
                  fill="url(#bottomFabric)"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />

                {/* Garis Lipatan Celana */}
                <line
                  x1={160 - (thighW * 0.5 + 8)}
                  y1="270"
                  x2={160 - (calfW * 0.5 + 8)}
                  y2="435"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.2"
                />
                <line
                  x1={160 + (thighW * 0.5 + 8)}
                  y1="270"
                  x2={160 + (calfW * 0.5 + 8)}
                  y2="435"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.2"
                />
              </>
            ) : (
              /* Kaki Celana Tampak Samping */
              <path
                d={`
                  M ${160 - hipW * 0.6} 228
                  L ${160 + hipW * 0.6} 228
                  C ${160 + hipW * 0.7} 290, ${160 + thighW} 340, ${160 + calfW} 390
                  L ${160 + calfW - 4} 440
                  L ${160 - calfW + 4} 440
                  C ${160 - calfW} 390, ${160 - thighW * 0.9} 340, ${160 - hipW * 0.7} 290
                  Z
                `}
                fill="url(#bottomFabric)"
              />
            )}

            {/* ==== 5. SEPATU YANG MEMAKAI PILIHAN USER ==== */}
            {!isSideView ? (
              <>
                {/* Sepatu Kiri */}
                <path
                  d={`
                    M ${160 - calfW - 9} 440
                    C ${160 - calfW - 12} 450, ${160 - calfW - 7} 455, ${160 - calfW - 4} 458
                    L ${160 - 5} 458
                    C ${160 - 4} 455, ${160 - 6} 448, ${160 - 7} 440
                    Z
                  `}
                  fill="url(#shoesFabric)"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                />
                <ellipse cx={160 - (calfW * 0.5 + 7)} cy="459" rx={calfW * 0.45 + 2} ry="2.5" fill="#050506" />

                {/* Sepatu Kanan */}
                <path
                  d={`
                    M ${160 + calfW + 9} 440
                    C ${160 + calfW + 12} 450, ${160 + calfW + 7} 455, ${160 + calfW + 4} 458
                    L ${160 + 5} 458
                    C ${160 + 4} 455, ${160 + 6} 448, ${160 + 7} 440
                    Z
                  `}
                  fill="url(#shoesFabric)"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                />
                <ellipse cx={160 + (calfW * 0.5 + 7)} cy="459" rx={calfW * 0.45 + 2} ry="2.5" fill="#050506" />
              </>
            ) : (
              /* Sepatu Tampak Samping */
              <path
                d={`
                  M ${160 - calfW} 440
                  L ${160 + calfW} 440
                  C ${160 + calfW + 6} 446, ${160 + calfW + 12} 452, ${160 + calfW + 16} 458
                  L ${160 - calfW - 4} 458
                  C ${160 - calfW - 4} 452, ${160 - calfW - 2} 446, ${160 - calfW} 440
                  Z
                `}
                fill="url(#shoesFabric)"
              />
            )}
          </svg>
        </div>

        {/* Petunjuk Arah Putar & Kontrol */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 pointer-events-none z-20">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{viewLabel}</span>
            <span className="text-white/50">({Math.round(normalizedAngle)}°)</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
              className="h-7 w-7 rounded-md bg-black/60 border border-white/15 hover:bg-white/10 text-white flex items-center justify-center font-bold"
              title="Zoom out"
            >
              -
            </button>
            <button
              onClick={() => {
                setRotationAngle(0);
                setZoom(1);
              }}
              className="px-2.5 h-7 text-[10px] rounded-md bg-black/60 border border-white/15 hover:bg-white/10 text-white font-medium"
              title="Reset ke tampak depan"
            >
              Depan
            </button>
            <button
              onClick={() => {
                setRotationAngle(90);
                setZoom(1);
              }}
              className="px-2 h-7 text-[10px] rounded-md bg-black/60 border border-white/15 hover:bg-white/10 text-white font-medium"
              title="Putar ke samping"
            >
              Samping
            </button>
            <button
              onClick={() => {
                setRotationAngle(180);
                setZoom(1);
              }}
              className="px-2 h-7 text-[10px] rounded-md bg-black/60 border border-white/15 hover:bg-white/10 text-white font-medium"
              title="Putar ke belakang"
            >
              Belakang
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
              className="h-7 w-7 rounded-md bg-black/60 border border-white/15 hover:bg-white/10 text-white flex items-center justify-center font-bold"
              title="Zoom in"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar Pakaian yang Sedang Dipakai Mannequin */}
      <div className="w-full px-4 py-3 bg-black/50 border-t border-white/10 space-y-1.5 text-xs text-white/90 z-20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white capitalize">
              Fitting Studio ({gender}):
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono capitalize">
              {bodyType}
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono">
              {weight} kg • {height} cm
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70 text-[11px]">
            <span>Tone:</span>
            <span
              className="h-3 w-3 rounded-full border border-white/30"
              style={{ backgroundColor: palette.base }}
            />
            <span className="capitalize">{skinTone}</span>
          </div>
        </div>

        {/* Live Outfit Indicator on Mannequin */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[11px] overflow-x-auto scrollbar-none">
          <span className="text-white/60 shrink-0">Baju Dipakai:</span>
          {activeTop && (
            <span className="rounded bg-white/15 px-2 py-0.5 font-medium shrink-0 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: topColor }} />
              {activeTop.name.split("(")[0]}
            </span>
          )}
          {activeOuter && (
            <span className="rounded bg-white/15 px-2 py-0.5 font-medium shrink-0 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: outerColor || "#333" }} />
              {activeOuter.name.split("(")[0]}
            </span>
          )}
          {activeBottom && (
            <span className="rounded bg-white/15 px-2 py-0.5 font-medium shrink-0 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bottomColor }} />
              {activeBottom.name.split("(")[0]}
            </span>
          )}
          {activeShoes && (
            <span className="rounded bg-white/15 px-2 py-0.5 font-medium shrink-0 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: shoesColor }} />
              {activeShoes.name.split("(")[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
