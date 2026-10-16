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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Kriteria sandi
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[@$!%*?&]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  const handleUpdatePassword = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!isPasswordValid) {
      setError("Kata sandi belum memenuhi kriteria keamanan.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui kata sandi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border/60 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Kata Sandi Baru</CardTitle>
          <CardDescription>
            Silakan buat kata sandi baru yang aman untuk akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium">Kata Sandi Baru</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi baru"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg pr-10"
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

              {/* Indikator Checklist Kriteria Sandi */}
              <div className="rounded-lg bg-muted/50 p-3 border border-border/60 text-xs space-y-1.5 mt-1">
                <span className="font-semibold text-muted-foreground block mb-1">
                  Kriteria Kata Sandi:
                </span>
                <div className={cn("flex items-center gap-1.5", hasMinLength ? "text-emerald-500 font-medium" : "text-muted-foreground")}>
                  {hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Minimal 8 karakter</span>
                </div>
                <div className={cn("flex items-center gap-1.5", hasUppercase ? "text-emerald-500 font-medium" : "text-muted-foreground")}>
                  {hasUppercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Huruf besar (A-Z)</span>
                </div>
                <div className={cn("flex items-center gap-1.5", hasLowercase ? "text-emerald-500 font-medium" : "text-muted-foreground")}>
                  {hasLowercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Huruf kecil (a-z)</span>
                </div>
                <div className={cn("flex items-center gap-1.5", hasNumber ? "text-emerald-500 font-medium" : "text-muted-foreground")}>
                  {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Angka (0-9)</span>
                </div>
                <div className={cn("flex items-center gap-1.5", hasSymbol ? "text-emerald-500 font-medium" : "text-muted-foreground")}>
                  {hasSymbol ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Simbol (@$!%*?&)</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-5 font-semibold rounded-lg"
              disabled={isLoading || !isPasswordValid}
            >
              {isLoading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
