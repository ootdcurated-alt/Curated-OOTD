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
      <div className="cartoon-card bg-white p-5 sm:p-6">
        <div className="space-y-1">
          <p className="font-black font-nunito text-base text-[#4A3B45]">
            Manajemen Master Kategori
          </p>
          <p className="text-xs sm:text-sm font-bold text-[#4A3B45]/70 leading-relaxed">
            Hanya Administrator yang memiliki akses untuk mengelola taksonomi dan kategori kurasi fashion. Kategori yang ditambahkan akan langsung terintegrasi ke dalam filter lookbook dan opsi formulir unggah outfit.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`cartoon-card px-4 py-3 text-xs sm:text-sm font-black border border-[#F5D0E0] ${
            message.type === "success"
              ? "bg-[#FFE0EC] text-[#4A3B45]"
              : "bg-[#CC3D72] text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Kategori Baru */}
        <div className="lg:col-span-1 cartoon-card bg-white p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#F0CBDC] pb-3">
            <h3 className="font-black font-nunito text-base text-[#4A3B45]">Tambah Kategori Baru</h3>
            <p className="text-xs font-bold text-[#4A3B45]/70 mt-0.5">Definisikan klasifikasi gaya busana</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#4A3B45] mb-1.5">
                Nama Kategori <span className="text-[#CC3D72]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Streetwear, Smart Casual, Old Money"
                className="w-full rounded-xl border border-[#F5D0E0] bg-[#FFF5F8] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] placeholder:text-[#4A3B45]/40 focus:outline-none focus:ring-2 focus:ring-[#CC3D72]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#4A3B45] mb-1.5">
                Deskripsi Gaya (Opsional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan ringkas mengenai karakteristik potongan, bahan, atau estetika gaya..."
                className="w-full rounded-xl border border-[#F5D0E0] bg-[#FFF5F8] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] placeholder:text-[#4A3B45]/40 focus:outline-none focus:ring-2 focus:ring-[#CC3D72] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cartoon-btn w-full bg-[#CC3D72] py-2.5 text-xs sm:text-sm font-black text-white hover:bg-[#B22F62] disabled:opacity-50 transition-opacity"
            >
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </form>
        </div>

        {/* Daftar Kategori Aktif */}
        <div className="lg:col-span-2 cartoon-card bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0CBDC] pb-3">
            <div>
              <h3 className="font-black font-nunito text-base text-[#4A3B45]">
                Daftar Kategori Terdaftar
              </h3>
              <p className="text-xs font-bold text-[#4A3B45]/70 mt-0.5">
                {fetching ? "Memuat..." : `Total ${categories.length} kategori aktif`}
              </p>
            </div>
          </div>

          {fetching ? (
            <div className="py-8 text-center text-xs font-bold text-[#4A3B45]/50">
              Memuat kategori dari database...
            </div>
          ) : (
            <div className="space-y-2.5">
              {categories.map((cat, index) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 bg-[#FFF5F8] rounded-xl border border-[#F5D0E0] shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#4A3B45]/60 w-5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h4 className="font-black text-sm text-[#4A3B45]">{cat.name}</h4>
                      <span className="rounded-lg border border-[#F5D0E0] bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-[#4A3B45]">
                        {cat.slug}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs font-bold text-[#4A3B45]/70 pl-7 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {cat.slug !== "all" && (
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="cartoon-btn shrink-0 px-3 py-1 text-xs font-black bg-white text-[#CC3D72] border border-[#F5D0E0] hover:bg-[#CC3D72] hover:text-white transition-colors"
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
