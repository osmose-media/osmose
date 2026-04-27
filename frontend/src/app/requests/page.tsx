"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Inbox, 
  Film, 
  Tv, 
  Ghost, 
  ChevronRight,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

function DiscoverContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('query');
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trending, setTrending] = useState<{ movies: any[], tv: any[] }>({ movies: [], tv: [] });
  const [localRecent, setLocalRecent] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      // Fetch Trending
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/trending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error?.includes("CONFIG_MISSING")) setError("Clé API TMDB manquante");
        else setTrending(data);
      })
      .catch(console.error);

      // Fetch Local Recent
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setLocalRecent(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(console.error);

      // Fetch All Active Requests (Pending + Processing)
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const active = Array.isArray(data) 
          ? data.filter((r: any) => r.status === 'REQUESTED' || r.status === 'APPROVED').slice(0, 6) 
          : [];
        setActiveRequests(active);
      })
      .catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    if (urlQuery && token) handleSearch(urlQuery);
    else setSearchResults([]);
  }, [urlQuery, token]);

  const handleSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/search?query=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSearchResults(data);
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircle className="h-4 w-4 text-green-500 fill-black/20" />;
      case 'PROCESSING': return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500 fill-black/20" />;
      default: return null;
    }
  };

  const MediaCard = ({ item, type, isLandscape = false }: { item: any, type?: string, isLandscape?: boolean }) => {
    const mediaType = type || item.media_type || (item.title ? 'movie' : 'tv');
    const isLocal = !!item.filePath || item.status === 'AVAILABLE';
    const linkUrl = isLocal && item.id && !item.id.toString().startsWith('local') ? `/media/${item.id}` : `/discover/${mediaType}/${item.tmdbId || item.id}`;

    // Map backend statuses for UI display
    const uiStatus = item.status || (item.status === 'REQUESTED' ? 'PENDING' : item.status === 'APPROVED' ? 'PROCESSING' : null);

    return (
      <Link href={linkUrl}>
        <div className="group relative flex flex-col gap-2 cursor-pointer">
          <div className={cn(
            "relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 shadow-sm transition-all duration-300 group-hover:scale-[1.03] group-hover:border-white/10 group-hover:shadow-xl",
            isLandscape ? "aspect-video" : "aspect-[2/3]"
          )}>
            {item.poster_path || item.posterPath || item.backdropPath ? (
              <img 
                src={isLandscape ? (item.backdropPath || item.posterPath) : (item.posterPath || `https://image.tmdb.org/t/p/w500${item.poster_path}`)} 
                alt="" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/10 uppercase p-4 text-center">
                {item.title || item.name}
              </div>
            )}
            
            <div className="absolute top-2 right-2 flex flex-col gap-1">
               {uiStatus && (
                 <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-2xl">
                    {getStatusIcon(uiStatus)}
                 </div>
               )}
            </div>
          </div>
          <h4 className="text-[12px] font-semibold text-white/70 group-hover:text-white line-clamp-1 truncate px-1">{item.title || item.name}</h4>
        </div>
      </Link>
    );
  };

  if (error === "Clé API TMDB manquante") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6 text-center max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-white/10" />
        <h2 className="text-xl font-semibold text-white">Configuration requise</h2>
        <Link href="/settings"><Button className="bg-white text-black font-bold h-10 px-8">Réglages</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      
      {/* 1. SEARCH RESULTS */}
      {urlQuery && (
        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Résultats : {urlQuery}</h3>
              <Link href="/requests" className="text-xs text-primary hover:underline">Effacer</Link>
           </div>
           {loading ? (
             <div className="h-40 flex items-center justify-center text-white/10 font-bold uppercase tracking-widest animate-pulse">Recherche TMDB...</div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {searchResults.map(item => <MediaCard key={item.id} item={item} />)}
             </div>
           )}
        </section>
      )}

      {!urlQuery && (
        <>
          {/* 2. ACTIVE REQUESTS ROW (LANDSCAPE 16:9) */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                 <Clock className="h-3 w-3" /> Requêtes en cours & traitement
               </h3>
               <Link href="/manage-requests" className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">Voir tout <ChevronRight className="h-3 w-3" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {activeRequests.length > 0 ? activeRequests.map(r => (
                 <MediaCard 
                    key={r.id} 
                    item={{...r, status: r.status === 'REQUESTED' ? 'PENDING' : 'PROCESSING'}} 
                    isLandscape={true} 
                 />
               )) : (
                 <div className="col-span-full py-10 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    <Clock className="h-5 w-5 text-white/5 mb-2" />
                    <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest italic">Aucune requête active</p>
                 </div>
               )}
            </div>
          </section>

          {/* 3. LOCAL RECENT ROW */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                 <Inbox className="h-3 w-3" /> Récemment ajouté (Local)
               </h3>
               <Link href="/library" className="text-[10px] text-primary font-bold hover:underline">Ma Bibliothèque</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
               {localRecent.length > 0 ? localRecent.map(item => (
                 <MediaCard key={item.id} item={{...item, status: 'AVAILABLE'}} />
               )) : (
                 [1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-[2/3] rounded-2xl bg-white/[0.02] border border-dashed border-white/5" />
                 ))
               )}
            </div>
          </section>

          {/* 4. TRENDING TMDB */}
          <section className="flex flex-col gap-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-yellow-500" /> Films Tendances (Monde)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {trending.movies.slice(0, 12).map(item => <MediaCard key={item.id} item={item} type="movie" />)}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Tv className="h-3 w-3 text-primary" /> Séries Populaires (Monde)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {trending.tv.slice(0, 12).map(item => <MediaCard key={item.id} item={item} type="tv" />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverContent />
    </Suspense>
  );
}
