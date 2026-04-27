"use client";

import { Search } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { RequestIndicator } from "@/components/request-indicator";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/requests?query=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 flex h-20 items-center px-10 bg-background/40 backdrop-blur-2xl border-b border-white/5">
      <div className="flex w-full items-center justify-between gap-10">
        
        {/* Large Professional Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 relative group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
           <Input 
             placeholder="Rechercher un film, une série, un acteur..." 
             className="h-12 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all text-base tracking-tight font-medium"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </form>

        <div className="flex items-center gap-4">
          <RequestIndicator />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
