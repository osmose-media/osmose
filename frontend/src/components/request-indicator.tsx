"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Bell, Clock, CheckCircle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function RequestIndicator() {
  const { token } = useAuth();
  const [summary, setSummary] = useState({ pending: 0, processing: 0, completed: 0 });

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSummary();
      const interval = setInterval(fetchSummary, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [token]);

  const totalActive = summary.pending + summary.processing;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="relative h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all outline-none group">
          <Bell className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
          {totalActive > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse" />
          )}
        </button>
      } />
      
      <DropdownMenuContent className="w-72 glass-card p-3" align="end" sideOffset={8}>
        <DropdownMenuLabel className="px-2 py-2">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">État des requêtes</p>
        </DropdownMenuLabel>
        
        <div className="space-y-1 mt-2">
          <Link href="/manage-requests">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
               <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-yellow-500/50" />
                  <span className="text-xs font-bold text-white/70">En attente</span>
               </div>
               <Badge variant="secondary" className="bg-white/5 text-white/40 border-0">{summary.pending}</Badge>
            </div>
          </Link>

          <Link href="/manage-requests">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
               <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-primary/50 animate-spin-slow" />
                  <span className="text-xs font-bold text-white/70">Traitement</span>
               </div>
               <Badge variant="secondary" className="bg-white/5 text-white/40 border-0">{summary.processing}</Badge>
            </div>
          </Link>

          <DropdownMenuSeparator className="bg-white/5 my-2" />

          <Link href="/library">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
               <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500/50" />
                  <span className="text-xs font-bold text-white/70">Téléchargé</span>
               </div>
               <Badge variant="secondary" className="bg-white/5 text-white/40 border-0">{summary.completed}</Badge>
            </div>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
