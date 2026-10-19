"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Star,
  Check,
  X,
  Trash2,
  Loader2,
  ShieldCheck,
  Clock,
  MessageSquareQuote,
  Send,
  Inbox,
  Search,
  Pencil,
  AlertTriangle,
  CircleSlash,
} from "lucide-react";
import {
  Review,
  ReviewStatus,
  REVIEW_STATUS_LABEL,
  formatReviewDateTime,
} from "@/lib/reviews";

const HIGHLIGHT_EVENT = "admin:highlight-review";

interface AdminReviewManagerProps {
  initialReviews: Review[];
}

type FilterKey = "all" | ReviewStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLE: Record<ReviewStatus, string> = {
  pending: "bg-[#FFC2D9] text-[#4A3B45]",
  approved: "bg-[#FFE0EC] text-[#4A3B45]",
  rejected: "bg-[#CC3D72] text-white",
};

function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-[#F5D0E0] px-2 py-0.5 text-[9px] font-black uppercase ${STATUS_STYLE[status]}`}
    >
      {status === "approved" && <Check className="h-2.5 w-2.5" />}
      {status === "pending" && <Clock className="h-2.5 w-2.5" />}
      {status === "rejected" && <CircleSlash className="h-2.5 w-2.5" />}
      {REVIEW_STATUS_LABEL[status]}
    </span>
  );
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

function StarPicker({
  value,
  onChange,
  size = "h-7 w-7",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Beri nilai ${n} bintang`}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            strokeWidth={2.5}
            className={`${size} transition-colors ${
              n <= (hover || value) ? "fill-[#FFC2D9] text-[#4A3B45]" : "text-[#4A3B45]/25"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-black text-[#4A3B45]">{hover || value}/5</span>
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full border border-[#F5D0E0] object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F5D0E0] bg-[#FFC2D9] text-sm font-black text-[#4A3B45]">
      {(name || "P").charAt(0).toUpperCase()}
    </div>
  );
}

export default function AdminReviewManager({ initialReviews }: AdminReviewManagerProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // CREATE — form testimony manual
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState<ReviewStatus>("approved");
  const [isCreating, setIsCreating] = useState(false);

  // UPDATE — modal edit
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editName, setEditName] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // DELETE — modal konfirmasi
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorotan testimony yang diklik dari lonceng notifikasi
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const scrolledFor = useRef<string | null>(null);

  const focusReview = (id: string) => {
    setHighlightId(id);
    setFilter("all");
    setSearch("");
  };

  // Baca ?highlight=... saat halaman dibuka, lalu ikuti event dari lonceng
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("highlight");
    if (fromUrl) focusReview(fromUrl);

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail) focusReview(detail);
    };

    window.addEventListener(HIGHLIGHT_EVENT, handler);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!highlightId || scrolledFor.current === highlightId) return;
    const element = document.getElementById(`review-${highlightId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      scrolledFor.current = highlightId;
    }
  }, [highlightId, reviews]);

  const counts = useMemo(
    () => ({
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
      total: reviews.length,
    }),
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return reviews.filter((review) => {
      if (filter !== "all" && review.status !== filter) return false;
      if (!keyword) return true;
      return (
        review.display_name.toLowerCase().includes(keyword) ||
        review.comment.toLowerCase().includes(keyword)
      );
    });
  }, [reviews, filter, search]);

  const loadReviews = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.reviews)) {
        setReviews(json.reviews as Review[]);
      }
    } catch {
      // biarkan daftar lama tetap tampil
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  };

  const runAction = async (
    id: string,
    request: () => Promise<Response>,
    fallbackMessage: string
  ) => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      const res = await request();
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || fallbackMessage);
      setNotice(json.message || fallbackMessage);
      await loadReviews();
      return true;
    } catch (err: any) {
      setError(err?.message || fallbackMessage);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  // ─── APPROVE / REJECT ───
  const handleModerate = (id: string, status: ReviewStatus) =>
    runAction(
      id,
      () =>
        fetch("/api/admin/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        }),
      "Gagal memperbarui status testimony."
    );

  // ─── CREATE ───
  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (newRating < 1 || newRating > 5) {
      setError("Pilih bintang 1 sampai 5 dulu.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
          display_name: newName,
          status: newStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Testimoni gagal disimpan.");
      setNotice(json.message || "Testimoni berhasil ditambahkan.");
      setNewComment("");
      setNewName("");
      setNewRating(5);
      await loadReviews();
    } catch (err: any) {
      setError(err?.message || "Testimoni gagal disimpan.");
    } finally {
      setIsCreating(false);
    }
  };

  // ─── UPDATE ───
  const openEdit = (review: Review) => {
    setEditingReview(review);
    setEditName(review.display_name);
    setEditComment(review.comment);
    setEditRating(review.rating);
    setError(null);
    setNotice(null);
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingReview) return;

    if (editRating < 1 || editRating > 5) {
      setError("Pilih bintang 1 sampai 5 dulu.");
      return;
    }
    if (!editName.trim()) {
      setError("Nama pengirim tidak boleh kosong.");
      return;
    }

    setIsSavingEdit(true);
    const ok = await runAction(
      editingReview.id,
      () =>
        fetch("/api/admin/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingReview.id,
            display_name: editName,
            comment: editComment,
            rating: editRating,
          }),
        }),
      "Testimoni gagal diperbarui."
    );

    setIsSavingEdit(false);
    if (ok) setEditingReview(null);
  };

  // ─── DELETE ───
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const ok = await runAction(
      deleteTarget.id,
      () => fetch(`/api/admin/reviews?id=${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" }),
      "Testimoni gagal dihapus."
    );
    setIsDeleting(false);
    if (ok) setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* ─── Statistik status testimony ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="cartoon-card bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#4A3B45]/60">Pending</p>
          <p className="mt-1 text-3xl font-black font-nunito text-[#CC3D72]">{counts.pending}</p>
        </div>
        <div className="cartoon-card bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#4A3B45]/60">Approved</p>
          <p className="mt-1 text-3xl font-black font-nunito text-[#F48FB1]">{counts.approved}</p>
        </div>
        <div className="cartoon-card bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#4A3B45]/60">Rejected</p>
          <p className="mt-1 text-3xl font-black font-nunito text-[#4A3B45]/70">{counts.rejected}</p>
        </div>
        <div className="cartoon-card bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#4A3B45]/60">Total</p>
          <p className="mt-1 text-3xl font-black font-nunito text-[#4A3B45]">{counts.total}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[#F5D0E0] bg-[#CC3D72]/20 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4A3B45]" />
          <p className="text-xs font-bold text-[#4A3B45]">{error}</p>
        </div>
      )}
      {notice && (
        <p className="rounded-xl border border-[#F5D0E0] bg-[#FFE0EC] px-3 py-2 text-xs font-bold text-[#4A3B45]">
          {notice}
        </p>
      )}

      {/* ─── CREATE: form testimony manual admin ─── */}
      <div className="cartoon-card bg-[#FFF5F8] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F5D0E0] bg-[#F48FB1] shadow-sm text-[#4A3B45]">
            <MessageSquareQuote className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-black font-nunito text-[#4A3B45]">Tambah Testimony Manual</h3>
            <p className="text-[11px] font-semibold text-[#4A3B45]/70">
              Testimoni yang dibuat admin otomatis ditandai lencana Admin.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="admin-review-name"
                className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70"
              >
                Nama Pengirim (opsional)
              </label>
              <input
                id="admin-review-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={60}
                placeholder="Kosongkan untuk memakai nama tim"
                className="mt-1.5 w-full rounded-2xl border border-[#F5D0E0] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] placeholder:text-[#4A3B45]/40 shadow-sm focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="admin-review-status"
                className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70"
              >
                Status Awal
              </label>
              <select
                id="admin-review-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReviewStatus)}
                className="mt-1.5 w-full rounded-2xl border border-[#F5D0E0] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] shadow-sm focus:outline-none"
              >
                <option value="approved">Approved — langsung tayang</option>
                <option value="pending">Pending — perlu diperiksa</option>
                <option value="rejected">Rejected — tidak tayang</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70">
              Penilaian
            </label>
            <div className="mt-1.5">
              <StarPicker value={newRating} onChange={setNewRating} />
            </div>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={600}
            rows={3}
            placeholder="Tulis isi testimony..."
            className="w-full resize-none rounded-2xl border border-[#F5D0E0] bg-white px-4 py-3 text-xs sm:text-sm font-bold text-[#4A3B45] placeholder:text-[#4A3B45]/40 shadow-sm focus:outline-none"
          />

          <button
            type="submit"
            disabled={isCreating}
            className="cartoon-btn inline-flex items-center gap-2 bg-[#CC3D72] px-5 py-2.5 text-xs text-white disabled:opacity-60"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isCreating ? "Menyimpan..." : "Simpan Testimony"}
          </button>
        </form>
      </div>

      {/* ─── Pencarian + filter status ─── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A3B45]/50" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pengirim atau isi testimony..."
            className="w-full rounded-2xl border border-[#F5D0E0] bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] placeholder:text-[#4A3B45]/40 shadow-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => {
            const count =
              item.key === "all" ? counts.total : counts[item.key as ReviewStatus];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] px-4 py-2 text-xs font-black shadow-sm transition-all ${
                  filter === item.key
                    ? "bg-[#FFC2D9] text-[#4A3B45]"
                    : "bg-white text-[#4A3B45]/70 hover:bg-[#FFF5F8]"
                }`}
              >
                {item.label}
                <span className="ml-1 rounded-full border border-[#F5D0E0] bg-white px-1.5 text-[9px] font-black text-[#4A3B45]">
                  {count}
                </span>
              </button>
            );
          })}
          {isRefreshing && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#4A3B45]/60">
              <Loader2 className="h-3 w-3 animate-spin" /> Memuat ulang...
            </span>
          )}
        </div>
      </div>

      {/* ─── READ: daftar testimony ─── */}
      {filteredReviews.length === 0 ? (
        <div className="cartoon-card space-y-2 bg-white p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[#4A3B45]/40" />
          <p className="text-sm font-black font-nunito text-[#4A3B45]">Tidak Ada Testimony</p>
          <p className="text-xs font-semibold text-[#4A3B45]/70">
            {search.trim()
              ? "Tidak ada testimony yang cocok dengan pencarian Anda."
              : filter === "pending"
                ? "Semua testimony sudah ditinjau. Kerja bagus!"
                : "Belum ada testimony pada kategori ini."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <article
              key={review.id}
              id={`review-${review.id}`}
              className={`cartoon-card bg-white p-5 space-y-3 ${
                highlightId === review.id ? "ring-4 ring-[#CC3D72]" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={review.display_name} url={review.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black font-nunito text-[#4A3B45]">
                    {review.display_name}
                  </p>
                  <p className="text-[10px] font-bold text-[#4A3B45]/60">
                    Dikirim {formatReviewDateTime(review.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {review.is_admin_review && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#F5D0E0] bg-[#F48FB1] px-2 py-0.5 text-[9px] font-black uppercase text-[#4A3B45]">
                      <ShieldCheck className="h-2.5 w-2.5" /> Admin
                    </span>
                  )}
                  <StatusBadge status={review.status} />
                </div>
              </div>

              <StarRow value={review.rating} />

              {review.comment && (
                <p className="whitespace-pre-line text-xs font-semibold leading-relaxed text-[#4A3B45]/80">
                  {review.comment}
                </p>
              )}

              {review.status !== "pending" && review.reviewed_at && (
                <p className="text-[10px] font-bold text-[#4A3B45]/50">
                  {review.status === "approved" ? "Disetujui" : "Ditolak"} oleh{" "}
                  {review.reviewed_by || "admin"} pada {formatReviewDateTime(review.reviewed_at)}
                </p>
              )}
              {review.status === "pending" && (
                <p className="text-[10px] font-bold text-[#4A3B45]/50">
                  Menunggu pemeriksaan admin — belum tampil di halaman publik.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {review.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handleModerate(review.id, "approved")}
                    disabled={busyId === review.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-[#FFE0EC] px-4 py-2 text-xs font-black text-[#4A3B45] shadow-sm transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-60"
                  >
                    {busyId === review.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </button>
                )}

                {review.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => handleModerate(review.id, "rejected")}
                    disabled={busyId === review.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-[#CC3D72]/15 px-4 py-2 text-xs font-black text-[#4A3B45] shadow-sm transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-60"
                  >
                    <CircleSlash className="h-3.5 w-3.5" />
                    Reject
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openEdit(review)}
                  disabled={busyId === review.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-white px-4 py-2 text-xs font-black text-[#4A3B45] shadow-sm transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-60"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setNotice(null);
                    setDeleteTarget(review);
                  }}
                  disabled={busyId === review.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-[#CC3D72] px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ─── UPDATE: modal edit testimony ─── */}
      {editingReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#4A3B45]/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-[#F5D0E0] bg-white p-5 shadow-lg max-h-full overflow-y-auto">
            <div className="flex items-center justify-between gap-3 border-b border-[#F5D0E0] pb-3">
              <h3 className="text-base font-black font-nunito text-[#4A3B45]">Edit Testimony</h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                aria-label="Tutup"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#F5D0E0] bg-white text-[#4A3B45]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="edit-review-name"
                  className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70"
                >
                  Nama Pengirim
                </label>
                <input
                  id="edit-review-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={60}
                  className="mt-1.5 w-full rounded-2xl border border-[#F5D0E0] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] shadow-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70">
                  Penilaian
                </label>
                <div className="mt-1.5">
                  <StarPicker value={editRating} onChange={setEditRating} />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-review-comment"
                  className="text-[11px] font-black uppercase tracking-wider text-[#4A3B45]/70"
                >
                  Isi Testimony
                </label>
                <textarea
                  id="edit-review-comment"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  maxLength={600}
                  rows={4}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-[#F5D0E0] bg-white px-4 py-3 text-xs sm:text-sm font-bold text-[#4A3B45] shadow-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="cartoon-btn inline-flex items-center gap-2 bg-[#F48FB1] px-5 py-2.5 text-xs text-[#4A3B45] disabled:opacity-60"
                >
                  {isSavingEdit ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-white px-4 py-2 text-xs font-black text-[#4A3B45] shadow-sm disabled:opacity-60"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE: modal konfirmasi ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#4A3B45]/50 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-[#F5D0E0] bg-white p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F5D0E0] bg-[#CC3D72] text-white shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black font-nunito text-[#4A3B45]">Hapus Testimony?</h3>
                <p className="text-xs font-semibold leading-relaxed text-[#4A3B45]/75">
                  Testimony dari{" "}
                  <span className="font-black text-[#4A3B45]">{deleteTarget.display_name}</span> akan
                  dihapus permanen dari database. Tindakan ini tidak bisa dibatalkan.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="cartoon-btn inline-flex items-center gap-2 bg-[#CC3D72] px-5 py-2.5 text-xs text-white disabled:opacity-60"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D0E0] bg-white px-4 py-2 text-xs font-black text-[#4A3B45] shadow-sm disabled:opacity-60"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
