"use client";

import { useEffect, useState } from "react";
import { Category, getStoredCategories } from "@/lib/categories";

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(getStoredCategories());

    const handleUpdate = () => {
      setCategories(getStoredCategories());
    };

    window.addEventListener("categories_updated", handleUpdate);
    return () => {
      window.removeEventListener("categories_updated", handleUpdate);
    };
  }, []);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
              className={`shrink-0 rounded-full border-2 border-[#2D2D2D] px-4 py-2 text-xs font-black tracking-tight transition-all duration-150 ${
                isActive
                  ? "bg-[#FF6B6B] text-white shadow-[3px_3px_0px_#2D2D2D] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-[#FFF8E7] text-[#2D2D2D] hover:bg-[#FFE66D] hover:shadow-[2px_2px_0px_#2D2D2D]"
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
