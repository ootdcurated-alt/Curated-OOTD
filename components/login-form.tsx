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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
        try {
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
        } catch {
          // API route tidak tersedia — gunakan localStorage fallback
        }

        // Fallback terakhir: simpan flag di sessionStorage dan redirect
        sessionStorage.setItem("admin_fallback_auth", "adminootd_authenticated");
        window.location.href = "/admin";
        return;
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


  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal masuk dengan Akun Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
            Masuk ke Akun
          </CardTitle>
          <CardDescription className="text-xs font-bold text-[#4A3B45]/70">
            Masuk dengan Gmail atau Username / Email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tombol Login Google */}
          <div className="flex flex-col gap-4">
            {/* Tombol Login Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 font-black text-xs sm:text-sm rounded-full border border-[#F5D0E0] bg-white text-[#4A3B45] shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-md transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              {isGoogleLoading ? "Menghubungkan ke Google..." : "Masuk dengan Google"}
            </button>

            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#F0CBDC]" />
              <span className="absolute bg-white px-3 text-[10px] font-black uppercase tracking-wider text-[#4A3B45]/60">
                atau
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="identifier" className="text-xs font-black text-[#4A3B45]">
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
                  className="rounded-xl border border-[#F5D0E0] bg-[#FFF5F8] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] shadow-sm focus-visible:ring-0 focus:outline-none"
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-black text-[#4A3B45]">
                    Kata Sandi
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-black text-[#CC3D72] underline underline-offset-2 hover:opacity-80"
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
                    className="rounded-xl border border-[#F5D0E0] bg-[#FFF5F8] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#4A3B45] shadow-sm focus-visible:ring-0 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A3B45]/60 hover:text-[#4A3B45] transition-colors p-1"
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
                <div className="rounded-xl border border-[#F5D0E0] bg-[#FFE3EC] p-3 text-xs font-black text-[#4A3B45] shadow-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="cartoon-btn w-full bg-[#CC3D72] text-white py-3 text-sm font-black"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? "Sedang Masuk..." : "Masuk"}
              </button>
            </form>

            <div className="text-center text-xs font-bold text-[#4A3B45]/70">
              Belum memiliki akun?{" "}
              <Link
                href="/auth/sign-up"
                className="font-black text-[#CC3D72] underline underline-offset-4 hover:opacity-80"
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
