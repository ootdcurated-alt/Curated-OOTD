"use client";

import { useState, useEffect, useMemo } from "react";
import {
  OutfitCreationItem,
  PRESET_WARDROBE_ITEMS,
  saveUserCreatedOutfit,
  getUserCreatedOutfits,
  UserCustomOutfit,
  deleteUserCreatedOutfit,
} from "@/lib/creatorStore";
import { Category, getStoredCategories } from "@/lib/categories";
import OutfitInteractiveCanvas from "@/components/OutfitInteractiveCanvas";
import {
  Plus,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Check,
  Save,
  Shuffle,
  Sparkles,
  Palette,
  Shirt,
  Scissors,
  Watch,
  RotateCcw,
} from "lucide-react";

export default function OutfitStudio() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skinToneTarget, setSkinToneTarget] = useState("");
  const [canvasBg, setCanvasBg] = useState("#FFF8E7");

  // Selected items on canvas
  const [selectedItems, setSelectedItems] = useState<OutfitCreationItem[]>([]);

  // Real-time custom colors for Top, Bottom, Outer, Shoes, Accessory
  const [customColors, setCustomColors] = useState({
    top: "#CCCCCC",
    bottom: "#CCCCCC",
    outer: "#CCCCCC",
    shoes: "#CCCCCC",
    accessory: "#CCCCCC",
  });

  // Wardrobe catalog category filter (all, top, outer, bottom, shoes, accessory)
  const [catalogFilter, setCatalogFilter] = useState<string>("all");
  const [customWardrobe, setCustomWardrobe] = useState<OutfitCreationItem[]>(PRESET_WARDROBE_ITEMS);

  // New item input modal / expander
  const [showAddCustomItem, setShowAddCustomItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<"top" | "bottom" | "outer" | "shoes" | "accessory">("top");
  const [newItemBrand, setNewItemBrand] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [newItemPurchaseUrl, setNewItemPurchaseUrl] = useState("");
  const [newItemColor, setNewItemColor] = useState("#2D2D2D");

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [myCreations, setMyCreations] = useState<UserCustomOutfit[]>([]);

  useEffect(() => {
    setCategories(getStoredCategories());
    setMyCreations(getUserCreatedOutfits());

    const handleCreationsUpdate = () => {
      setMyCreations(getUserCreatedOutfits());
    };
    window.addEventListener("user_outfits_updated", handleCreationsUpdate);
    return () => window.removeEventListener("user_outfits_updated", handleCreationsUpdate);
  }, []);

  // Update item selection
  const handleToggleItem = (item: OutfitCreationItem) => {
    // Jika sudah ada item di kategori yang sama (selain accessory/outer jika mau ditukar langsung), kita tukar
    const exists = selectedItems.some((i) => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      // Ganti item yang sama kategorinya agar pas di slot top, bottom, shoes, dll
      const otherCategoryItems = selectedItems.filter((i) => i.category !== item.category);
      setSelectedItems([...otherCategoryItems, item]);

      // Set warna default item ke customColors jika tersedia
      if (item.hexColor) {
        setCustomColors((prev) => ({
          ...prev,
          [item.category]: item.hexColor!,
        }));
      }
    }
  };

  const handleRemoveItem = (item: OutfitCreationItem) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
  };

  const handleColorChange = (slot: "top" | "bottom" | "outer" | "shoes" | "accessory", color: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [slot]: color,
    }));
  };

  // Find individual slot items
  const topItem = selectedItems.find((i) => i.category === "top");
  const bottomItem = selectedItems.find((i) => i.category === "bottom");
  const outerItem = selectedItems.find((i) => i.category === "outer");
  const shoesItem = selectedItems.find((i) => i.category === "shoes");
  const accessoryItem = selectedItems.find((i) => i.category === "accessory");

  // Filter wardrobe list
  const filteredWardrobe = useMemo(() => {
    return customWardrobe.filter((item) => {
      if (catalogFilter !== "all" && item.category !== catalogFilter) {
        return false;
      }
      return true;
    });
  }, [customWardrobe, catalogFilter]);

  const handleRandomize = () => {
    const tops = customWardrobe.filter((i) => i.category === "top");
    const outers = customWardrobe.filter((i) => i.category === "outer");
    const bottoms = customWardrobe.filter((i) => i.category === "bottom");
    const shoes = customWardrobe.filter((i) => i.category === "shoes");
    const accs = customWardrobe.filter((i) => i.category === "accessory");

    const newSelection: OutfitCreationItem[] = [];
    const randomColors = { ...customColors };

    if (tops.length) {
      const chosenTop = tops[Math.floor(Math.random() * tops.length)];
      newSelection.push(chosenTop);
      if (chosenTop.hexColor) randomColors.top = chosenTop.hexColor;
    }
    if (outers.length && Math.random() > 0.4) {
      const chosenOuter = outers[Math.floor(Math.random() * outers.length)];
      newSelection.push(chosenOuter);
      if (chosenOuter.hexColor) randomColors.outer = chosenOuter.hexColor;
    }
    if (bottoms.length) {
      const chosenBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      newSelection.push(chosenBottom);
      if (chosenBottom.hexColor) randomColors.bottom = chosenBottom.hexColor;
    }
    if (shoes.length) {
      const chosenShoes = shoes[Math.floor(Math.random() * shoes.length)];
      newSelection.push(chosenShoes);
      if (chosenShoes.hexColor) randomColors.shoes = chosenShoes.hexColor;
    }
    if (accs.length) {
      const chosenAcc = accs[Math.floor(Math.random() * accs.length)];
      newSelection.push(chosenAcc);
      if (chosenAcc.hexColor) randomColors.accessory = chosenAcc.hexColor;
    }

    if (newSelection.length > 0) {
      setSelectedItems(newSelection);
      setCustomColors(randomColors);
    }
  };

  const totalOutfitPrice = selectedItems.reduce((acc, item) => acc + (item.price || 0), 0);

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemImageUrl.trim()) {
      alert("Nama pakaian dan URL foto wajib diisi!");
      return;
    }

    const created: OutfitCreationItem = {
      id: `custom-item-${Date.now()}`,
      category: newItemCategory,
      name: newItemName.trim(),
      brand: newItemBrand || "Brand Sendiri / Marketplace",
      price: newItemPrice ? parseInt(newItemPrice) : 0,
      imageUrl: newItemImageUrl,
      purchaseUrl: newItemPurchaseUrl || `https://shopee.co.id/search?keyword=${encodeURIComponent(newItemName)}`,
      hexColor: newItemColor,
    };

    setCustomWardrobe([created, ...customWardrobe]);
    handleToggleItem(created);

    setNewItemName("");
    setNewItemBrand("");
    setNewItemPrice("");
    setNewItemImageUrl("");
    setNewItemPurchaseUrl("");
    setShowAddCustomItem(false);
  };

  const handleSaveOutfit = () => {
    if (selectedItems.length === 0) {
      alert("Pilih minimal 1 item untuk membuat outfit!");
      return;
    }

    saveUserCreatedOutfit({
      title: title || "Kreasi OOTD Saya",
      description: description || "Kombinasi warna dan pakaian hasil padu padan personal.",
      skinToneRecommendation: skinToneTarget,
      category: selectedCategory,
      tags: [selectedCategory, skinToneTarget, "Custom Styling"],
      items: selectedItems,
      canvasBgColor: canvasBg,
      authorName: "Kreator OOTD",
      customColors: customColors,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-10">
      {/* Top Banner Studio */}
      <div className="cartoon-card bg-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2D2D2D] bg-[#FFE66D] px-3.5 py-1 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
              <Palette className="h-3.5 w-3.5 text-[#FF6B6B]" />
              Studio Padu Padan &amp; Kustomisasi Warna Busana
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-nunito tracking-tight text-[#2D2D2D]">
              Studio Desain &amp; Kustomisasi Outfit
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D]/75 leading-relaxed">
              Atur dan kombinasikan atasan, bawahan, serta aksesoris secara langsung. Anda dapat mengubah warna masing-masing pakaian sesuai selera, mengganti koleksi busana, dan langsung membeli produk aslinya!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRandomize}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2D2D2D] bg-[#FFF8E7] px-4 py-2 text-xs sm:text-sm font-black text-[#2D2D2D] shadow-[3px_3px_0px_#2D2D2D] hover:bg-[#FFE66D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <Shuffle className="h-4 w-4 text-[#A78BFA]" />
              Acak Kombinasi &amp; Warna
            </button>
            <button
              onClick={handleSaveOutfit}
              className="cartoon-btn inline-flex items-center gap-2 bg-[#FF6B6B] text-white px-6 py-2.5 text-xs sm:text-sm font-black"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Tersimpan!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Simpan Desain
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <OutfitInteractiveCanvas
            topItem={topItem}
            bottomItem={bottomItem}
            outerItem={outerItem}
            shoesItem={shoesItem}
            accessoryItem={accessoryItem}
            customColors={customColors}
            onColorChange={handleColorChange}
            onRemoveItem={handleRemoveItem}
            canvasBg={canvasBg}
          />

          {/* Quick Direct Purchase Checklist Bar */}
          <div className="cartoon-card bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2D2D2D]/20 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#2D2D2D] flex items-center gap-1.5 font-nunito">
                <ShoppingBag className="h-4 w-4 text-[#FF6B6B]" />
                Rincian Belanja Outfit ({selectedItems.length} Item Terpilih)
              </span>
              <span className="text-sm font-black text-[#2D2D2D] font-mono">
                Total: Rp {totalOutfitPrice.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="divide-y-2 divide-[#2D2D2D]/10 max-h-56 overflow-y-auto space-y-1 pr-1">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-10 w-10 rounded-xl object-cover border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] bg-[#FFF8E7]"
                    />
                    <div>
                      <p className="font-black text-[#2D2D2D] line-clamp-1 font-nunito">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-bold text-[#2D2D2D]/70 font-mono">
                        {item.brand} • Rp {(item.price || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <a
                    href={item.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-[#FFE66D] border-2 border-[#2D2D2D] px-3 py-1 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:bg-[#FFD8C0] transition-colors shrink-0"
                  >
                    Beli <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}

              {selectedItems.length === 0 && (
                <p className="py-4 text-center text-xs font-bold text-[#2D2D2D]/50">
                  Belum ada pakaian yang dipilih di kanvas.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Color Editor Panel & Wardrobe Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel Kustomisasi Warna Pakaian & Info Look */}
          <div className="cartoon-card bg-white p-5 sm:p-6 space-y-5">
            <div className="border-b-2 border-[#2D2D2D]/20 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-[#2D2D2D] font-nunito flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#FF6B6B]" />
                  Kustomisasi Warna Busana
                </h3>
                <p className="text-xs font-semibold text-[#2D2D2D]/70 mt-0.5">
                  Ubah warna atasan, bawahan, dan aksesoris Anda secara mandiri
                </p>
              </div>
            </div>

            {/* Color Pickers Grid untuk Setiap Bagian */}
            <div className="grid grid-cols-2 gap-3 bg-[#FFF8E7] p-3.5 rounded-2xl border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
              {/* Warna Atasan */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border-2 border-[#2D2D2D]">
                <span className="text-[10px] font-black uppercase text-[#2D2D2D] flex items-center gap-1 font-nunito">
                  <Shirt className="h-3 w-3 text-[#FF6B6B]" /> Warna Atasan
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColors.top}
                    onChange={(e) => handleColorChange("top", e.target.value)}
                    className="h-8 w-8 rounded-lg border-2 border-[#2D2D2D] cursor-pointer p-0 shadow-[1px_1px_0px_#2D2D2D]"
                  />
                  <input
                    type="text"
                    value={customColors.top}
                    onChange={(e) => handleColorChange("top", e.target.value)}
                    className="w-full text-[11px] font-mono font-bold border-2 border-[#2D2D2D] rounded-lg px-2 py-1 bg-white"
                  />
                </div>
              </div>

              {/* Warna Bawahan */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border-2 border-[#2D2D2D]">
                <span className="text-[10px] font-black uppercase text-[#2D2D2D] flex items-center gap-1 font-nunito">
                  <Scissors className="h-3 w-3 text-[#4ECDC4]" /> Warna Bawahan
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColors.bottom}
                    onChange={(e) => handleColorChange("bottom", e.target.value)}
                    className="h-8 w-8 rounded-lg border-2 border-[#2D2D2D] cursor-pointer p-0 shadow-[1px_1px_0px_#2D2D2D]"
                  />
                  <input
                    type="text"
                    value={customColors.bottom}
                    onChange={(e) => handleColorChange("bottom", e.target.value)}
                    className="w-full text-[11px] font-mono font-bold border-2 border-[#2D2D2D] rounded-lg px-2 py-1 bg-white"
                  />
                </div>
              </div>

              {/* Warna Aksesoris */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border-2 border-[#2D2D2D]">
                <span className="text-[10px] font-black uppercase text-[#2D2D2D] flex items-center gap-1 font-nunito">
                  <Watch className="h-3 w-3 text-[#FFE66D]" /> Warna Aksesoris
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColors.accessory}
                    onChange={(e) => handleColorChange("accessory", e.target.value)}
                    className="h-8 w-8 rounded-lg border-2 border-[#2D2D2D] cursor-pointer p-0 shadow-[1px_1px_0px_#2D2D2D]"
                  />
                  <input
                    type="text"
                    value={customColors.accessory}
                    onChange={(e) => handleColorChange("accessory", e.target.value)}
                    className="w-full text-[11px] font-mono font-bold border-2 border-[#2D2D2D] rounded-lg px-2 py-1 bg-white"
                  />
                </div>
              </div>

              {/* Warna Sepatu */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border-2 border-[#2D2D2D]">
                <span className="text-[10px] font-black uppercase text-[#2D2D2D] flex items-center gap-1 font-nunito">
                  <Sparkles className="h-3 w-3 text-[#A78BFA]" /> Warna Sepatu
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColors.shoes}
                    onChange={(e) => handleColorChange("shoes", e.target.value)}
                    className="h-8 w-8 rounded-lg border-2 border-[#2D2D2D] cursor-pointer p-0 shadow-[1px_1px_0px_#2D2D2D]"
                  />
                  <input
                    type="text"
                    value={customColors.shoes}
                    onChange={(e) => handleColorChange("shoes", e.target.value)}
                    className="w-full text-[11px] font-mono font-bold border-2 border-[#2D2D2D] rounded-lg px-2 py-1 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Judul & Deskripsi Look */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-black text-[#2D2D2D] mb-1 font-nunito">
                  Nama Gaya / Judul OOTD
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="misal: Daily Casual Earth Tone"
                  className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-3 py-2 text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus:outline-none focus:bg-[#FFF8E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#2D2D2D] mb-1 font-nunito">
                  Deskripsi Gaya &amp; Nuansa
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan paduan warna dan vibe outfit ini..."
                  className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-3 py-2 text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus:outline-none focus:bg-[#FFF8E7] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#2D2D2D] mb-1 font-nunito">
                    Kategori Look
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-3 py-2 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#2D2D2D] mb-1 font-nunito">
                    Warna Latar Kanvas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={canvasBg}
                      onChange={(e) => setCanvasBg(e.target.value)}
                      className="h-9 w-9 rounded-xl border-2 border-[#2D2D2D] cursor-pointer p-0 shadow-[2px_2px_0px_#2D2D2D]"
                    />
                    <span className="text-xs font-mono font-bold text-[#2D2D2D]">{canvasBg}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lemari Pilihan Pakaian */}
          <div className="cartoon-card bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2D2D2D]/20 pb-3">
              <div>
                <h3 className="font-black text-base text-[#2D2D2D] font-nunito">
                  Koleksi Lemari Pakaian
                </h3>
                <p className="text-xs font-semibold text-[#2D2D2D]/70 mt-0.5">
                  Klik pakaian untuk menempatkannya pada kanvas
                </p>
              </div>

              <button
                onClick={() => setShowAddCustomItem(!showAddCustomItem)}
                className="inline-flex items-center gap-1 rounded-full border-2 border-[#2D2D2D] bg-[#FFE66D] px-3 py-1.5 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Baju
              </button>
            </div>

            {/* Custom Item Form */}
            {showAddCustomItem && (
              <form
                onSubmit={handleCreateCustomItem}
                className="space-y-3 rounded-2xl border-2 border-[#2D2D2D] bg-[#FFF8E7] p-4 text-xs shadow-[3px_3px_0px_#2D2D2D]"
              >
                <h4 className="font-black text-[#2D2D2D] font-nunito text-sm">
                  Tambah Pakaian Custom Sendiri
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Baju (mis: Kaos Boxy Hitam)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-2.5 py-1.5 text-xs font-bold"
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-2.5 py-1.5 text-xs font-black"
                  >
                    <option value="top">Atasan (Top)</option>
                    <option value="bottom">Bawahan (Bottom)</option>
                    <option value="outer">Outerwear</option>
                    <option value="accessory">Aksesoris</option>
                    <option value="shoes">Sepatu (Shoes)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Brand (mis: Zara / Uniqlo)"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-2.5 py-1.5 text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Harga (Rp)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-2.5 py-1.5 text-xs font-bold"
                  />
                  <div className="flex items-center gap-1.5 bg-white px-2 rounded-xl border-2 border-[#2D2D2D]">
                    <span className="text-[10px] font-bold">Warna:</span>
                    <input
                      type="color"
                      value={newItemColor}
                      onChange={(e) => setNewItemColor(e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer p-0"
                    />
                  </div>
                </div>

                <input
                  type="url"
                  required
                  placeholder="URL Foto Pakaian (https://images.unsplash...)"
                  value={newItemImageUrl}
                  onChange={(e) => setNewItemImageUrl(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-2.5 py-1.5 text-xs font-bold"
                />

                <input
                  type="url"
                  placeholder="Link Pembelian / Marketplace (Shopee/Tokopedia)"
                  value={newItemPurchaseUrl}
                  onChange={(e) => setNewItemPurchaseUrl(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#2D2D2D] bg-white px-2.5 py-1.5 text-xs font-bold"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomItem(false)}
                    className="px-3 py-1.5 text-xs font-black rounded-full border-2 border-[#2D2D2D] bg-white hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-black rounded-full border-2 border-[#2D2D2D] bg-[#FF6B6B] text-white shadow-[2px_2px_0px_#2D2D2D]"
                  >
                    Simpan ke Lemari
                  </button>
                </div>
              </form>
            )}

            {/* Category Filter for Wardrobe */}
            <div className="flex flex-wrap gap-1.5 text-xs font-black">
              {[
                { label: "Semua", value: "all" },
                { label: "Atasan", value: "top" },
                { label: "Bawahan", value: "bottom" },
                { label: "Aksesoris", value: "accessory" },
                { label: "Outer", value: "outer" },
                { label: "Sepatu", value: "shoes" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setCatalogFilter(tab.value)}
                  className={`px-3 py-1 rounded-full border-2 border-[#2D2D2D] transition-all ${
                    catalogFilter === tab.value
                      ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_#2D2D2D] -translate-y-0.5"
                      : "bg-white text-[#2D2D2D] hover:bg-[#FFF8E7]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredWardrobe.map((item) => {
                const isSelected = selectedItems.some((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item)}
                    className={`group cursor-pointer rounded-2xl border-[3px] p-2.5 transition-all text-left relative ${
                      isSelected
                        ? "border-[#2D2D2D] bg-[#C8F7DC] shadow-[3px_3px_0px_#2D2D2D] -translate-y-0.5"
                        : "border-[#2D2D2D]/40 bg-white hover:border-[#2D2D2D] hover:shadow-[3px_3px_0px_#2D2D2D]"
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white border-2 border-[#2D2D2D]/20 mb-2">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center shadow-[1px_1px_0px_#2D2D2D]">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {item.hexColor && (
                        <div
                          className="absolute bottom-1.5 left-1.5 h-4 w-4 rounded-full border border-[#2D2D2D] shadow-xs"
                          style={{ backgroundColor: item.hexColor }}
                          title={`Warna: ${item.colorName || item.hexColor}`}
                        />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-black text-[#2D2D2D]/60 tracking-wider block font-nunito">
                        {item.category}
                      </span>
                      <h5 className="text-xs font-black text-[#2D2D2D] line-clamp-1 font-nunito">
                        {item.name}
                      </h5>
                      {item.price && (
                        <p className="text-[11px] font-bold text-[#2D2D2D]/80 font-mono">
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* User's Saved Creations Showcase */}
      {myCreations.length > 0 && (
        <div className="space-y-6 pt-6 border-t-2 border-[#2D2D2D]/20">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-nunito text-[#2D2D2D]">
              Galeri Desain Karya Anda ({myCreations.length})
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#2D2D2D]/70">
              Koleksi outfit hasil padu padan dan kustomisasi warna busana Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCreations.map((creation) => {
              const totalPrice = creation.items.reduce((acc, it) => acc + (it.price || 0), 0);
              return (
                <div
                  key={creation.id}
                  className="cartoon-card bg-white p-5 space-y-4"
                >
                  <div
                    className="rounded-2xl p-4 min-h-[190px] flex items-center justify-center relative overflow-hidden border-2 border-[#2D2D2D]"
                    style={{ backgroundColor: creation.canvasBgColor || "#FFF8E7" }}
                  >
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {creation.items.slice(0, 3).map((it) => (
                        <img
                          key={it.id}
                          src={it.imageUrl}
                          alt={it.name}
                          className="aspect-square w-full rounded-xl object-cover border-2 border-[#2D2D2D] bg-white shadow-[2px_2px_0px_#2D2D2D]"
                        />
                      ))}
                    </div>
                    {creation.items.length > 3 && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-black border-2 border-[#2D2D2D] shadow-[1px_1px_0px_#2D2D2D]">
                        +{creation.items.length - 3} lagi
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-full bg-[#FFE66D] border border-[#2D2D2D] px-2 py-0.5 text-[10px] font-black text-[#2D2D2D]">
                          #{creation.category}
                        </span>
                        {creation.customColors && (
                          <div className="flex -space-x-1 items-center">
                            {creation.customColors.top && (
                              <div
                                className="h-4 w-4 rounded-full border border-[#2D2D2D]"
                                style={{ backgroundColor: creation.customColors.top }}
                                title="Atasan"
                              />
                            )}
                            {creation.customColors.bottom && (
                              <div
                                className="h-4 w-4 rounded-full border border-[#2D2D2D]"
                                style={{ backgroundColor: creation.customColors.bottom }}
                                title="Bawahan"
                              />
                            )}
                            {creation.customColors.accessory && (
                              <div
                                className="h-4 w-4 rounded-full border border-[#2D2D2D]"
                                style={{ backgroundColor: creation.customColors.accessory }}
                                title="Aksesoris"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteUserCreatedOutfit(creation.id)}
                        className="text-[#2D2D2D]/50 hover:text-[#FF6B6B] transition-colors p-1"
                        title="Hapus Desain"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="font-black text-base text-[#2D2D2D] font-nunito line-clamp-1">
                      {creation.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#2D2D2D]/70 line-clamp-2">
                      {creation.description}
                    </p>

                    <div className="pt-2 border-t-2 border-[#2D2D2D]/10 flex items-center justify-between text-xs font-black">
                      <span className="text-[#2D2D2D]/60">
                        {creation.items.length} item pakaian
                      </span>
                      <span className="text-[#2D2D2D] font-mono">
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {creation.items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between text-[11px] bg-[#FFF8E7] px-2.5 py-1 rounded-lg border border-[#2D2D2D]/20">
                          <span className="line-clamp-1 font-bold text-[#2D2D2D]">{it.name}</span>
                          <a
                            href={it.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[#FF6B6B] font-black hover:underline shrink-0 ml-2"
                          >
                            Beli <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
