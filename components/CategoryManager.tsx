"use client";

import { useEffect, useState } from "react";
import { Category, GenderCategory, syncCategoriesToLocal, saveGenders } from "@/lib/categories";
import { Users, Tag, Plus, Trash2, Sparkles, AlertCircle, Check } from "lucide-react";

export default function CategoryManager() {
  const [activeTab, setActiveTab] = useState<"gender" | "category">("gender");

  // State Kategori Gaya
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // State Gender
  const [genders, setGenders] = useState<GenderCategory[]>([]);
  const [genderName, setGenderName] = useState("");
  const [genderDesc, setGenderDesc] = useState("");
  const [genderLoading, setGenderLoading] = useState(false);
  const [genderFetching, setGenderFetching] = useState(true);

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Ambil Kategori Gaya dari API
  const fetchCategories = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.categories)) {
        // Hanya tampilkan kategori gaya murni
        const genderSlugs = new Set(["pria", "wanita", "anak-anak", "anak-pria", "anak-wanita"]);
        const styleOnly = json.categories.filter((c: Category) => !genderSlugs.has(c.slug.toLowerCase()));
        setCategories(styleOnly);
        syncCategoriesToLocal(json.categories);
      }
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  };

  // Ambil Gender dari API
  const fetchGenders = async () => {
    setGenderFetching(true);
    try {
      const res = await fetch("/api/genders");
      const json = await res.json();
      if (json.success && Array.isArray(json.genders)) {
        setGenders(json.genders);
        saveGenders(json.genders);
      }
    } catch {
      // ignore
    } finally {
      setGenderFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchGenders();

    const handleCatUpdate = () => fetchCategories();
    const handleGenUpdate = () => fetchGenders();

    window.addEventListener("categories_updated", handleCatUpdate);
    window.addEventListener("genders_updated", handleGenUpdate);

    return () => {
      window.removeEventListener("categories_updated", handleCatUpdate);
      window.removeEventListener("genders_updated", handleGenUpdate);
    };
  }, []);

  // Handler Tambah Kategori Gaya
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ text: "Nama kategori gaya tidak boleh kosong.", type: "error" });
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
      setMessage({ text: `Kategori gaya "${name}" berhasil ditambahkan.`, type: "success" });
      await fetchCategories();
    } catch (err: any) {
      setMessage({
        text: err.message || "Terjadi kesalahan saat menambahkan kategori.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler Hapus Kategori Gaya
  const handleDeleteCategory = async (id: string, catName: string) => {
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
      await fetchCategories();
    } catch (err: any) {
      setMessage({
        text: err.message || "Terjadi kesalahan saat menghapus kategori.",
        type: "error",
      });
    }
  };

  // Handler Tambah Gender Baru
  const handleCreateGender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genderName.trim()) {
      setMessage({ text: "Nama target gender tidak boleh kosong.", type: "error" });
      return;
    }

    setGenderLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/genders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: genderName, description: genderDesc }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menambahkan gender");
      }

      setGenderName("");
      setGenderDesc("");
      setMessage({ text: `Target gender "${genderName}" berhasil ditambahkan.`, type: "success" });
      await fetchGenders();
    } catch (err: any) {
      setMessage({
        text: err.message || "Terjadi kesalahan saat menambahkan gender.",
        type: "error",
      });
    } finally {
      setGenderLoading(false);
    }
  };

  // Handler Hapus Gender
  const handleDeleteGender = async (id: string, genName: string, slug: string) => {
    if (slug === "all" || slug === "pria" || slug === "wanita" || slug === "anak-anak") {
      alert("Gender utama sistem tidak dapat dihapus!");
      return;
    }

    if (!confirm(`Yakin ingin menghapus target gender "${genName}"?`)) return;

    try {
      const res = await fetch("/api/genders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, slug }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus gender");
      }

      setMessage({ text: `Gender "${genName}" berhasil dihapus.`, type: "success" });
      await fetchGenders();
    } catch (err: any) {
      setMessage({
        text: err.message || "Terjadi kesalahan saat menghapus gender.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Info Banner */}
      <div className="cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-black font-nunito text-lg text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pusat Manajemen Taksonomi &amp; Filter
            </p>
            <p className="text-xs sm:text-sm font-bold text-foreground/70 leading-relaxed">
              Kelola filter gender target (Pria, Wanita, Anak-anak beserta sub-kategori) dan kategori gaya busana yang muncul di beranda pengunjung.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="inline-flex items-center rounded-2xl border border-border bg-white/80 p-1 shadow-cartoon-sm self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab("gender");
                setMessage(null);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === "gender"
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Target Gender
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("category");
                setMessage(null);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === "category"
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              Kategori Gaya
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`cartoon-card px-4 py-3 text-xs sm:text-sm font-black border border-border flex items-center gap-2 ${
            message.type === "success"
              ? "bg-secondary text-foreground"
              : "bg-primary text-white"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAB 1: KELOLA GENDER */}
      {activeTab === "gender" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Form Tambah Gender Baru */}
          <div className="lg:col-span-1 cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-black font-nunito text-base text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Tambah Target Gender
              </h3>
              <p className="text-xs font-bold text-foreground/70 mt-0.5">
                Tambahkan filter gender atau kalangan pengguna baru
              </p>
            </div>

            <form onSubmit={handleCreateGender} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-foreground mb-1.5">
                  Nama Gender / Kalangan <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={genderName}
                  onChange={(e) => setGenderName(e.target.value)}
                  placeholder="Contoh: Unisex, Remaja, Balita"
                  className="w-full rounded-2xl border border-border bg-primary/5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-foreground mb-1.5">
                  Keterangan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={genderDesc}
                  onChange={(e) => setGenderDesc(e.target.value)}
                  placeholder="Deskripsi target busana untuk kalangan ini..."
                  className="w-full rounded-2xl border border-border bg-primary/5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={genderLoading}
                className="cartoon-btn w-full bg-primary py-2.5 text-xs sm:text-sm font-black text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {genderLoading ? "Menyimpan..." : "Simpan Gender"}
              </button>
            </form>
          </div>

          {/* Daftar Gender Aktif */}
          <div className="lg:col-span-2 cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black font-nunito text-base text-foreground">
                  Daftar Target Gender di Sistem
                </h3>
                <p className="text-xs font-bold text-foreground/70 mt-0.5">
                  Filter ini berada di bar atas beranda utama untuk memudahkan pengunjung memilih gender.
                </p>
              </div>
            </div>

            {genderFetching ? (
              <div className="py-8 text-center text-xs font-bold text-foreground/50">
                Memuat data gender...
              </div>
            ) : (
              <div className="space-y-3">
                {genders.map((gen, index) => {
                  const isCore =
                    gen.slug === "all" ||
                    gen.slug === "pria" ||
                    gen.slug === "wanita" ||
                    gen.slug === "anak-anak";

                  return (
                    <div
                      key={gen.id}
                      className="p-4 bg-white/80 rounded-2xl border border-border shadow-cartoon-sm transition-all hover:-translate-y-0.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-black text-foreground/50 w-5">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-base">
                            {gen.slug === "pria" && "👨"}
                            {gen.slug === "wanita" && "👩"}
                            {gen.slug === "anak-anak" && "👶"}
                            {gen.slug === "all" && "✨"}
                          </span>
                          <div>
                            <h4 className="font-black text-sm text-foreground flex items-center gap-2">
                              {gen.name}
                              {isCore && (
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-black uppercase text-foreground">
                                  Bawaan Sistem
                                </span>
                              )}
                            </h4>
                            <span className="text-[11px] font-mono font-bold text-foreground/60">
                              slug: {gen.slug}
                            </span>
                          </div>
                        </div>

                        {!isCore && (
                          <button
                            onClick={() => handleDeleteGender(gen.id, gen.name, gen.slug)}
                            className="cartoon-btn px-3 py-1 text-xs font-black bg-white text-destructive border border-border hover:bg-destructive hover:text-white transition-all flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Hapus
                          </button>
                        )}
                      </div>

                      {/* Info Sub-gender khusus Anak-Anak */}
                      {gen.slug === "anak-anak" && (
                        <div className="ml-7 mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                          <p className="text-[11px] font-black uppercase tracking-wider text-primary">
                            Sub-Filter Gender Anak (Otomatis Aktif di UI Beranda):
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs font-bold text-foreground">
                            <span className="bg-white px-2.5 py-1 rounded-lg border border-border shadow-cartoon-sm">
                              👦 Anak Pria (Laki-laki)
                            </span>
                            <span className="bg-white px-2.5 py-1 rounded-lg border border-border shadow-cartoon-sm">
                              👧 Anak Wanita (Perempuan)
                            </span>
                          </div>
                        </div>
                      )}

                      {gen.description && (
                        <p className="text-xs font-bold text-foreground/70 ml-7">
                          {gen.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA KATEGORI GAYA */}
      {activeTab === "category" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Form Tambah Kategori Baru */}
          <div className="lg:col-span-1 cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-black font-nunito text-base text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Tambah Kategori Gaya
              </h3>
              <p className="text-xs font-bold text-foreground/70 mt-0.5">
                Definisikan klasifikasi gaya busana
              </p>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
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
                className="cartoon-btn w-full bg-primary py-2.5 text-xs sm:text-sm font-black text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {loading ? "Menyimpan..." : "Simpan Kategori"}
              </button>
            </form>
          </div>

          {/* Daftar Kategori Aktif */}
          <div className="lg:col-span-2 cartoon-card bg-white/60 backdrop-blur-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black font-nunito text-base text-foreground">
                  Daftar Kategori Gaya Busana
                </h3>
                <p className="text-xs font-bold text-foreground/70 mt-0.5">
                  {fetching ? "Memuat..." : `Total ${categories.length} kategori gaya aktif`}
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
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
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
      )}
    </div>
  );
}
