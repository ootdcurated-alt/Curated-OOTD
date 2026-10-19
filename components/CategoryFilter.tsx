"use client";

import { useEffect, useState } from "react";
import { Category, getStoredCategories, syncCategoriesToLocal } from "@/lib/categories";

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.categories) && json.categories.length > 0) {
        setCategories(json.categories);
        syncCategoriesToLocal(json.categories);
        return;
      }
    } catch {
      // fallback ke localStorage
    }
    setCategories(getStoredCategories());
  };

  useEffect(() => {
    loadCategories();

    const handleUpdate = () => loadCategories();
    window.addEventListener("categories_updated", handleUpdate);
    return () => window.removeEventListener("categories_updated", handleUpdate);
  }, []);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
          Kategori Gaya
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black tracking-tight transition-all ${
                isActive
                  ? "border-primary bg-primary text-white shadow-cartoon"
                  : "border-border bg-white/60 text-foreground backdrop-blur-md hover:bg-secondary hover:shadow-cartoon-sm"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
