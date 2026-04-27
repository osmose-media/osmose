"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [featured, setFeatured] = useState<any>(null);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setFeatured(data[0]);
          setRecentlyAdded(data.slice(0, 6));
          setContinueWatching(data.slice(0, 3).map((item: any) => ({ ...item, progress: 65 })));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col -mt-24">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[500px] flex flex-col justify-end pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
          {featured?.posterPath ? (
            <img 
              src={featured.backdropPath || featured.posterPath} 
              alt={featured.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-950 opacity-40" />
          )}
        </div>

        <div className="container mx-auto px-6 lg:px-10 flex flex-col gap-6 max-w-5xl mr-auto ml-0">
          <div className="flex flex-col gap-2">
             <Badge variant="outline" className="w-fit bg-white/5 text-white/60 border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
               {featured?.type === 'ANIME' ? 'Dernier Anime' : 'À la une'}
             </Badge>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
               {featured?.title || "Osmose"}
             </h1>
          </div>
          
          <p className="text-base text-white/50 max-w-lg line-clamp-3 font-normal leading-relaxed">
            {featured?.overview || "Explorez votre bibliothèque locale ou découvrez de nouveaux contenus à ajouter à votre collection."}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Link href={featured ? `/media/${featured.id}` : "/library"}>
              <Button size="lg" className="h-11 px-8 rounded-full bg-white text-black hover:bg-white/90 font-semibold gap-2 shadow-lg">
                <Play className="h-4 w-4 fill-current" />
                Lecture
              </Button>
            </Link>
            <Link href="/requests">
              <Button size="lg" variant="secondary" className="h-11 px-8 rounded-full bg-white/10 text-white hover:bg-white/20 font-semibold gap-2 border-0 shadow-lg">
                <Plus className="h-4 w-4" />
                Ma Liste
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-10 flex flex-col gap-12 pb-20 relative z-20">
        
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="flex flex-col gap-5">
            <h3 className="text-xl font-semibold text-white/90">Reprendre la lecture</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {continueWatching.map((item) => (
                <Link key={item.id} href={`/media/${item.id}`} className="group relative flex flex-col gap-2">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 border border-white/5 transition-all group-hover:bg-white/10">
                    {item.posterPath ? (
                      <img src={item.posterPath} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/20">{item.title}</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div className="h-full bg-white transition-all shadow-[0_0_8px_white]" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                  <h4 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1">{item.title}</h4>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recently Added */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white/90">Ajoutés récemment</h3>
            <Link href="/library" className="text-xs font-medium text-white/30 hover:text-white transition-colors">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {recentlyAdded.length > 0 ? recentlyAdded.map((item) => (
              <Link key={item.id} href={`/media/${item.id}`} className="group relative flex flex-col gap-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 border border-white/5 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/20">
                  {item.posterPath ? (
                    <img src={item.posterPath} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/10 p-4 text-center">{item.title}</div>
                  )}
                </div>
                <h4 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1">{item.title}</h4>
              </Link>
            )) : (
              [1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-white/[0.02] border border-dashed border-white/5" />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
