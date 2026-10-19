"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses permintaan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="cartoon-card bg-white">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F5D0E0] bg-[#FFC2D9] shadow-sm">
              <img
                src="/logo-icon.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-black font-nunito text-[#4A3B45]">
              Periksa Email Anda
            </CardTitle>
            <CardDescription className="text-xs font-bold text-[#4A3B45]/70">
              Petunjuk reset kata sandi telah dikirim
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-xs font-bold text-[#4A3B45]/80 leading-relaxed">
              Jika email Anda terdaftar, Anda akan menerima email berisi tautan untuk mengatur ulang kata sandi.
            </p>
            <Link
              href="/auth/login"
              className="cartoon-btn inline-block w-full bg-[#CC3D72] text-white py-3 text-xs sm:text-sm font-black text-center"
            >
              Kembali ke Halaman Masuk
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="cartoon-card bg-white">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F5D0E0] bg-[#FFC2D9] shadow-sm">
              <img
                src="/logo-icon.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-black font-nunito text-[#4A3B45]">
              Atur Ulang Kata Sandi
            </CardTitle>
            <CardDescription className="text-xs font-bold text-[#4A3B45]/70">
              Masukkan alamat email Anda untuk menerima tautan reset kata sandi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-xs font-black text-[#4A3B45]">
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-[#F5D0E0] bg-[#FFF5F8] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] shadow-sm focus-visible:ring-0 focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-[#F5D0E0] bg-[#FFE3EC] p-3 text-xs font-black text-[#4A3B45] shadow-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="cartoon-btn w-full bg-[#CC3D72] text-white py-3 text-sm font-black disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Mengirim Tautan..." : "Kirim Tautan Reset"}
              </button>

              <div className="mt-4 text-center text-xs font-bold text-[#4A3B45]/70">
                Ingat kata sandi Anda?{" "}
                <Link
                  href="/auth/login"
                  className="font-black text-[#CC3D72] underline underline-offset-4 hover:opacity-80"
                >
                  Masuk kembali
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
