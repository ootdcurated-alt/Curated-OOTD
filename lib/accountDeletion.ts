export const DELETION_GRACE_DAYS = 3;

export const PENDING_ACCOUNT_DELETION_AT = "pending_account_deletion_at";
export const ACCOUNT_DELETION_DEADLINE_AT = "account_deletion_deadline_at";

export type AccountDeletionState =
  | { isPending: false }
  | {
      isPending: true;
      pendingAt: string;
      deadlineAt: string;
      isExpired: boolean;
    };

export function getAccountDeletionState(
  metadata: Record<string, unknown> | undefined | null
): AccountDeletionState {
  const pendingAt = metadata?.[PENDING_ACCOUNT_DELETION_AT];
  const deadlineAt = metadata?.[ACCOUNT_DELETION_DEADLINE_AT];
  if (typeof pendingAt !== "string" || typeof deadlineAt !== "string") {
    return { isPending: false };
  }
  const deadline = new Date(deadlineAt);
  if (Number.isNaN(deadline.getTime())) {
    return { isPending: false };
  }
  return {
    isPending: true,
    pendingAt,
    deadlineAt,
    isExpired: Date.now() > deadline.getTime(),
  };
}

export function buildDeletionMetadata(
  existing: Record<string, unknown> | undefined | null
): Record<string, unknown> {
  const now = new Date();
  const deadline = new Date(now.getTime() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000);
  return {
    ...(existing ?? {}),
    [PENDING_ACCOUNT_DELETION_AT]: now.toISOString(),
    [ACCOUNT_DELETION_DEADLINE_AT]: deadline.toISOString(),
  };
}

export function clearDeletionMetadata(
  existing: Record<string, unknown> | undefined | null
): Record<string, unknown> {
  const next = { ...(existing ?? {}) };
  delete next[PENDING_ACCOUNT_DELETION_AT];
  delete next[ACCOUNT_DELETION_DEADLINE_AT];
  return next;
}
