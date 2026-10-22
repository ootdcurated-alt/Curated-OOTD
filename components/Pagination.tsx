"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // around current page

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const left = currentPage - delta;
    const right = currentPage + delta;

    pages.push(1);

    if (left > 2) {
      pages.push("...");
    }

    const start = Math.max(2, left);
    const end = Math.min(totalPages - 1, right);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex items-center justify-center gap-1.5 sm:gap-2 py-6 select-none"
    >
      {/* Tombol Sebelumnya */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Halaman Sebelumnya"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-all hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30 active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* List Nomor Halaman */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-7 sm:w-9 items-center justify-center text-sm font-semibold text-foreground/40"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-bold transition-all active:scale-95 ${
                isActive
                  ? "bg-primary text-white shadow-cartoon-sm"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Tombol Selanjutnya */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Halaman Selanjutnya"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-all hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30 active:scale-95"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
