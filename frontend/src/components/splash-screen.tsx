"use client";

import { useEffect, useState } from "react";
import { PlaySquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(onComplete, 800); // Allow exit animation to finish
    }, 2000); // Show logo for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center bg-black transition-all duration-1000 ease-in-out",
      exit ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
    )}>
      <div className="flex flex-col items-center gap-6">
        <div className={cn(
          "flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-1000",
          !exit ? "scale-100 animate-pulse" : "scale-150"
        )}>
          <PlaySquare className="h-12 w-12 fill-current" />
        </div>
        <h1 className={cn(
          "text-4xl font-black tracking-[0.2em] text-white uppercase italic transition-all duration-1000 delay-100",
          !exit ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Osmose
        </h1>
      </div>
      
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
    </div>
  );
}
