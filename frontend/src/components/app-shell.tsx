"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { TopNav } from "@/components/top-nav";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/setup";
  
  // Logic to determine if we are in "Discovery Mode"
  const isDiscoveryMode = pathname.startsWith("/discover") || 
                          pathname.startsWith("/requests") || 
                          pathname === "/manage-requests";

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  // 1. DISCOVERY LAYOUT (Sidebar + Top Search)
  if (isDiscoveryMode) {
    return (
      <div className="flex min-h-screen w-full bg-background animate-in fade-in duration-700">
        <AppSidebar />
        <div className="flex-1 ml-64 flex flex-col">
          <TopBar />
          <main className="flex-1 pt-20 pb-20 overflow-auto">
            <div className="p-6 lg:p-10 max-w-(--breakpoint-2xl) mx-auto">
              {children}
            </div>
          </main>
        </div>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_50%)] pointer-events-none" />
      </div>
    );
  }

  // 2. MAIN LAYOUT (Apple Cinematic TopNav)
  return (
    <div className="flex min-h-screen w-full flex-col bg-background animate-in fade-in duration-500">
      <TopNav />
      <main className="flex-1 pt-16 pb-20 overflow-auto">
        {/* We use full width for Home hero, but contain other pages if needed */}
        <div className={cn(pathname === "/" ? "" : "p-6 lg:p-12 max-w-(--breakpoint-2xl) mx-auto")}>
          {children}
        </div>
      </main>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />
    </div>
  );
}
