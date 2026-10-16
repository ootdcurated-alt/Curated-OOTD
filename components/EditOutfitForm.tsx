"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import HotspotEditor from "@/components/HotspotEditor";
import { OutfitItem } from "@/components/OutfitCard";
import { createClient } from "@/lib/supabase/client";

interface EditOutfitFormProps {
  outfit: {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    tags: string[] | null;
  };
  outfitItems: OutfitItem[];
}

export default function EditOutfitForm({ outfit, outfitItems }: EditOutfitFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(outfit.title);
  const [description, setDescription] = useState(outfit.description || "");
  const [imageUrl, setImageUrl] = useState(outfit.image_url);
  const [tags, setTags] = useState((outfit.tags || []).join(", "));
  const [items, setItems] = useState<OutfitItem[]>(outfitItems);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      setMessage({ text: "Judul dan URL Foto wajib diisi!", type: "error" });
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

      // Update outfit
      const { error: outfitError } = await supabase
        .from("outfits")
        .update({ title, description, image_url: imageUrl, tags: tagList })
        .eq("id", outfit.id);

      if (outfitError) throw outfitError;

      // Replace all outfit_items: delete then re-insert
      await supabase.from("outfit_items").delete().eq("outfit_id", outfit.id);

      if (items.length > 0) {
        const itemsToInsert = items.map((it) => ({
          outfit_id: outfit.id,
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

      setMessage({ text: "Outfit berhasil diperbarui!", type: "success" });
      setTimeout(() => router.push("/admin"), 1200);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: `Gagal menyimpan: ${err.message || "Unknown error"}`, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("outfit_items").delete().eq("outfit_id", outfit.id);
      const { error } = await supabase.from("outfits").delete().eq("id", outfit.id);
      if (error) throw error;
      router.push("/admin");
    } catch (err: any) {
      setMessage({ text: `Gagal menghapus: ${err.message}`, type: "error" });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <main className="container max-w-5xl py-8 px-4 sm:px-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Admin
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Edit Outfit</h1>
        </div>

        {/* Delete button */}
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Outfit
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/50 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-700 dark:text-red-400">Yakin hapus?</span>
            <button
              onClick={() => setConfirmDelete(false)}
              className="ml-1 rounded px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg border p-4 text-sm font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border p-6 bg-card space-y-4">
          <h2 className="font-semibold text-lg">Informasi Outfit</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Judul Outfit</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Minimalist Casual Summer Look"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat gaya pakaian atau inspirasi..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (pisahkan koma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="summer, casual, earth-tone"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-2">Preview gambar:</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="h-48 w-auto rounded-lg object-cover border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Hotspot tagging */}
        <div className="rounded-xl border border-border p-6 bg-card">
          <h2 className="font-semibold text-lg mb-4">Tag Hotspot Pakaian & Produk Affiliate</h2>
          <HotspotEditor imageUrl={imageUrl} items={items} onChange={setItems} />
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </main>
  );
}
