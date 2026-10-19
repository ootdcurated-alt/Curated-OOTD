"use client";

import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}

export default function LayoutWrapper({
  children,
  navbar,
  footer,
}: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Sembunyikan Navbar dan Footer di halaman auth dan admin agar lebih professional dan fokus
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAuthPage || isAdminPage) {
    return <div className="flex-1 flex flex-col w-full">{children}</div>;
  }

  return (
    <>
      {navbar}
      <div className="flex-1 w-full">{children}</div>
      {footer}
    </>
  );
}
