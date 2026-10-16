import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-destructive font-medium">
          Detail kesalahan: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Terjadi kesalahan yang tidak diketahui saat autentikasi.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-border/60 shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Mohon Maaf, Terjadi Kesalahan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense>
              <ErrorContent searchParams={searchParams} />
            </Suspense>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Kembali ke Halaman Masuk</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
