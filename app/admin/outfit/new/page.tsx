"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import HotspotEditor from "@/components/HotspotEditor";
import { OutfitItem } from "@/components/OutfitCard";
import { createClient } from "@/lib/supabase/client";

export default function NewOutfitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [items, setItems] = useState<OutfitItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Judul dan URL Foto wajib diisi!");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Insert outfit
      const { data: outfitData, error: outfitError } = await supabase
        .from("outfits")
        .insert({
          title,
          description,
          image_url: imageUrl,
          tags: tagList,
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Insert outfit items
      if (items.length > 0 && outfitData) {
        const itemsToInsert = items.map((it) => ({
          outfit_id: outfitData.id,
          name: it.name,
          brand: it.brand || null,
          price: it.price || null,
          affiliate_url: it.affiliate_url,
          x: it.x,
          y: it.y,
        }));

        const { error: itemsError } = await supabase
          .from("outfit_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      setMessage("Berhasil menyimpan outfit!");
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setMessage(`Gagal menyimpan: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container max-w-5xl py-8 px-4 sm:px-6 space-y-6">
      <Link
        href="/admin"
        className="cartoon-btn inline-flex items-center gap-2 bg-white px-4 py-2 text-xs font-black text-[#2D2D2D] border-2 border-[#2D2D2D]"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Admin
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFE66D] shadow-[3px_3px_0px_#2D2D2D]">
          <Sparkles className="h-6 w-6 text-[#FF6B6B]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-nunito tracking-tight text-[#2D2D2D]">
            Upload Outfit Baru
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#2D2D2D]/70">
            Tambahkan inspirasi gaya OOTD lengkap dengan tautan affiliasi produk
          </p>
        </div>
      </div>

      {message && (
        <div className="cartoon-card border-2 border-[#2D2D2D] bg-[#C8F7DC] p-4 text-xs sm:text-sm font-black text-[#2D2D2D]">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="cartoon-card bg-white p-6 sm:p-8 space-y-5">
          <div className="border-b-2 border-[#2D2D2D]/20 pb-3">
            <h2 className="font-black font-nunito text-lg text-[#2D2D2D]">Informasi Outfit</h2>
            <p className="text-xs font-bold text-[#2D2D2D]/70">Detail deskripsi dan gambar utama kurasi</p>
          </div>
          <div>
            <label className="block text-xs font-black text-[#2D2D2D] mb-1.5">Judul Outfit</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Minimalist Casual Summer Look"
              className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#2D2D2D] mb-1.5">Deskripsi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat gaya pakaian atau inspirasi..."
              className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-[#2D2D2D] mb-1.5">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2D2D2D] mb-1.5">Tags (pisahkan koma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="summer, casual, earth-tone"
                className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              />
            </div>
          </div>
        </div>

        {/* Hotspot tagging */}
        <div className="cartoon-card bg-white p-6 sm:p-8 space-y-4">
          <div className="border-b-2 border-[#2D2D2D]/20 pb-3">
            <h2 className="font-black font-nunito text-lg text-[#2D2D2D]">Tag Hotspot Pakaian &amp; Produk Affiliate</h2>
            <p className="text-xs font-bold text-[#2D2D2D]/70">Klik pada gambar untuk menandai produk pakaian</p>
          </div>
          <HotspotEditor
            imageUrl={imageUrl}
            items={items}
            onChange={setItems}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin"
            className="cartoon-btn bg-white px-5 py-2.5 text-xs sm:text-sm font-black text-[#2D2D2D] border-2 border-[#2D2D2D]"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="cartoon-btn inline-flex items-center gap-2 bg-[#FF6B6B] px-6 py-2.5 text-xs sm:text-sm font-black text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Outfit"}
          </button>
        </div>
      </form>
    </main>
  );
}
