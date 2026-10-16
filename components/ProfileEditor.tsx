"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Eye, EyeOff, Check, X, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileEditorProps {
  initialUsername: string;
  initialEmail: string;
  initialAvatarUrl?: string;
  isAdmin?: boolean;
}

export default function ProfileEditor({
  initialUsername,
  initialEmail,
  initialAvatarUrl = "",
  isAdmin = false,
}: ProfileEditorProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [displayName, setDisplayName] = useState(initialUsername);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Aturan kriteria kata sandi jika diisi
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[@$!%*?&]/.test(newPassword);
  const isPasswordValid =
    newPassword.length === 0 ||
    (hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran foto maksimal 5MB" });
        return;
      }

      // Tampilkan preview lokal instan
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file ke server agar mendapatkan URL statis yang ringan dan permanen
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
        // Fallback tetap menggunakan data URL jika upload gagal
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (newPassword && !isPasswordValid) {
      setMessage({ type: "error", text: "Kata sandi baru belum memenuhi kriteria keamanan." });
      setIsLoading(false);
      return;
    }

    if (newPassword && newPassword !== repeatPassword) {
      setMessage({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok." });
      setIsLoading(false);
      return;
    }

    try {
      if (isAdmin) {
        // Update admin profile via API
        const res = await fetch("/api/admin-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_profile",
            avatar_url: avatarUrl,
            new_password: newPassword || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memperbarui profil admin");
      } else {
        // Update regular user via Supabase
        const supabase = createClient();
        const updateData: { data: any; password?: string } = {
          data: {
            avatar_url: avatarUrl,
            display_name: displayName,
          },
        };
        if (newPassword) {
          updateData.password = newPassword;
        }

        const { error } = await supabase.auth.updateUser(updateData);
        if (error) throw error;
      }

      setMessage({ type: "success", text: "Profil dan kata sandi berhasil diperbarui!" });
      setNewPassword("");
      setRepeatPassword("");
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan perubahan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cartoon-card bg-white p-6 sm:p-8 space-y-6">
      <div className="border-b-2 border-[#2D2D2D]/20 pb-4">
        <h2 className="text-xl sm:text-2xl font-black font-nunito flex items-center gap-2.5 text-[#2D2D2D]">
          {isAdmin ? <ShieldCheck className="h-6 w-6 text-[#FF6B6B]" /> : <User className="h-6 w-6 text-[#FF6B6B]" />}
          Pengaturan Akun &amp; Keamanan
        </h2>
        <p className="text-xs sm:text-sm font-bold text-[#2D2D2D]/70 mt-1">
          Perbarui foto profil, nama tampilan, dan kata sandi akun Anda.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Bagian Foto Profil */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-[#FFF8E7] border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
          <div className="relative group">
            <div className="h-24 w-24 rounded-2xl border-[3px] border-[#2D2D2D] shadow-[3px_3px_0px_#2D2D2D] flex items-center justify-center overflow-hidden bg-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-[#2D2D2D]/50" />
              )}
            </div>
            <label
              htmlFor="profile-avatar-upload"
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <Camera className="h-6 w-6 text-white" />
            </label>
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-black font-nunito text-sm sm:text-base text-[#2D2D2D]">Foto Profil</h3>
            <p className="text-xs font-bold text-[#2D2D2D]/70">
              Format JPG, PNG, atau WEBP. Ukuran file maksimal 2MB.
            </p>
            <label
              htmlFor="profile-avatar-upload"
              className="inline-block text-xs font-black text-[#FF6B6B] hover:underline cursor-pointer pt-1"
            >
              Pilih Foto Baru
            </label>
          </div>
        </div>

        {/* Info Username & Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="display-name" className="text-xs font-black text-[#2D2D2D]">Nama / Username</label>
            <input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isAdmin}
              className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="user-email" className="text-xs font-black text-[#2D2D2D]">Email</label>
            <input
              id="user-email"
              value={initialEmail}
              disabled
              className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2D] opacity-75 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="border-t-2 border-[#2D2D2D]/20 pt-5 space-y-4">
          <div>
            <h3 className="font-black font-nunito text-base text-[#2D2D2D]">Ganti Kata Sandi (Opsional)</h3>
            <p className="text-xs font-bold text-[#2D2D2D]/70 mt-0.5">
              Kosongkan jika Anda tidak ingin mengubah kata sandi.
            </p>
          </div>

          {/* Input Sandi Baru */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-black text-[#2D2D2D]">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan sandi baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/70 hover:text-[#2D2D2D] p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="repeat-new-password" className="text-xs font-black text-[#2D2D2D]">Ulangi Kata Sandi Baru</label>
              <div className="relative">
                <input
                  id="repeat-new-password"
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="Konfirmasi sandi baru"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#FFF8E7] px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-bold text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/70 hover:text-[#2D2D2D] p-1"
                >
                  {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Checklist kriteria jika user mulai mengetik sandi baru */}
          {newPassword.length > 0 && (
            <div className="rounded-xl bg-[#FFF8E7] p-3.5 border-2 border-[#2D2D2D] text-xs space-y-1.5 shadow-[2px_2px_0px_#2D2D2D]">
              <span className="font-black text-[#2D2D2D] block mb-1">
                Kriteria Kata Sandi Baru:
              </span>
              <div className={cn("flex items-center gap-1.5 font-bold", hasMinLength ? "text-emerald-700" : "text-[#2D2D2D]/60")}>
                {hasMinLength ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-[#FF6B6B]" />}
                <span>Minimal 8 karakter</span>
              </div>
              <div className={cn("flex items-center gap-1.5 font-bold", hasUppercase ? "text-emerald-700" : "text-[#2D2D2D]/60")}>
                {hasUppercase ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-[#FF6B6B]" />}
                <span>Huruf besar (A-Z)</span>
              </div>
              <div className={cn("flex items-center gap-1.5 font-bold", hasLowercase ? "text-emerald-700" : "text-[#2D2D2D]/60")}>
                {hasLowercase ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-[#FF6B6B]" />}
                <span>Huruf kecil (a-z)</span>
              </div>
              <div className={cn("flex items-center gap-1.5 font-bold", hasNumber ? "text-emerald-700" : "text-[#2D2D2D]/60")}>
                {hasNumber ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-[#FF6B6B]" />}
                <span>Angka (0-9)</span>
              </div>
              <div className={cn("flex items-center gap-1.5 font-bold", hasSymbol ? "text-emerald-700" : "text-[#2D2D2D]/60")}>
                {hasSymbol ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-[#FF6B6B]" />}
                <span>Simbol (@$!%*?&amp;)</span>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div
            className={cn(
              "rounded-xl p-3.5 text-xs sm:text-sm font-black border-2 border-[#2D2D2D]",
              message.type === "success"
                ? "bg-[#C8F7DC] text-[#2D2D2D]"
                : "bg-[#FF6B6B] text-white"
            )}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="cartoon-btn w-full bg-[#FF6B6B] text-white py-3 text-sm font-black hover:bg-[#ff5252] disabled:opacity-50"
        >
          {isLoading ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}
        </button>
      </form>
    </div>
  );
}
