"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Password criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[@$!%*?&]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  const handleUpdatePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("Kata sandi belum memenuhi kriteria keamanan.");
      return;
    }
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/auth/login?reset=success");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui kata sandi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="cartoon-card bg-white/60 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <Link
            href="/"
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary shadow-cartoon-sm hover:scale-110 hover:rotate-6 transition-all duration-300 group"
            title="Kembali ke Beranda"
          >
            <img
              src="/logo-icon.png"
              alt="Logo"
              className="h-8 w-8 object-contain group-hover:scale-110 transition-transform"
            />
          </Link>
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter font-nunito">
            Kata Sandi Baru
          </CardTitle>
          <CardDescription className="text-xs font-bold text-foreground/70">
            Silakan buat kata sandi baru yang aman untuk akun Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="update-password" className="text-xs font-black text-foreground">
                Kata Sandi Baru
              </Label>
              <div className="relative">
                <Input
                  id="update-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat kata sandi baru"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl border border-border bg-white/60 px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-bold text-foreground shadow-cartoon-sm focus-visible:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Criteria checklist */}
              <div className="rounded-2xl bg-muted/40 p-3 border border-border/60 text-xs space-y-1.5 mt-1">
                <span className="font-bold text-foreground/60 block mb-1">
                  Kriteria Kata Sandi:
                </span>
                {[
                  [hasMinLength, "Minimal 8 karakter"],
                  [hasUppercase, "Huruf besar (A-Z)"],
                  [hasLowercase, "Huruf kecil (a-z)"],
                  [hasNumber, "Angka (0-9)"],
                  [hasSymbol, "Simbol (@$!%*?&)"],
                ].map(([ok, label]) => (
                  <div
                    key={String(label)}
                    className={cn(
                      "flex items-center gap-1.5 font-semibold",
                      ok ? "text-emerald-500" : "text-foreground/40"
                    )}
                  >
                    {ok ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    <span>{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-border bg-primary/10 p-3 text-xs font-black text-foreground shadow-cartoon-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="cartoon-btn w-full bg-primary text-white py-3 text-sm font-black disabled:opacity-50"
              disabled={isLoading || !isPasswordValid}
            >
              {isLoading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
