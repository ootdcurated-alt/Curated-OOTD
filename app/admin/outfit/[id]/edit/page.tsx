import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditOutfitForm from "@/components/EditOutfitForm";


interface EditOutfitPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOutfitPage({ params }: EditOutfitPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: outfit, error } = await supabase
    .from("outfits")
    .select("id, title, description, image_url, tags")
    .eq("id", id)
    .single();

  if (error || !outfit) {
    notFound();
  }

  const { data: outfitItems } = await supabase
    .from("outfit_items")
    .select("id, name, brand, price, affiliate_url, x, y")
    .eq("outfit_id", id);

  return (
    <EditOutfitForm
      outfit={outfit}
      outfitItems={outfitItems || []}
    />
  );
}
