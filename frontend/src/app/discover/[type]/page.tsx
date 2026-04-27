"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, CheckCircle, Clock } from "lucide-react";

function CategoryContent() {
  const { type } = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchItems = useCallback(async (pageNum: number) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/trending?type=${type}&page=${pageNum}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.results) {
        setItems(prev => [...prev, ...data.results]);
        setHasMore(data.page < data.total_pages);
      }
    } catch (err) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [token, type, hasMore, loading]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchItems(1);
  }, [type, token]);

  const lastElementRef = useCallback((node: any) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchItems(nextPage);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchItems]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircle className="h-4 w-4 text-green-500 fill-black/20" />;
      case 'PROCESSING': return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500 fill-black/20" />;
      default: return null;
    }
  };

  const MediaCard = ({ item }: { item: any }) => (
    <Link href={`/discover/${type}/${item.id}`}>
      <div className="group relative flex flex-col gap-2 cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 border border-white/5 shadow-sm transition-all duration-300 group-hover:scale-[1.03] group-hover:border-white/10 group-hover:shadow-xl">
          {item.poster_path ? (
            <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/10 uppercase p-4 text-center">
              {item.title || item.name}
            </div>
          )}
          <div className="absolute top-2 right-2">
             {item.status && (
                <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-2xl">
                   {getStatusIcon(item.status)}
                </div>
             )}
          </div>
        </div>
        <h4 className="text-[13px] font-semibold text-white/70 group-hover:text-white line-clamp-1 truncate px-1">{item.title || item.name}</h4>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="border-b border-white/5 pb-6">
         <h2 className="text-3xl font-semibold tracking-tight text-white capitalize">{type === 'movie' ? 'Films' : 'Séries'}</h2>
         <p className="text-sm text-white/40 font-medium">Défilement infini du catalogue mondial.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {items.map((item, index) => {
          const uniqueKey = `${item.id}-${index}`;
          if (items.length === index + 1) {
            return <div ref={lastElementRef} key={uniqueKey}><MediaCard item={item} /></div>;
          }
          return <MediaCard key={uniqueKey} item={item} />;
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

export default function DiscoverCategoryPage() {
  return (
    <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <CategoryContent />
    </Suspense>
  );
}
