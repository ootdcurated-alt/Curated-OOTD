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
import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // State untuk alur OTP
  const [step, setStep] = useState<"register" | "otp">("register");
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const router = useRouter();

  // Aturan kriteria kata sandi
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[@$!%*?&]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validasi nama pengguna / username
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Silakan isi nama pengguna / username");
      setIsLoading(false);
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      setError("Nama pengguna harus memiliki panjang 3 hingga 30 karakter");
      setIsLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Silakan masukkan alamat email Gmail / aktif Anda untuk menerima kode OTP.");
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
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          username: trimmedUsername,
          displayName: trimmedUsername,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses pendaftaran");
      }

      // Alihkan ke step input kode OTP yang dikirimkan ke email
      setStep("otp");
      setResendCountdown(60);

      // Jika devOtp tersedia (misal App Password Gmail belum di-set di .env.local),
      // otomatis isi atau tampilkan agar pengguna bisa lanjut dengan nyaman
      if (json.devOtp) {
        setOtpCode(json.devOtp);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran";
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("Email atau username ini sudah terdaftar. Silakan masuk.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Verifikasi Kode OTP dari Email
  const handleVerifyOtp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError("Masukkan 6 digit kode OTP yang diterima di email Anda.");
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);

    try {
      const supabase = createClient();
      const cleanEmail = email.trim().toLowerCase();

      // Verifikasi token OTP yang dibuat via Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: otpCode.trim(),
        type: "signup",
      });

      if (error) {
        // Fallback coba type 'email'
        const fallbackRes = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: otpCode.trim(),
          type: "email",
        });
        if (fallbackRes.error) throw error;
      }

      const profileUsername = username.trim();

      await supabase.auth.updateUser({
        data: { username: profileUsername },
      });

      const syncRes = await fetch("/api/profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: profileUsername }),
      });
      const syncJson = await syncRes.json();
      if (!syncRes.ok || !syncJson.success) {
        console.warn("Profile sync setelah OTP:", syncJson.message);
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kode OTP salah atau telah kadaluarsa.";
      setError(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Kirim Ulang OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setIsResendingOtp(true);
    setError(null);
    try {
      const trimmedUsername = username.trim();

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          username: trimmedUsername,
          displayName: trimmedUsername,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengirim ulang OTP");
      }

      if (json.devOtp) {
        setOtpCode(json.devOtp);
      }
      setResendCountdown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim ulang OTP.");
    } finally {
      setIsResendingOtp(false);
    }
  };


  const handleGoogleSignUp = async () => {
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
      setError(err instanceof Error ? err.message : "Gagal mendaftar dengan Akun Google");
      setIsGoogleLoading(false);
    }
  };

  // Countdown effect untuk tombol kirim ulang OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="cartoon-card bg-white/60 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <Link 
            href="/" 
            className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary shadow-cartoon-sm hover:scale-110 hover:rotate-6 transition-all duration-300 group"
            title="Kembali ke Beranda"
          >
            <img
              src="/logo-icon.png"
              alt="Logo"
              className="h-8 w-8 object-contain group-hover:scale-110 transition-transform"
            />
          </Link>
          <CardTitle className="text-2xl font-black font-nunito tracking-tighter text-foreground">
            {step === "otp" ? "Verifikasi Kode OTP" : "Daftar Akun Baru"}
          </CardTitle>
          <CardDescription className="text-xs font-bold text-foreground/70">
            {step === "otp"
              ? `Masukkan 6 digit kode OTP yang dikirimkan ke ${email}`
              : "Bergabunglah bersama komunitas fashion Curated OOTD"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "otp" ? (
            /* FORM VERIFIKASI OTP */
            <div className="flex flex-col gap-4">
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="grid gap-2 text-center">
                  <Label htmlFor="otp" className="text-xs font-black text-foreground">
                    Kode Verifikasi (OTP)
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="Contoh: 123456"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ""))}
                    className="text-center tracking-[0.3em] font-mono text-lg font-black rounded-2xl border border-border bg-white/60 py-3 shadow-cartoon-sm focus-visible:ring-0 focus:outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Cek kotak masuk atau folder spam di email <strong>{email}</strong>
                  </p>
                </div>

                {error && (
                  <div className="rounded-2xl border border-border bg-primary/10 p-3 text-xs font-black text-foreground shadow-cartoon-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingOtp || !otpCode.trim()}
                  className="cartoon-btn w-full bg-primary text-white py-3 text-sm font-black disabled:opacity-50"
                >
                  {isVerifyingOtp ? "Memverifikasi..." : "Konfirmasi & Masuk"}
                </button>
              </form>

              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={resendCountdown > 0 || isResendingOtp}
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {resendCountdown > 0
                    ? `Kirim ulang OTP dalam (${resendCountdown}s)`
                    : isResendingOtp
                    ? "Mengirimkan ulang..."
                    : "Kirim Ulang Kode OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setError(null);
                  }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  &larr; Ubah email atau data pendaftaran
                </button>
              </div>
            </div>
          ) : (
            /* FORM PENDAFTARAN AWAL */
            <div className="flex flex-col gap-4">
              {/* Tombol Daftar dengan Google */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 font-black text-xs sm:text-sm rounded-full border border-border bg-white text-foreground shadow-cartoon-sm hover:-translate-y-1 hover:shadow-cartoon active:scale-95 transition-all disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                {isGoogleLoading ? "Menghubungkan..." : "Daftar dengan Google"}
              </button>

              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-border" />
                <span className="absolute bg-white px-3 text-[10px] font-black uppercase tracking-widest text-foreground/60">
                  atau isi formulir
                </span>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="username" className="text-xs font-black text-foreground">
                    Username <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Contoh: nama_kamu"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-2xl border border-border bg-white/60 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-cartoon-sm focus-visible:ring-0 focus:outline-none"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-xs font-black text-foreground">
                    Alamat Email (Gmail) <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@gmail.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-2xl border border-border bg-white/60 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-cartoon-sm focus-visible:ring-0 focus:outline-none"
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Kode OTP akan dikirimkan langsung ke email ini untuk verifikasi.
                  </span>
                </div>

                {/* Input Kata Sandi dengan Ikon Mata */}
                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="text-xs font-black text-foreground">
                    Kata Sandi <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan Kata Sandi"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-2xl border border-border bg-white/60 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-cartoon-sm focus-visible:ring-0 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors p-1"
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
                  <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-white/60 p-3 text-[11px] font-bold shadow-cartoon-sm mt-1">
                    <div className={cn("flex items-center gap-1.5", hasMinLength ? "text-emerald-600" : "text-foreground/60")}>
                      {hasMinLength ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      <span>Min. 8 Karakter</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5", hasUppercase ? "text-emerald-600" : "text-foreground/60")}>
                      {hasUppercase ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      <span>Huruf Besar (A-Z)</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5", hasLowercase ? "text-emerald-600" : "text-foreground/60")}>
                      {hasLowercase ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      <span>Huruf Kecil (a-z)</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5", hasNumber ? "text-emerald-600" : "text-foreground/60")}>
                      {hasNumber ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      <span>Angka (0-9)</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5 col-span-2", hasSymbol ? "text-emerald-600" : "text-foreground/60")}>
                      {hasSymbol ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      <span>Simbol (@$!%*?&)</span>
                    </div>
                  </div>
                </div>

                {/* Input Ulangi Kata Sandi */}
                <div className="grid gap-1.5">
                  <Label htmlFor="repeat-password" className="text-xs font-black text-foreground">
                    Ulangi Kata Sandi <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="repeat-password"
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Ulangi Kata Sandi"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="rounded-2xl border border-border bg-white/60 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-cartoon-sm focus-visible:ring-0 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors p-1"
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
                  <div className="rounded-2xl border border-border bg-primary/10 p-3 text-xs font-black text-foreground shadow-cartoon-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="cartoon-btn w-full bg-primary text-white py-3 text-sm font-black disabled:opacity-50"
                  disabled={isLoading || isGoogleLoading || !isPasswordValid}
                >
                  {isLoading ? "Mengirimkan OTP..." : "Daftar & Minta OTP"}
                </button>
              </form>

              <div className="text-center text-xs font-bold text-foreground/70">
                Sudah memiliki akun?{" "}
                <Link
                  href="/auth/login"
                  className="font-black text-primary underline underline-offset-4 hover:opacity-80"
                >
                  Masuk di sini
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
