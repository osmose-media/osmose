"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [featured, setFeatured] = useState<any>(null);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [recentMovies, setRecentMovies] = useState<any[]>([]);
  const [recentSeries, setRecentSeries] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          // Heuristic for data splitting
          const movies = data.filter((m: any) => m.type === 'MOVIE').slice(0, 6);
          const series = data.filter((m: any) => m.type === 'TV' || m.type === 'ANIME').slice(0, 6);
          
          setRecentMovies(movies);
          setRecentSeries(series);
          
          // Featured is the last one watched (mocking with first in list for now)
          const lastWatched = data[0];
          setFeatured(lastWatched);

          // Mock continue watching with specific naming requirements
          setContinueWatching(data.slice(0, 4).map((item: any, i: number) => ({
            ...item,
            progress: 30 + (i * 15),
            // Mocking episode info for series
            season: item.type !== 'MOVIE' ? 1 : null,
            episode: item.type !== 'MOVIE' ? i + 1 : null,
            year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : '2024'
          })));
        }
      })
      .catch(console.error);
  }, []);

  // Loop 10s logic
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 10) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="flex flex-col -mt-24">
      {/* Hero Section with 10s Video Loop */}
      <section className="relative w-full h-[85vh] min-h-[500px] flex flex-col justify-end pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
          
          {/* If we had a stream URL, we'd use it here. Falling back to poster with slow zoom for now 
              but adding the video tag structure for when playback is ready. */}
          {featured?.streamUrl ? (
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline 
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover brightness-50"
              src={featured.streamUrl}
            />
          ) : (
            mediaPosterOrMesh(featured)
          )}
        </div>

        <div className="container mx-auto px-6 lg:px-10 flex flex-col gap-6 max-w-5xl mr-auto ml-0">
          <div className="flex flex-col gap-2">
             <Badge variant="outline" className="w-fit bg-white/5 text-white/60 border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
               {featured?.type === 'ANIME' ? 'Dernier Anime' : featured?.type === 'TV' ? 'Dernière Série' : 'Dernier Film'}
             </Badge>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
               {featured?.title || "Osmose"}
             </h1>
          </div>
          
          <p className="text-base text-white/50 max-w-lg line-clamp-3 font-normal leading-relaxed">
            {featured?.overview || "Reprenez là où vous vous étiez arrêté ou explorez les nouveaux ajouts de votre bibliothèque."}
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

      <div className="container mx-auto px-6 lg:px-10 flex flex-col gap-14 pb-20 relative z-20">
        
        {/* 1. Continuer à regarder */}
        {continueWatching.length > 0 && (
          <section className="flex flex-col gap-5">
            <h3 className="text-xl font-semibold text-white/90">Continuer à regarder</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {continueWatching.map((item) => (
                <Link key={item.id} href={`/media/${item.id}`} className="group relative flex flex-col gap-2.5">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 border border-white/5 transition-all group-hover:bg-white/10 group-hover:border-white/20">
                    {item.posterPath ? (
                      <img src={item.posterPath} alt={item.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/10 font-bold">{item.title}</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div className="h-full bg-white transition-all shadow-[0_0_8px_white]" style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                       <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center text-black shadow-xl scale-90 group-hover:scale-100 transition-transform">
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                       </div>
                    </div>
                  </div>
                  <div className="px-1 space-y-0.5">
                    <h4 className="text-[13px] font-bold text-white/90 group-hover:text-white transition-colors line-clamp-1 truncate">{item.title}</h4>
                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                      {item.type === 'MOVIE' ? item.year : `S${item.season} E${item.episode}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 2. Récemment ajouté dans Film */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-l-2 border-primary pl-4">
            <h3 className="text-xl font-semibold text-white/90">Récemment ajouté dans Films</h3>
            <Link href="/library?type=movie" className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 hover:text-white transition-colors">Explorer</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recentMovies.length > 0 ? recentMovies.map((item) => (
               <MediaCardSmall key={item.id} item={item} />
            )) : emptySlots()}
          </div>
        </section>

        {/* 3. Récemment ajouté dans Séries */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-l-2 border-primary pl-4">
            <h3 className="text-xl font-semibold text-white/90">Récemment ajouté dans Séries</h3>
            <Link href="/library?type=tv" className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 hover:text-white transition-colors">Explorer</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recentSeries.length > 0 ? recentSeries.map((item) => (
               <MediaCardSmall key={item.id} item={item} />
            )) : emptySlots()}
          </div>
        </section>

      </div>
    </div>
  );
}

function MediaCardSmall({ item }: { item: any }) {
  return (
    <Link href={`/media/${item.id}`} className="group relative flex flex-col gap-2">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 border border-white/5 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/20 shadow-md">
        {item.posterPath ? (
          <img src={item.posterPath} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/10 p-4 text-center font-bold">{item.title}</div>
        )}
      </div>
      <h4 className="text-[12px] font-medium text-white/60 group-hover:text-white transition-colors line-clamp-1 px-1">{item.title}</h4>
    </Link>
  );
}

function mediaPosterOrMesh(featured: any) {
  return featured?.posterPath ? (
    <img 
      src={featured.backdropPath || featured.posterPath} 
      alt={featured.title} 
      className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
    />
  ) : (
    <div className="w-full h-full bg-slate-950 opacity-40" />
  );
}

function emptySlots() {
  return [1,2,3,4,5,6].map(i => (
    <div key={i} className="aspect-[2/3] rounded-xl bg-white/[0.02] border border-dashed border-white/5" />
  ));
}
