import { createClient } from "@/lib/supabase/server";
import ShopTheLook from "@/components/ShopTheLook";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";


interface OutfitPageProps {
  params: Promise<{ id: string }>;
}

export default async function OutfitDetailPage({ params }: OutfitPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch outfit data
  const { data: outfit, error } = await supabase
    .from("outfits")
    .select("*, outfit_items(*)")
    .eq("id", id)
    .single();

  if (error || !outfit) {
    // Fallback placeholder display if DB table is not yet migrated/populated
    return (
      <main className="container max-w-5xl py-8 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div className="rounded-xl border border-border p-8 text-center">
          <h1 className="text-xl font-bold">Outfit #{id}</h1>
          <p className="mt-2 text-muted-foreground">
            Data outfit belum tersedia di database atau sedang disiapkan.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-5xl py-8 px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Galeri
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {outfit.title}
        </h1>
        {outfit.description && (
          <p className="mt-2 text-muted-foreground">{outfit.description}</p>
        )}
      </div>

      <ShopTheLook
        imageUrl={outfit.image_url}
        items={outfit.outfit_items || []}
        outfitId={outfit.id}
      />
    </main>
  );
}
