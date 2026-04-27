"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { SplashScreen } from "@/components/splash-screen";

export default function RootWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading: authLoading } = useAuth();
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/setup/status`);
        const data = await res.json();
        
        if (data.setupRequired) {
          if (pathname !== '/setup') router.push('/setup');
          setCheckingSetup(false);
          return;
        }

        if (!token) {
          if (pathname !== '/login' && pathname !== '/setup') {
            router.push('/login');
          }
        } else {
          if (pathname === '/login' || pathname === '/setup') {
            router.push('/');
          }
        }

        setCheckingSetup(false);
      } catch (err) {
        console.error("Failed to check status", err);
        setCheckingSetup(false);
      }
    };

    if (!authLoading) {
      checkStatus();
    }
  }, [pathname, router, token, authLoading]);

  // Show splash only on initial app load, not on every internal navigation
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (authLoading || checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
