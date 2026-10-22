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

  const handleAction = () => {
    onClick?.();
    router.push(`/auth/login?next=${encodeURIComponent(href)}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${className || ""} cursor-pointer`}
      aria-label={ariaLabel}
      onClick={handleAction}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAction();
        }
      }}
    >
      {children}
    </div>
  );
}
