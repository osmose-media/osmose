"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { 
  ChevronLeft, 
  Star, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Play, 
  Users,
  Info,
  ChevronRight,
  Layers,
  ListVideo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MediaDetailPage() {
  const { type, id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/details/${type}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setMedia(data);
        setLoading(false);
      })
      .catch(() => toast.error("Erreur de chargement"));
    }
  }, [id, type, token]);

  const fetchSeason = async (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/details/tv/${id}/season/${seasonNum}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEpisodes(data);
    } catch (err) {
      toast.error("Impossible de charger la saison");
    }
  };

  const handleRequest = async (season?: number, episode?: number) => {
    setRequesting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tmdbId: id,
          type: type,
          title: media.title,
          posterPath: media.posterPath,
          seasonNumber: season,
          episodeNumber: episode
        })
      });
      if (res.ok) {
        toast.success(episode ? `Épisode ${episode} demandé` : season ? `Saison ${season} demandée` : "Demande envoyée");
        // Update local state to show requested status
        if (!season && !episode) setMedia({...media, isRequested: true});
      }
    } catch (err) {
      toast.error("Échec de la demande");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!media) return <div className="text-center py-20 text-white/20 uppercase font-black tracking-widest">Média introuvable</div>;

  return (
    <div className="flex flex-col gap-0 -mt-24 -mx-6 lg:-mx-10">
      {/* Backdrop Hero */}
      <div className="relative w-full h-[60vh] min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
        {media.backdropPath && (
          <img src={media.backdropPath} alt="" className="w-full h-full object-cover opacity-40 animate-slow-zoom" />
        )}
        
        <div className="absolute bottom-12 left-10 lg:left-20 z-20 flex flex-col gap-6 max-w-4xl">
           <Button variant="ghost" onClick={() => router.back()} className="w-fit text-white/40 hover:text-white -ml-4 gap-2">
             <ChevronLeft className="h-4 w-4" /> Retour
           </Button>
           <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                 <Badge className="bg-white/10 text-white border-0 backdrop-blur-md px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
                   {type === 'movie' ? 'FILM' : type === 'tv' ? 'SÉRIE' : 'ANIME'}
                 </Badge>
                 <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star className="h-4 w-4 fill-current" /> {media.rating?.toFixed(1)}</span>
                 <span className="text-white/40 font-medium">•</span>
                 <span className="text-white/40 font-medium">{new Date(media.releaseDate).getFullYear()}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[0.9]">{media.title}</h1>
           </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-10 lg:px-20 grid grid-cols-1 lg:grid-cols-3 gap-16 py-12 relative z-20">
         
         <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section className="space-y-4">
               <h3 className="text-[10px] font-black tracking-[0.2em] text-white/20">Synopsis</h3>
               <p className="text-lg leading-relaxed text-white/70 max-w-2xl font-medium">{media.overview || "Aucun synopsis disponible pour ce titre."}</p>
               <div className="flex flex-wrap gap-2 pt-2">
                  {media.genres?.map((g: string) => <Badge key={g} variant="secondary" className="bg-white/5 text-white/40 border-0 px-4 py-1 rounded-full text-xs">{g}</Badge>)}
               </div>
            </section>

            {/* TV Show Granular Requests */}
            {type === 'tv' && media.seasons && (
               <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                     <h3 className="text-[10px] font-black tracking-[0.2em] text-white/20">Saisons & Épisodes</h3>
                     <p className="text-xs text-white/40">{media.seasons.length} Saisons disponibles</p>
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                     {media.seasons.map((s: any) => (
                        <Card 
                           key={s.seasonNumber} 
                           className={cn(
                             "min-w-[140px] cursor-pointer transition-all border-0",
                             selectedSeason === s.seasonNumber ? "bg-white text-black scale-105" : "bg-white/5 text-white hover:bg-white/10"
                           )}
                           onClick={() => fetchSeason(s.seasonNumber)}
                        >
                           <CardContent className="p-4 text-center space-y-1">
                              <p className="text-xs font-bold">Saison {s.seasonNumber}</p>
                              <p className={cn("text-[9px] font-medium uppercase opacity-50", selectedSeason === s.seasonNumber ? "text-black" : "text-white")}>{s.episodeCount} EP</p>
                           </CardContent>
                        </Card>
                     ))}
                  </div>

                  {selectedSeason !== null && episodes.length > 0 && (
                     <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {episodes.map(ep => (
                           <div key={ep.episodeNumber} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04]">
                              <div className="flex items-center gap-4">
                                 <span className="text-white/20 font-black text-xs">EP {ep.episodeNumber}</span>
                                 <p className="text-sm font-semibold text-white/80">{ep.name}</p>
                              </div>
                              <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest text-primary"
                                 onClick={() => handleRequest(selectedSeason, ep.episodeNumber)}
                              >
                                 Demander cet épisode
                              </Button>
                           </div>
                        ))}
                     </div>
                  )}
               </section>
            )}

            {/* Cast */}
            <section className="space-y-6">
               <h3 className="text-[10px] font-black tracking-[0.2em] text-white/20">Casting</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {media.cast?.map((c: any) => (
                    <div key={c.name} className="flex flex-col gap-2">
                       <div className="aspect-square rounded-2xl bg-white/5 overflow-hidden border border-white/5">
                          {c.profilePath && <img src={c.profilePath} alt={c.name} className="h-full w-full object-cover" />}
                       </div>
                       <div className="px-1">
                          <p className="text-xs font-bold text-white line-clamp-1">{c.name}</p>
                          <p className="text-[10px] text-white/30 line-clamp-1 italic">{c.character}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
         </div>

         {/* Right Sidebar Actions */}
         <div className="space-y-8">
            <Card className="glass-card border-0 p-8 flex flex-col gap-6 sticky top-24">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Statut Serveur</p>
                  <div className="flex items-center gap-2">
                     {media.isAvailable ? (
                        <Badge className="bg-green-500 text-white rounded-full px-3 py-1 font-bold">Disponible</Badge>
                     ) : media.isRequested ? (
                        <Badge className="bg-primary text-white rounded-full px-3 py-1 font-bold">En cours de traitement</Badge>
                     ) : (
                        <Badge variant="outline" className="text-white/40 border-white/10 rounded-full px-3 py-1">Non acquis</Badge>
                     )}
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  {media.isAvailable ? (
                    <Button className="h-14 rounded-2xl bg-white text-black font-bold text-lg gap-3 transition-transform active:scale-95 shadow-xl hover:bg-white/90">
                       <Play className="h-5 w-5 fill-current" /> Lecture
                    </Button>
                  ) : media.isRequested && type === 'movie' ? (
                    <Button disabled className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold text-lg gap-3">
                       <CheckCircle className="h-5 w-5" /> Déjà demandé
                    </Button>
                  ) : (
                    <Button 
                      className="h-14 rounded-2xl bg-white text-black font-bold text-lg gap-3 transition-transform active:scale-95 shadow-xl hover:bg-white/90"
                      onClick={() => handleRequest()}
                      disabled={requesting}
                    >
                       {requesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                       {type === 'movie' ? 'Demander le film' : 'Demander la série entière'}
                    </Button>
                  )}
                  
                  <Button variant="ghost" className="h-14 rounded-2xl text-white/40 hover:bg-white/5 font-semibold text-lg gap-3">
                     <ListVideo className="h-5 w-5" /> Ma Liste
                  </Button>
               </div>

               <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] text-white/20 font-medium leading-relaxed italic">
                    Note: Les demandes sont traitées par l'administrateur et ajoutées automatiquement à la stack de téléchargement.
                  </p>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
