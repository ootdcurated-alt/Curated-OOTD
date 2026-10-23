"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah menutup prompt (disimpan di session atau local storage)
    const dismissed = sessionStorage.getItem("pwa_prompt_dismissed");
    if (dismissed === "true") return;

    // Cek apakah sudah berjalan dalam mode standalone (aplikasi sudah terpasang)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Deteksi iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
      // Tampilkan banner setelah sedikit jeda
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Tangkap event instalasi browser (Chrome, Edge, Android browser, dll.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Munculkan popup banner
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Fallback timer: jika event belum terpancing (misal di development / desktop),
    // tetap tampilkan banner agar pengguna melihat interaksinya
    const fallbackTimer = setTimeout(() => {
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Jika browser tidak mendukung event otomatis langsung (misal di desktop browser),
      // beritahu cara pasang manual dari menu browser
      alert(
        "Untuk memasang aplikasi ini di perangkat Anda:\n\n1. Klik tombol menu browser (ikon titik tiga di kanan atas atau ikon bagikan).\n2. Pilih 'Tambahkan ke Layar Utama' atau 'Pasang Aplikasi'."
      );
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    // Simpan status agar tidak mengganggu lagi di sesi kunjungan ini
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center sm:left-auto sm:right-6 sm:bottom-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl dark:bg-card/95">
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-full p-1 text-foreground/40 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* Ikon Aplikasi */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/5 shadow-md">
            <Image
              src="/logo-icon.png"
              alt="My Curated OOTD"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>

          {/* Teks Judul dan Deskripsi */}
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-black leading-snug text-foreground">
              Pasang My Curated OOTD di HP Anda seperti aplikasi biasa?
            </h4>
            <p className="text-xs font-semibold text-foreground/60 leading-relaxed">
              Buka lebih cepat dari layar utama, tanpa repot buka browser.
            </p>
          </div>
        </div>

        {/* Petunjuk khusus iOS jika diklik pasang di iPhone/iPad */}
        {showIOSGuide && (
          <div className="mt-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs font-bold text-amber-900 dark:text-amber-200">
            📱 Cara pasang di iOS Safari:
            <ol className="mt-1 list-decimal list-inside space-y-0.5 font-medium">
              <li>Tekan ikon <strong>Bagikan (Share)</strong> di bagian bawah Safari.</li>
              <li>Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</li>
            </ol>
          </div>
        )}

        {/* Tombol Aksi: Nanti vs Pasang */}
        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 rounded-2xl bg-secondary/80 hover:bg-secondary py-2.5 text-xs sm:text-sm font-black text-foreground/80 transition-all active:scale-[0.98]"
          >
            Nanti
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 text-xs sm:text-sm font-black shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>Pasang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
