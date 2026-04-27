"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import VideoPlayer from "@/components/video-player";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function MediaDetails() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media`)
      .then(res => res.json())
      .then(data => {
        const item = data.find((m: any) => m.id === id);
        setMedia(item);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleStartStream = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media/${id}/stream`);
      const data = await res.json();
      setStreamUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${data.streamUrl}`);
    } catch (err) {
      console.error(err);
    }
  };

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: streamUrl,
      type: 'application/x-mpegURL'
    }]
  };

  if (loading) return <Skeleton className="h-[400px] w-full" />;
  if (!media) return <div>Media not found</div>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/library">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Library
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[2/3] w-full rounded-xl bg-muted overflow-hidden">
            {media.posterPath ? (
              <img src={media.posterPath} alt={media.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground italic">
                No Poster
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2 flex flex-col gap-4">
          <h1 className="text-4xl font-bold">{media.title}</h1>
          <p className="text-muted-foreground">{media.overview || "No overview available."}</p>
          
          {!streamUrl ? (
            <Button size="lg" className="w-fit rounded-full px-8" onClick={handleStartStream}>
              Watch Now
            </Button>
          ) : (
            <div className="w-full rounded-xl overflow-hidden bg-black aspect-video">
              <VideoPlayer options={videoJsOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
