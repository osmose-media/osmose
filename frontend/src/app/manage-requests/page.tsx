"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { 
  Clock, 
  Film, 
  Tv, 
  Ghost,
  Trash2,
  Check,
  X,
  User as UserIcon,
  Loader2,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ManageRequests() {
  const { token, user: currentUser } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Échec du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRequests();
  }, [token]);

  const handleAction = async (id: string, status: string) => {
    setActionId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Statut mis à jour`);
        fetchRequests();
      }
    } catch (err) {
      toast.error("Erreur de mise à jour");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Demande supprimée");
        fetchRequests();
      }
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] uppercase font-bold">Approuvée</Badge>;
      case 'DECLINED': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] uppercase font-bold">Refusée</Badge>;
      case 'COMPLETED': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px] uppercase font-bold">Disponible</Badge>;
      default: return <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] uppercase font-bold tracking-widest">En attente</Badge>;
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-white/20" /></div>;

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Requêtes</h2>
        <p className="text-sm text-white/40">{currentUser?.isAdmin ? "Gestion globale de la file d'attente." : "Historique de vos demandes."}</p>
      </div>

      <div className="grid gap-4">
        {requests.length > 0 ? requests.map((req) => (
          <div key={req.id} className="group flex items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
              {/* Illustration de l'image */}
              <div className="h-24 w-16 rounded-xl bg-white/5 overflow-hidden border border-white/5 mr-6 flex-shrink-0 shadow-lg">
                {req.posterPath ? (
                  <img src={req.posterPath} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    {req.type === 'MOVIE' ? <Film className="h-4 w-4 text-white/10" /> : <Tv className="h-4 w-4 text-white/10" />}
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                 <h4 className="text-base font-bold text-white tracking-tight truncate">
                   {req.title}
                   {(req.seasonNumber || req.episodeNumber) && (
                     <span className="ml-2 text-xs text-primary/60 font-medium">
                       {req.seasonNumber && `S${req.seasonNumber}`}
                       {req.episodeNumber && `E${req.episodeNumber}`}
                     </span>
                   )}
                 </h4>
                 <div className="flex items-center gap-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                   <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                      <UserIcon className="h-3 w-3" />
                      <span className={cn(req.user?.isAdmin ? "text-primary/60" : "")}>{req.user?.username}</span>
                   </div>
                   <span>•</span>
                   <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-6 px-4">
                 {getStatusBadge(req.status)}
                 
                 <div className="flex items-center gap-2">
                    {currentUser?.isAdmin && req.status === 'REQUESTED' && (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-9 w-9 rounded-full text-green-500/50 hover:text-green-500 hover:bg-green-500/10" 
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          disabled={actionId === req.id}
                        >
                          {actionId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-9 w-9 rounded-full text-red-500/50 hover:text-red-500 hover:bg-red-500/10" 
                          onClick={() => handleAction(req.id, 'DECLINED')}
                          disabled={actionId === req.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(currentUser?.isAdmin || req.status === 'REQUESTED') && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-white/10 hover:text-red-500 rounded-full"
                        onClick={() => handleDelete(req.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                 </div>
              </div>
          </div>
        )) : (
          <div className="flex h-60 w-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/5 text-white/10">
             <Inbox className="h-10 w-10 opacity-10" />
             <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Aucune requête active</p>
          </div>
        )}
      </div>
    </div>
  );
}
