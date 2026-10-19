"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface GuestGuardLinkProps {
  href: string;
  isLoggedIn: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
}

/**
 * Renders as a normal Link for logged-in users.
 * For guests, redirects to /auth/login?next=<href> instead.
 */
export default function GuestGuardLink({
  href,
  isLoggedIn,
  children,
  className,
  onClick,
  "aria-label": ariaLabel,
}: GuestGuardLinkProps) {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <Link href={href} className={className} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        onClick?.();
        router.push(`/auth/login?next=${encodeURIComponent(href)}`);
      }}
    >
      {children}
    </button>
  );
}
