"use client";

import { Search, Film, Tv, PlayCircle } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { RequestIndicator } from "@/components/request-indicator";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setShowPreview(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (search.trim().length < 2) {
        setResults([]);
        setShowPreview(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media/search?q=${encodeURIComponent(search)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 3));
          setShowPreview(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowPreview(false);
      router.push(`/requests?query=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 flex h-20 items-center px-10 bg-background/40 backdrop-blur-2xl border-b border-white/5">
      <div className="flex w-full items-center justify-between gap-10">
        
        {/* Large Professional Search Bar */}
        <div className="flex-1 relative group" ref={previewRef}>
          <form onSubmit={handleSearch}>
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
             <Input 
               placeholder="Rechercher un film, une série, un acteur..." 
               className="h-12 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all text-base tracking-tight font-medium"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               onFocus={() => search.trim().length >= 2 && setShowPreview(true)}
             />
          </form>

          {/* Search Results Preview */}
          {showPreview && (results.length > 0 || loading) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-2">
                {loading ? (
                  <div className="p-4 text-center text-sm text-white/40">Recherche...</div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-white/30">Suggestions</div>
                    {results.map((item) => (
                      <Link 
                        key={item.id} 
                        href={`/discover/${item.type.toLowerCase()}/${item.id}`}
                        onClick={() => setShowPreview(false)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                      >
                        <div className="relative h-14 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 shadow-lg">
                          {item.posterPath ? (
                            <Image 
                              src={item.posterPath} 
                              alt={item.title} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-white/5 to-white/10">
                              {item.type === 'MOVIE' ? <Film className="h-4 w-4 text-white/20" /> : <Tv className="h-4 w-4 text-white/20" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 font-bold tracking-wider capitalize">{item.type.toLowerCase()}</span>
                            {item.releaseDate && (
                              <span className="text-[10px] text-white/30 font-medium">{new Date(item.releaseDate).getFullYear()}</span>
                            )}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                           <PlayCircle className="h-5 w-5 text-white/40" />
                        </div>
                      </Link>
                    ))}
                    <button 
                      onClick={handleSearch}
                      className="w-full mt-2 p-3 text-center text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 border-t border-white/5 transition-colors"
                    >
                      Voir tous les résultats pour "{search}"
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <RequestIndicator />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
