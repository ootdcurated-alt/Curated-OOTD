"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Outfit {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

export default function AdminOutfitList({ initialOutfits }: { initialOutfits: Outfit[] }) {
  const [outfits, setOutfits] = useState(initialOutfits);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      // Delete child items first (FK constraint)
      await supabase.from("outfit_items").delete().eq("outfit_id", id);
      const { error } = await supabase.from("outfits").delete().eq("id", id);
      if (error) throw error;
      setOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus outfit.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (outfits.length === 0) {
    return (
      <div className="cartoon-card bg-white p-12 text-center">
        <p className="text-sm font-bold text-[#2D2D2D]/70">Belum ada outfit yang diunggah.</p>
        <Link
          href="/admin/outfit/new"
          className="cartoon-btn mt-4 inline-block bg-[#FF6B6B] px-5 py-2 text-xs font-black text-white"
        >
          Unggah outfit pertama Anda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="cartoon-card border-2 border-[#2D2D2D] bg-[#FF6B6B] px-4 py-3 text-xs sm:text-sm font-black text-white">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {outfits.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border-2 border-[#2D2D2D] bg-white shadow-[3px_3px_0px_#2D2D2D] transition-transform hover:-translate-y-1"
          >
            {/* Delete confirmation overlay */}
            {confirmId === item.id && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#FFF8E7]/95 p-5 text-center border-2 border-[#2D2D2D]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#2D2D2D] bg-[#FFE66D] shadow-[2px_2px_0px_#2D2D2D]">
                  <AlertTriangle className="h-6 w-6 text-[#2D2D2D]" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#2D2D2D]">Hapus outfit ini?</p>
                  <p className="mt-1 text-xs font-bold text-[#2D2D2D]/70">
                    Semua hotspot produk juga akan ikut terhapus.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmId(null)}
                    className="cartoon-btn border-2 border-[#2D2D2D] bg-white px-4 py-1.5 text-xs font-black text-[#2D2D2D]"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="cartoon-btn bg-[#FF6B6B] px-4 py-1.5 text-xs font-black text-white disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Menghapus..." : "Ya, Hapus"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 p-4 items-start">
              {/* Thumbnail */}
              <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7]">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-[#2D2D2D]/40" />
                  </div>
                )}
              </div>

              {/* Info + Actions */}
              <div className="flex-1 min-w-0">
                <p className="font-black font-nunito text-sm leading-tight truncate text-[#2D2D2D]">{item.title}</p>
                <p className="text-[11px] font-bold text-[#2D2D2D]/60 mt-0.5">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/outfit/${item.id}`}
                    target="_blank"
                    className="cartoon-btn inline-flex items-center gap-1 text-[11px] font-black bg-[#C0E8FF] px-2.5 py-1 text-[#2D2D2D] border-2 border-[#2D2D2D]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Lihat
                  </Link>
                  <Link
                    href={`/admin/outfit/${item.id}/edit`}
                    className="cartoon-btn inline-flex items-center gap-1 text-[11px] font-black bg-[#FFE66D] px-2.5 py-1 text-[#2D2D2D] border-2 border-[#2D2D2D]"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="cartoon-btn inline-flex items-center gap-1 text-[11px] font-black bg-[#FF6B6B] px-2.5 py-1 text-white border-2 border-[#2D2D2D]"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
