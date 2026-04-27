"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Media {
  id: string;
  title: string;
  type: string;
  posterPath?: string;
  releaseDate?: string;
}

export default function Library() {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get('type'); // 'movie', 'tv', 'anime'
  
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media`)
      .then(res => res.json())
      .then(data => {
        let filtered = Array.isArray(data) ? data : [];
        if (typeFilter) {
          // Map URL query to DB types
          const typeMap: Record<string, string> = {
            'movie': 'MOVIE',
            'tv': 'TV',
            'anime': 'ANIME' // We'll need to handle anime specifically if it's a separate flag
          };
          filtered = filtered.filter((item: any) => item.type === typeMap[typeFilter]);
        }
        setMedia(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [typeFilter]);

  const getTitle = () => {
    switch(typeFilter) {
      case 'movie': return 'Movies';
      case 'tv': return 'TV Shows';
      case 'anime': return 'Animes';
      default: return 'Your Library';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <h2 className="text-4xl font-bold tracking-tight">{getTitle()}</h2>
        <Badge variant="outline" className="mb-1">{media.length} Titles</Badge>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/50 bg-muted/10 text-muted-foreground">
          <p className="text-lg font-medium">Your collection is empty.</p>
          <Link href="/requests">
            <Badge className="cursor-pointer px-4 py-1 hover:bg-primary/90">Discover Content</Badge>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {media.map((item) => (
            <Link key={item.id} href={`/media/${item.id}`} className="group relative flex flex-col gap-2">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-primary/10">
                {item.posterPath ? (
                  <img src={item.posterPath} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground italic">
                    {item.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 p-4 opacity-0 transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                   <p className="text-xs font-bold text-white uppercase tracking-wider">{item.type}</p>
                </div>
              </div>
              <div className="px-1">
                <h4 className="line-clamp-1 text-sm font-semibold group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Unknown'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
