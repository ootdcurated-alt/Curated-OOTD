export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  user_id: string | null;
  rating: number;
  comment: string;
  display_name: string;
  avatar_url: string;
  status: ReviewStatus;
  is_admin_review: boolean;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export const REVIEW_COLUMNS =
  "id, user_id, rating, comment, display_name, avatar_url, status, is_admin_review, reviewed_at, reviewed_by, created_at, updated_at";

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

/** Menormalkan nilai status apa pun dari database/request menjadi status valid. */
export function normalizeReviewStatus(value: unknown): ReviewStatus {
  return value === "approved" || value === "rejected" ? value : "pending";
}

/**
 * Ringkasan notifikasi admin yang dikirim dari tabel admin_notifications.
 */
export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  review_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export const NOTIFICATION_COLUMNS =
  "id, type, title, message, review_id, is_read, created_at, read_at";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Format tanggal memakai UTC agar hasil render di server dan browser selalu identik
export function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCDate()} ${MONTHS_ID[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Format tanggal + jam (UTC) untuk daftar notifikasi dan riwayat moderasi. */
export function formatReviewDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${date.getUTCDate()} ${MONTHS_ID[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hours}:${minutes} UTC`;
}
