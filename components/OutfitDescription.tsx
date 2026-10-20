"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface OutfitDescriptionProps {
  description?: string | null;
}

export default function OutfitDescription({ description }: OutfitDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!description || !description.trim()) {
    return null;
  }

  const cleanDesc = description.trim();
  const isLong = cleanDesc.length > 180 || cleanDesc.includes("\n");

  return (
    <div className="rounded-2xl border border-border/80 bg-white/70 backdrop-blur-md p-4 sm:p-5 shadow-cartoon-sm transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider font-nunito">
              Deskripsi &amp; Detail Outfit
            </h3>
            <p className="text-[11px] font-bold text-foreground/50">
              {isLong
                ? isOpen
                  ? "Klik untuk memperkecil tampilan deskripsi"
                  : "Klik tombol untuk membaca deskripsi lengkap"
                : "Informasi detail kurasi gaya pakaian ini"}
            </p>
          </div>
        </div>

        {isLong && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="cartoon-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all rounded-full shrink-0"
          >
            {isOpen ? (
              <>
                Tutup <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Baca Deskripsi <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Konten Deskripsi */}
      {(!isLong || isOpen) && (
        <div className="mt-4 pt-3.5 border-t border-border/60 text-xs sm:text-sm font-medium text-foreground/80 leading-relaxed space-y-2 animate-in fade-in-50 duration-300">
          {cleanDesc.split("\n").map((paragraph, idx) => {
            if (!paragraph.trim()) return <div key={idx} className="h-2" />;
            return (
              <p key={idx} className="whitespace-pre-line">
                {paragraph}
              </p>
            );
          })}
        </div>
      )}

      {isLong && !isOpen && (
        <div className="mt-2.5">
          <p className="line-clamp-2 text-xs font-medium text-foreground/60 leading-relaxed">
            {cleanDesc}
          </p>
        </div>
      )}
    </div>
  );
}
