"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MediaCard } from "@/components/media-card";

function CategoryContent() {
  const { type } = useParams();
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
            return <div ref={lastElementRef} key={uniqueKey}><MediaCard item={item} type={type as "movie" | "tv"} /></div>;
          }
          return <MediaCard key={uniqueKey} item={item} type={type as "movie" | "tv"} />;
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
