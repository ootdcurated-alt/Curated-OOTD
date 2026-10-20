import { createClient } from "@/lib/supabase/server";
import ShopTheLook from "@/components/ShopTheLook";
import OutfitDescription from "@/components/OutfitDescription";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { normalizeOutfitItems } from "@/lib/outfitItems";

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
          className="cartoon-btn inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 text-xs font-black text-foreground border border-border mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center bg-white/30 backdrop-blur-md">
          <h1 className="text-xl font-black font-nunito">Outfit #{id}</h1>
          <p className="mt-2 text-xs font-bold text-foreground/60">
            Data outfit belum tersedia di database atau sedang disiapkan.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-5xl py-6 sm:py-10 px-4 sm:px-6 space-y-6">
      <Link
        href="/"
        className="cartoon-btn inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 text-xs font-black text-foreground border border-border"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Galeri
      </Link>

      <div className="space-y-4">
        <div className="space-y-2">
          {outfit.tags && outfit.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {outfit.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-nunito tracking-tight text-foreground leading-tight">
            {outfit.title}
          </h1>
        </div>

        {/* Collapsible and neat description component */}
        <OutfitDescription description={outfit.description} />
      </div>

      <ShopTheLook
        imageUrl={outfit.image_url}
        items={normalizeOutfitItems(outfit.outfit_items)}
        outfitId={outfit.id}
      />
    </main>
  );
}
