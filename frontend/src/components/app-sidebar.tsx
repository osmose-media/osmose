"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PlaySquare, 
  Search, 
  Film, 
  Tv, 
  ClipboardList, 
  Settings2,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Découvrir", url: "/requests", icon: Search },
  { title: "Films", url: "/discover/movie", icon: Film },
  { title: "Séries", url: "/discover/tv", icon: Tv },
  { title: "Requêtes", url: "/manage-requests", icon: ClipboardList },
  { title: "Préférences", url: "/settings?tab=preferences", icon: Settings2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 bg-background/50 backdrop-blur-xl z-50 flex flex-col p-6 gap-8">
      <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors mb-2 group">
         <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Retour à l'accueil
      </Link>

      <Link href="/" className="flex items-center gap-3 px-2 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black shadow-2xl transition-transform group-hover:scale-105 active:scale-95">
          <PlaySquare className="h-5 w-5 fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white">Osmose</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <Link 
            key={item.url} 
            href={item.url}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
              pathname === item.url || (item.url !== "/requests" && pathname.startsWith(item.url))
                ? "bg-white/5 text-white border border-white/5 shadow-inner" 
                : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <item.icon className={cn(
              "h-4 w-4 transition-transform group-hover:scale-110",
              (pathname === item.url || (item.url !== "/requests" && pathname.startsWith(item.url))) ? "text-primary" : ""
            )} />
            <span className="text-xs font-semibold tracking-tight">{item.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
