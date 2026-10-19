"use client";

import { useEffect, useState } from "react";
import { Category, syncCategoriesToLocal } from "@/lib/categories";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Ambil kategori dari Supabase via API
  const fetchCategories = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.categories)) {
        setCategories(json.categories);
        syncCategoriesToLocal(json.categories); // cache ke localStorage
      }
    } catch {
      // Fallback sudah ditangani di API route
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleUpdate = () => fetchCategories();
    window.addEventListener("categories_updated", handleUpdate);
    return () => window.removeEventListener("categories_updated", handleUpdate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ text: "Nama kategori tidak boleh kosong.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menambahkan kategori");
      }

      setName("");
      setDescription("");
      setMessage({ text: `Kategori "${name}" berhasil ditambahkan.`, type: "success" });
      await fetchCategories(); // refresh dari DB
    } catch (err: any) {
      setMessage({
        text: err.message || "Terjadi kesalahan saat menambahkan kategori.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${catName}"?`)) return;

    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus kategori");
      }

      setMessage({ text: `Kategori "${catName}" berhasil dihapus.`, type: "success" });
      await fetchCategories(); // refresh dari DB
    } catch (err: any) {
      setMessage({
        text: err.message || "Terjadi kesalahan saat menghapus kategori.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6">
        <div className="space-y-1">
          <p className="font-black font-nunito text-base text-foreground">
            Manajemen Master Kategori
          </p>
          <p className="text-xs sm:text-sm font-bold text-foreground/70 leading-relaxed">
            Hanya Administrator yang memiliki akses untuk mengelola taksonomi dan kategori kurasi fashion. Kategori yang ditambahkan akan langsung terintegrasi ke dalam filter koleksi dan opsi formulir unggah outfit.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`cartoon-card px-4 py-3 text-xs sm:text-sm font-black border border-border ${
            message.type === "success"
              ? "bg-secondary text-foreground"
              : "bg-primary text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Kategori Baru */}
        <div className="lg:col-span-1 cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-black font-nunito text-base text-foreground">Tambah Kategori Baru</h3>
            <p className="text-xs font-bold text-foreground/70 mt-0.5">Definisikan klasifikasi gaya busana</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-foreground mb-1.5">
                Nama Kategori <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Streetwear, Smart Casual, Old Money"
                className="w-full rounded-2xl border border-border bg-primary/5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-foreground mb-1.5">
                Deskripsi Gaya (Opsional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan ringkas mengenai karakteristik potongan, bahan, atau estetika gaya..."
                className="w-full rounded-2xl border border-border bg-primary/5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cartoon-btn w-full bg-primary py-2.5 text-xs sm:text-sm font-black text-white hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </form>
        </div>

        {/* Daftar Kategori Aktif */}
        <div className="lg:col-span-2 cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-black font-nunito text-base text-foreground">
                Daftar Kategori Terdaftar
              </h3>
              <p className="text-xs font-bold text-foreground/70 mt-0.5">
                {fetching ? "Memuat..." : `Total ${categories.length} kategori aktif`}
              </p>
            </div>
          </div>

          {fetching ? (
            <div className="py-8 text-center text-xs font-bold text-foreground/50">
              Memuat kategori dari database...
            </div>
          ) : (
            <div className="space-y-2.5">
              {categories.map((cat, index) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 bg-primary/5 rounded-2xl border border-border shadow-cartoon-sm transition-all hover:-translate-y-1"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground/60 w-5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h4 className="font-black text-sm text-foreground">{cat.name}</h4>
                      <span className="rounded-2xl border border-border bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-foreground">
                        {cat.slug}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs font-bold text-foreground/70 pl-7 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {cat.slug !== "all" && (
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="cartoon-btn shrink-0 px-3 py-1 text-xs font-black bg-white text-primary border border-border hover:bg-primary hover:text-white transition-all"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
