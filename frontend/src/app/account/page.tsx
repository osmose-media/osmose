"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { 
  User as UserIcon, 
  Calendar, 
  Shield, 
  ChevronLeft,
  Upload,
  Save,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

export default function AccountPage() {
  const { user, token, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatarPath || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const isSystemAdmin = user.username === 'admin';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username: isSystemAdmin ? undefined : username,
          avatarBase64: avatar 
        })
      });

      const data = await res.json();
      if (res.ok) {
        login(token!, data); // Update local auth context
        toast.success("Profil mis à jour avec succès");
      } else {
        toast.error(data.error || "Erreur de mise à jour");
      }
    } catch (err) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-1">
        <Link href="/" className="text-primary hover:underline text-xs font-medium flex items-center gap-1 mb-2 w-fit">
           <ChevronLeft className="h-3 w-3" /> Retour
        </Link>
        <h2 className="text-3xl font-semibold tracking-tight text-white">Mon Profil</h2>
        <p className="text-sm text-white/40">Personnalisez votre identité sur Osmose.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <Card className="glass-card border-0 md:col-span-1">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <div 
              className="relative h-32 w-32 rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/10">
                  <UserIcon className="h-12 w-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            
            <div className="text-center space-y-2">
               <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Photo de profil</p>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="text-[11px] font-semibold text-primary"
                 onClick={() => fileInputRef.current?.click()}
               >
                 Changer l'image
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="glass-card border-0 md:col-span-2">
          <CardContent className="p-8 space-y-8">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-1">Nom d'utilisateur</Label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSystemAdmin}
                  className="h-12 bg-white/5 border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Votre pseudo"
                />
                {isSystemAdmin && <p className="text-[10px] text-white/20 italic">Le nom du compte 'admin' ne peut pas être modifié.</p>}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-primary/60" />
                  <div>
                    <p className="text-sm font-medium text-white">Privilèges</p>
                    <p className="text-xs text-white/30">{user.isAdmin ? "Accès administrateur complet" : "Utilisateur standard"}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-white/10 text-white/40 text-[9px] uppercase font-black">
                  {user.isAdmin ? "ADMIN" : "USER"}
                </Badge>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-white/5">
              <Button 
                className="h-12 px-8 rounded-xl bg-white text-black font-bold hover:bg-white/90 gap-2"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer les modifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
