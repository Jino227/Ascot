"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, Lock, LogIn } from "lucide-react";
import { getCollectionBySlug } from "@/lib/actions";
import { useAuth } from "@/hooks/use-auth";
import { LuxLightbox, useLightbox } from "@/components/layout/Lightbox";
import { Button } from "@/components/ui/button";

export default function CollectionDetailsPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", params.slug, user?.id],
    queryFn: () => getCollectionBySlug(params.slug, user?.id),
    enabled: !!params.slug,
  });

  useEffect(() => { if (collection) document.title = `${collection.name} — Ascot Fashions`; }, [collection]);

  if (isLoading) return <main className="container-x py-24 text-muted-foreground">Loading collection…</main>;
  if (!collection) return <main className="container-x py-24"><h1 className="font-display text-4xl">Collection not found</h1><Link href="/collections" className="mt-6 inline-flex items-center text-accent"><ArrowLeft className="mr-2 h-4 w-4" />Back to collections</Link></main>;

  const images = collection.collection_images ?? [];
  const privateCount = collection.private_image_count ?? images.filter((image: any) => image.is_private).length;
  const lightbox = useLightbox();

  return (
    <main className="container-x py-16 md:py-24">
      <Link href="/collections" className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-accent"><ArrowLeft className="mr-2 h-4 w-4" />All collections</Link>
      <div className="mt-12 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-accent">Collection details</p>
          <h1 className="mt-5 font-display text-5xl md:text-7xl">{collection.name}</h1>
          {collection.description && <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{collection.description}</p>}
          {privateCount > 0 && !collection.has_private_access && <div className="mt-8 border border-amber-700/30 bg-amber-700/5 p-5 text-sm text-amber-700"><div className="flex items-center"><Crown className="mr-2 h-4 w-4" />{privateCount} more image{privateCount === 1 ? "" : "s"} available for premium members.</div>{!user ? <Button asChild size="sm" className="mt-4 rounded-none bg-amber-700 text-white hover:bg-amber-800"><Link href="/auth"><LogIn className="mr-2 h-4 w-4" />Login to access more images</Link></Button> : <p className="mt-3 text-xs text-amber-700/80">Your account does not have access to these images yet. Contact sales to request access.</p>}</div>}
        </div>
        {collection.cover_image && <img src={collection.cover_image} alt={collection.name} className="max-h-[28rem] w-full object-cover" />}
      </div>

      {images.length === 0 ? (
        <div className="mt-20 border border-border/60 p-12 text-center text-muted-foreground">Images for this collection are coming soon.</div>
      ) : (
        <div className="mt-20 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {images.map((image: any, index: number) => (
            <div key={image.id} className="mb-5 break-inside-avoid">
              <button type="button" onClick={() => lightbox.open(index)} className="group relative block w-full cursor-zoom-in overflow-hidden bg-muted text-left">
                <img src={image.url} alt={image.alt ?? collection.name} className="w-full transition duration-700 group-hover:scale-[1.03]" />
                {image.is_private && <span className="absolute left-3 top-3 inline-flex items-center bg-black/70 px-2 py-1 text-[10px] uppercase tracking-widest text-white"><Lock className="mr-1 h-3 w-3" />Private</span>}
              </button>
            </div>
          ))}
        </div>
      )}
      {privateCount > 0 && !collection.has_private_access && <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: privateCount }).map((_, index) => <div key={index} className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-dashed border-amber-700/30 bg-amber-700/[0.03]"><div className="text-center text-amber-700/70"><Lock className="mx-auto h-6 w-6" /><p className="mt-2 text-[10px] uppercase tracking-[0.18em]">Premium image</p></div></div>)}</div>}
      <LuxLightbox slides={images.map((image: any) => ({ src: image.url, alt: image.alt ?? collection.name }))} index={lightbox.index} onClose={lightbox.close} />
    </main>
  );
}
