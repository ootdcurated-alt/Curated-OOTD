"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const trimmedIdentifier = identifier.trim().toLowerCase();

      // 1. Cek Kredensial Master Admin bawaan
      if (
        (trimmedIdentifier === "adminootd" || trimmedIdentifier === "adminootd@gmail.com") &&
        password === "admin1027"
      ) {
        // Coba login via Supabase jika akun sudah disinkronkan
        try {
          const { error: supaErr } = await supabase.auth.signInWithPassword({
            email: "adminootd@gmail.com",
            password: "admin1027",
          });
          if (!supaErr) {
            router.push("/admin");
            router.refresh();
            return;
          }
        } catch {
          // Lanjut ke fallback session internal
        }

        // Set session admin fallback melalui API route internal
        const res = await fetch("/api/admin-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            username: trimmedIdentifier,
            password: password,
          }),
        });

        if (res.ok) {
          window.location.href = "/admin";
          return;
        }
      }

      let emailToUse = identifier.trim();

      // Jika input bukan format email (tidak ada @), cari email berdasarkan username di metadata/tabel profil atau format fallback
      if (!emailToUse.includes("@")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", emailToUse.toLowerCase())
          .maybeSingle();

        if (profile?.email) {
          emailToUse = profile.email;
        } else {
          emailToUse = `${emailToUse.toLowerCase()}@user.curatedootd.com`;
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        if (!identifier.includes("@") && error.message.includes("Invalid login credentials")) {
          throw new Error("Username atau kata sandi salah. Anda juga dapat masuk menggunakan email.");
        }
        throw error;
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk";
      if (msg.includes("Invalid login credentials")) {
        setError("Email/Username atau kata sandi tidak cocok.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="cartoon-card bg-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#2D2D2D] bg-[#FFE66D] shadow-[3px_3px_0px_#2D2D2D]">
            <img
              src="/logo-icon.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-black font-nunito text-[#2D2D2D]">
            Masuk ke Akun
          </CardTitle>
          <CardDescription className="text-xs font-bold text-[#2D2D2D]/70">
            Masuk dengan Nama Pengguna atau Email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tombol Login Google */}
          <div className="flex flex-col gap-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="identifier" className="text-xs font-black text-[#2D2D2D]">
                  Username atau Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Username atau @gmail.com"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  className="rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus-visible:ring-0 focus:outline-none"
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-black text-[#2D2D2D]">
                    Kata Sandi
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-black text-[#FF6B6B] underline underline-offset-2 hover:opacity-80"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus-visible:ring-0 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors p-1"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border-[2px] border-[#2D2D2D] bg-[#FFD8C0] p-3 text-xs font-black text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="cartoon-btn w-full bg-[#FF6B6B] text-white py-3 text-sm font-black"
                disabled={isLoading}
              >
                {isLoading ? "Sedang Masuk..." : "Masuk"}
              </button>
            </form>

            <div className="text-center text-xs font-bold text-[#2D2D2D]/70">
              Belum memiliki akun?{" "}
              <Link
                href="/auth/sign-up"
                className="font-black text-[#FF6B6B] underline underline-offset-4 hover:opacity-80"
              >
                Daftar sekarang
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
