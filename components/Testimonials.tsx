"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquareQuote,
  Send,
  Trash2,
  Loader2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Review, ReviewStatus, REVIEW_STATUS_LABEL, formatReviewDate } from "@/lib/reviews";

interface TestimonialsProps {
  initialReviews: Review[];
  currentUserId: string | null;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

function StarRow({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          strokeWidth={2.5}
          className={`${className} ${n <= value ? "fill-[#FFC2D9] text-[#4A3B45]" : "text-[#4A3B45]/25"}`}
        />
      ))}
    </div>
  );
}

const STATUS_BADGE_STYLE: Record<ReviewStatus, string> = {
  pending: "bg-[#FFC2D9]",
  approved: "bg-[#FFE0EC]",
  rejected: "bg-[#CC3D72] text-white",
};

function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-[#F5D0E0] px-2 py-0.5 text-[9px] font-black uppercase text-[#4A3B45] ${STATUS_BADGE_STYLE[status]}`}
    >
      <Clock className="h-2.5 w-2.5" /> {REVIEW_STATUS_LABEL[status]}
    </span>
  );
}

export default function Testimonials({
  initialReviews,
  currentUserId,
  isLoggedIn,
  isAdmin = false,
}: TestimonialsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Testimoni resmi admin tersimpan dengan user_id NULL, jadi dikenali lewat
  // penanda is_admin_review agar form admin bisa menampilkan & menimpa miliknya.
  const seedReview = isAdmin
    ? initialReviews.find((r) => r.is_admin_review && !r.user_id)
    : currentUserId
      ? initialReviews.find((r) => r.user_id === currentUserId)
      : undefined;

  const [rating, setRating] = useState<number>(() => seedReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(() => seedReview?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myReview = isAdmin
    ? reviews.find((r) => r.is_admin_review && !r.user_id)
    : currentUserId
      ? reviews.find((r) => r.user_id === currentUserId)
      : undefined;

  // Ringkasan hanya menghitung ulasan yang sudah disetujui
  const approvedReviews = reviews.filter((r) => r.status === "approved");
  const totalReviews = approvedReviews.length;
  const averageRating =
    totalReviews > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approvedReviews.filter((r) => r.rating === star).length,
  }));

  // Admin memakai endpoint moderasi (service role) agar bisa menulis testimoni resmi
  const submitEndpoint = isAdmin ? "/api/admin/reviews" : "/api/reviews";

  const loadReviews = async () => {
    const res = await fetch("/api/reviews", { cache: "no-store" });
    const json = await res.json();
    if (json.success && Array.isArray(json.reviews)) {
      setReviews(json.reviews as Review[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (rating < 1) {
      setError("Pilih bintang 1 sampai 5 dulu ya.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(submitEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          // Testimoni resmi admin menimpa testimoni admin sebelumnya
          ...(isAdmin ? { replace_official: true } : {}),
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Ulasan gagal disimpan.");
      }

      if (isAdmin) {
        setNotice("Testimoni admin berhasil disimpan dan langsung tayang.");
      } else {
        setNotice(
          myReview
            ? "Ulasan Anda berhasil diperbarui dan menunggu persetujuan admin."
            : "Terima kasih! Ulasan Anda terkirim dan menunggu persetujuan admin."
        );
      }
      await loadReviews();
    } catch (err: any) {
      setError(err?.message || "Ulasan gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setNotice(null);
    setIsDeleting(true);
    try {
      const res = isAdmin && myReview
        ? await fetch(`/api/admin/reviews?id=${encodeURIComponent(myReview.id)}`, { method: "DELETE" })
        : await fetch("/api/reviews", { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Ulasan gagal dihapus.");
      }

      setRating(0);
      setHoverRating(0);
      setComment("");
      setNotice("Ulasan Anda sudah dihapus.");
      await loadReviews();
    } catch (err: any) {
      setError(err?.message || "Ulasan gagal dihapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section id="testimoni" className="space-y-5 sm:space-y-6">
      {/* ─── Ringkasan penilaian ─── */}
      <div className="cartoon-card bg-white p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 sm:gap-8 items-center">
        <div className="text-center sm:border-r sm:border-[#F5D0E0] sm:pr-8">
          <div className="text-4xl sm:text-5xl font-black font-nunito leading-none text-[#4A3B45]">
            {averageRating.toFixed(1)}
          </div>
          <div className="mt-2 flex justify-center">
            <StarRow value={Math.round(averageRating)} className="h-5 w-5" />
          </div>
          <p className="mt-1.5 text-xs font-bold text-[#4A3B45]/70">
            {totalReviews} ulasan
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-[#FFC2D9] text-[#4A3B45] px-3 py-0.5 rounded-full border border-[#F5D0E0] shadow-sm">
              Testimoni Pengguna
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-black font-nunito tracking-tight text-[#4A3B45]">
              Kata Mereka Tentang Curated OOTD
            </h2>
            <p className="mt-1 text-xs font-semibold text-[#4A3B45]/70 leading-relaxed">
              Ulasan asli dari pengguna yang sudah terdaftar dan masuk ke akun mereka.
            </p>
          </div>

          <div className="space-y-1.5">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-7 shrink-0 text-[11px] font-black text-[#4A3B45]">
                  {star} &starf;
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-[#F5D0E0] bg-[#FFF5F8]">
                  <div
                    className="h-full bg-[#FFC2D9]"
                    style={{ width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-[11px] font-bold text-[#4A3B45]/70">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Form ulasan / ajakan masuk ─── */}
      {isLoggedIn ? (
        <div className="cartoon-card bg-[#FFF5F8] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F5D0E0] bg-[#CC3D72] shadow-sm text-white">
              <MessageSquareQuote className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black font-nunito text-[#4A3B45]">
              {myReview
                ? isAdmin
                  ? "Perbarui Testimoni Admin"
                  : "Perbarui Ulasan Anda"
                : isAdmin
                  ? "Tulis Testimoni Admin"
                  : "Tulis Ulasan Anda"}
            </h3>
          </div>

          {isAdmin ? (
            <p className="text-xs font-semibold text-[#4A3B45]/70">
              Testimoni yang Anda tulis sebagai admin langsung tayang tanpa perlu persetujuan.
            </p>
          ) : myReview && myReview.status === "pending" ? (
            <p className="flex items-start gap-2 rounded-xl border border-[#F5D0E0] bg-[#FFC2D9] px-3 py-2 text-[11px] font-bold text-[#4A3B45]">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Ulasan Anda sedang menunggu persetujuan admin sebelum tampil untuk pengunjung lain.
            </p>
          ) : myReview && myReview.status === "rejected" ? (
            <p className="flex items-start gap-2 rounded-xl border border-[#F5D0E0] bg-[#CC3D72]/20 px-3 py-2 text-[11px] font-bold text-[#4A3B45]">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Ulasan Anda belum disetujui admin sehingga tidak tampil untuk pengunjung. Anda boleh memperbaiki dan mengirim ulang.
            </p>
          ) : (
            <p className="text-xs font-semibold text-[#4A3B45]/70">
              Ulasan yang Anda kirim akan tampil setelah disetujui oleh admin.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70">
                Penilaian Anda
              </label>
              <div className="mt-1.5 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Beri nilai ${n} bintang`}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      strokeWidth={2.5}
                      className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                        n <= (hoverRating || rating)
                          ? "fill-[#FFC2D9] text-[#4A3B45]"
                          : "text-[#4A3B45]/25"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-black text-[#4A3B45]">
                  {hoverRating || rating || 0}/5
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70"
              >
                Ulasan
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={600}
                rows={4}
                placeholder="Contoh: Rekomendasi outfitnya sangat membantu, padu padannya rapi dan mudah dipraktikkan!"
                className="mt-1.5 w-full rounded-2xl border border-[#F5D0E0] bg-white px-4 py-3 text-xs sm:text-sm font-bold text-[#4A3B45] placeholder:text-[#4A3B45]/40 focus:outline-none shadow-sm resize-none"
              />
              <p className="mt-1 text-right text-[10px] font-bold text-[#4A3B45]/50">
                {comment.length}/600
              </p>
            </div>

            {error && (
              <p className="rounded-xl border border-[#F5D0E0] bg-[#CC3D72]/20 px-3 py-2 text-[11px] font-bold text-[#4A3B45]">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl border border-[#F5D0E0] bg-[#FFE0EC] px-3 py-2 text-[11px] font-bold text-[#4A3B45]">
                {notice}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="cartoon-btn inline-flex items-center gap-2 bg-[#CC3D72] px-5 py-2.5 text-xs text-white disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "Menyimpan..." : myReview ? "Perbarui Ulasan" : "Kirim Ulasan"}
              </button>

              {myReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-white px-4 py-2 text-xs font-black text-[#4A3B45] shadow-sm transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Hapus Ulasan
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="cartoon-card bg-[#FFE0EC] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-black font-nunito text-[#4A3B45]">
              Sudah pernah mencoba Curated OOTD?
            </h3>
            <p className="max-w-md text-xs font-semibold text-[#4A3B45]/75 leading-relaxed">
              Masuk atau daftar akun terlebih dahulu untuk menulis ulasan dan memberi penilaian bintang 1-5.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/auth/login"
              className="cartoon-btn bg-white px-5 py-2.5 text-xs text-[#4A3B45]"
            >
              Masuk
            </Link>
            <Link
              href="/auth/sign-up"
              className="cartoon-btn bg-[#CC3D72] px-5 py-2.5 text-xs text-white"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}

      {/* ─── Daftar ulasan ─── */}
      {reviews.length === 0 ? (
        <div className="cartoon-card space-y-2 bg-white p-10 text-center">
          <Star className="mx-auto h-8 w-8 fill-[#FFC2D9] text-[#4A3B45]" strokeWidth={2.5} />
          <p className="text-sm font-black font-nunito text-[#4A3B45]">Belum Ada Ulasan</p>
          <p className="text-xs font-semibold text-[#4A3B45]/70">
            Jadilah yang pertama membagikan pengalaman Anda memakai Curated OOTD.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="cartoon-card flex flex-col gap-3 bg-white p-5">
              <div className="flex items-center gap-3">
                {review.avatar_url ? (
                  <img
                    src={review.avatar_url}
                    alt={review.display_name}
                    className="h-10 w-10 shrink-0 rounded-full border border-[#F5D0E0] object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F5D0E0] bg-[#FFC2D9] text-sm font-black text-[#4A3B45]">
                    {(review.display_name || "P").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black font-nunito text-[#4A3B45]">
                    {review.display_name}
                  </p>
                  <p className="text-[10px] font-bold text-[#4A3B45]/60">
                    {formatReviewDate(review.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {!!currentUserId && currentUserId === review.user_id && (
                    <span className="rounded-full border border-[#F5D0E0] bg-[#FFE0EC] px-2 py-0.5 text-[9px] font-black uppercase text-[#4A3B45]">
                      Anda
                    </span>
                  )}
                  {review.is_admin_review && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#F5D0E0] bg-[#F48FB1] px-2 py-0.5 text-[9px] font-black uppercase text-[#4A3B45]">
                      <ShieldCheck className="h-2.5 w-2.5" /> Admin
                    </span>
                  )}
                  {review.status !== "approved" && (
                    <StatusBadge status={review.status} />
                  )}
                </div>
              </div>

              <StarRow value={review.rating} />

              {review.comment && (
                <p className="whitespace-pre-line text-xs font-semibold leading-relaxed text-[#4A3B45]/80">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
