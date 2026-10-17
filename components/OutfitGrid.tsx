import OutfitCard, { Outfit } from "./OutfitCard";

interface OutfitGridProps {
  outfits?: Outfit[];
  isLoggedIn?: boolean;
}

export default function OutfitGrid({ outfits = [], isLoggedIn = true }: OutfitGridProps) {
  if (outfits.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">Belum ada outfit yang di-curate.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}
