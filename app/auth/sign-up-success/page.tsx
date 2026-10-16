import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-border/60 shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Pendaftaran Berhasil!
            </CardTitle>
            <CardDescription>Cek email Anda untuk konfirmasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Akun Anda telah berhasil dibuat. Jika konfirmasi email diaktifkan pada sistem, silakan periksa kotak masuk atau spam email Anda untuk memverifikasi akun.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Lanjut ke Halaman Masuk</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
