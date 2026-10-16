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
import { Eye, EyeOff, Check, X, Camera, User } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Aturan kriteria kata sandi
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[@$!%*?&]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  // Handler upload foto profil
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran foto maksimal 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload-avatar", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json.success && json.url) {
          setAvatarUrl(json.url);
        }
      } catch {
        // Fallback
      }
    }
  };

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validasi username
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setError("Silakan isi nama pengguna (username)");
      setIsLoading(false);
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setError("Username hanya boleh 3-20 karakter huruf kecil, angka, atau garis bawah (_)");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Kata sandi belum memenuhi semua kriteria keamanan.");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const effectiveEmail = email.trim() || `${cleanUsername}@user.curatedootd.com`;

      const { data, error } = await supabase.auth.signUp({
        email: effectiveEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: username.trim(),
            avatar_url: avatarUrl || "",
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      try {
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: cleanUsername,
            email: effectiveEmail,
            avatar_url: avatarUrl || "",
            created_at: new Date().toISOString(),
          });
        }
      } catch {
        // Abaikan jika tabel profiles belum dibuat
      }

      router.push("/auth/sign-up-success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran";
      if (msg.includes("already registered")) {
        setError("Email atau username ini sudah terdaftar. Silakan masuk.");
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
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#2D2D2D] bg-[#4ECDC4] shadow-[3px_3px_0px_#2D2D2D]">
            <img
              src="/logo-icon.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-black font-nunito text-[#2D2D2D]">
            Daftar Akun Baru
          </CardTitle>
          <CardDescription className="text-xs font-bold text-[#2D2D2D]/70">
            Bergabunglah bersama komunitas fashion Curated OOTD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Unggah Foto Profil */}
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/60">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <Camera className="h-5 w-5" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <label htmlFor="avatar-upload" className="text-xs text-primary font-medium hover:underline cursor-pointer">
                  {avatarUrl ? "Ganti Foto Profil" : "+ Tambah Foto Profil (Opsional)"}
                </label>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="username" className="text-xs font-black text-[#2D2D2D]">
                  Username <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Contoh: Nama Kamu"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus-visible:ring-0 focus:outline-none"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-xs font-black text-[#2D2D2D]">
                  Email (Opsional untuk login/reset sandi)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus-visible:ring-0 focus:outline-none"
                />
              </div>

              {/* Input Kata Sandi dengan Ikon Mata */}
              <div className="grid gap-1.5">
                <Label htmlFor="password" className="text-xs font-black text-[#2D2D2D]">
                  Kata Sandi <span className="text-[#FF6B6B]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Kata Sandi"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus-visible:ring-0 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors p-1"
                    aria-label={showPassword ? "Sembunyikan Kata Sandi" : "Lihat Kata Sandi"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Indikator Checklist Kriteria Sandi */}
                <div className="grid grid-cols-2 gap-1.5 rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] p-3 text-[11px] font-bold shadow-[2px_2px_0px_#2D2D2D] mt-1">
                  <div className={cn("flex items-center gap-1.5", hasMinLength ? "text-emerald-600" : "text-[#2D2D2D]/60")}>
                    {hasMinLength ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                    <span>Min. 8 Karakter</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasUppercase ? "text-emerald-600" : "text-[#2D2D2D]/60")}>
                    {hasUppercase ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                    <span>Huruf Besar (A-Z)</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasLowercase ? "text-emerald-600" : "text-[#2D2D2D]/60")}>
                    {hasLowercase ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                    <span>Huruf Kecil (a-z)</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasNumber ? "text-emerald-600" : "text-[#2D2D2D]/60")}>
                    {hasNumber ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                    <span>Angka (0-9)</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 col-span-2", hasSymbol ? "text-emerald-600" : "text-[#2D2D2D]/60")}>
                    {hasSymbol ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                    <span>Simbol (@$!%*?&)</span>
                  </div>
                </div>
              </div>

              {/* Input Ulangi Kata Sandi */}
              <div className="grid gap-1.5">
                <Label htmlFor="repeat-password" className="text-xs font-black text-[#2D2D2D]">
                  Ulangi Kata Sandi <span className="text-[#FF6B6B]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Ulangi Kata Sandi"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] focus-visible:ring-0 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors p-1"
                    aria-label={showRepeatPassword ? "Sembunyikan ulangi kata sandi" : "Lihat ulangi kata sandi"}
                  >
                    {showRepeatPassword ? (
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
                className="cartoon-btn w-full bg-[#4ECDC4] text-[#2D2D2D] py-3 text-sm font-black disabled:opacity-50"
                disabled={isLoading || !isPasswordValid}
              >
                {isLoading ? "Membuat Akun..." : "Daftar Akun"}
              </button>
            </form>

            <div className="text-center text-xs font-bold text-[#2D2D2D]/70">
              Sudah memiliki akun?{" "}
              <Link
                href="/auth/login"
                className="font-black text-[#FF6B6B] underline underline-offset-4 hover:opacity-80"
              >
                Masuk di sini
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
