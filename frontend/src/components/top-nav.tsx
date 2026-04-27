"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlaySquare } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navLinks = [
  { title: "Films", url: "/library?type=movie" },
  { title: "Séries", url: "/library?type=tv" },
  { title: "Animes", url: "/library?type=anime" },
  { title: "Découvrir", url: "/requests" },
];

export function TopNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 lg:px-10 transition-all duration-300",
      scrolled 
        ? "bg-background/70 backdrop-blur-xl border-b border-white/5 shadow-sm" 
        : "bg-transparent"
    )}>
      <div className="flex w-full items-center">
        
        {/* Left Side: Navigation Links */}
        <div className="flex-1 flex items-center">
          <nav className="hidden md:flex items-center gap-8 pl-10">
            {navLinks.map((link) => (
              <Link 
                key={link.url} 
                href={link.url}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.15em] transition-colors hover:text-white",
                  pathname.startsWith(link.url.split('?')[0]) ? "text-white" : "text-white/80"
                )}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition-transform group-hover:scale-105 active:scale-95">
              <PlaySquare className="h-5 w-5 fill-current" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Osmose</span>
          </Link>
        </div>

        {/* Right Side: User Profile */}
        <div className="flex-1 flex items-center justify-end">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
