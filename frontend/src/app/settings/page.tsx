"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { 
  Database, 
  Shield, 
  Trash2, 
  UserPlus,
  User as UserIcon,
  Sliders,
  Monitor,
  Volume2,
  Key,
  Server,
  Users
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface LocalUser {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

function SettingsContent() {
  const { user: currentUser, token } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || (currentUser?.isAdmin ? "server" : "preferences");
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [settings, setSettings] = useState<Record<string, string>>({
    radarr_url: "",
    radarr_api_key: "",
    sonarr_url: "",
    sonarr_api_key: "",
    tmdb_api_key: "",
    media_path: "/media"
  });
  
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", isAdmin: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !currentUser?.isAdmin) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        const [settingsRes, usersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/users`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const settingsData = await settingsRes.json();
        const usersData = await usersRes.json();
        setSettings(prev => ({ ...prev, ...settingsData }));
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, currentUser?.isAdmin]);

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ settings })
      });
      if (res.ok) toast.success("Paramètres mis à jour");
    } catch (err) {
      toast.error("Échec de l'enregistrement");
    }
  };

  const handleCreateUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/users`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        toast.success("Utilisateur créé");
        setIsUserDialogOpen(false);
        setNewUser({ username: "", password: "", isAdmin: false });
        // Refresh users
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (err) {
      toast.error("Erreur de création");
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-20">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Paramètres</h2>
        <p className="text-sm text-white/40">Gérez vos préférences et la configuration du serveur Osmose.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white/5 p-1 rounded-xl h-11 w-fit border border-white/5">
          <TabsTrigger value="preferences" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-black text-xs font-medium gap-2">
            <Sliders className="h-3.5 w-3.5" /> Préférences
          </TabsTrigger>
          {currentUser?.isAdmin && (
            <>
              <TabsTrigger value="server" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-black text-xs font-medium gap-2">
                <Server className="h-3.5 w-3.5" /> Serveur
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-black text-xs font-medium gap-2">
                <Users className="h-3.5 w-3.5" /> Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="api" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-black text-xs font-medium gap-2">
                <Key className="h-3.5 w-3.5" /> Services & API
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* PREFERENCES */}
        <TabsContent value="preferences" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card border-0">
                <CardHeader><CardTitle className="text-base font-semibold">Affichage</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label className="text-sm text-white/50 font-normal">Lecture auto</Label><input type="checkbox" defaultChecked className="accent-white h-4 w-4" /></div>
                  <div className="flex items-center justify-between"><Label className="text-sm text-white/50 font-normal">Qualité</Label><span className="text-[11px] font-bold text-white/30">AUTO</span></div>
                </CardContent>
              </Card>
              <Card className="glass-card border-0">
                <CardHeader><CardTitle className="text-base font-semibold">Langue</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label className="text-sm text-white/50 font-normal">Interface</Label><span className="text-xs font-medium">Français</span></div>
                </CardContent>
              </Card>
           </div>
        </TabsContent>

        {/* SERVER (Admin) */}
        {currentUser?.isAdmin && (
          <TabsContent value="server" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card border-0">
                <CardHeader><CardTitle className="text-base font-semibold">Radarr</CardTitle><CardDescription className="text-[10px]">Gestion des films</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase text-white/20 ml-1">URL</Label><Input placeholder="http://..." className="bg-white/5 border-white/10" value={settings.radarr_url} onChange={(e) => setSettings({...settings, radarr_url: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase text-white/20 ml-1">Clé API</Label><Input type="password" placeholder="Key" className="bg-white/5 border-white/10" value={settings.radarr_api_key} onChange={(e) => setSettings({...settings, radarr_api_key: e.target.value})} /></div>
                </CardContent>
              </Card>
              <Card className="glass-card border-0">
                <CardHeader><CardTitle className="text-base font-semibold">Sonarr</CardTitle><CardDescription className="text-[10px]">Gestion des séries</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase text-white/20 ml-1">URL</Label><Input placeholder="http://..." className="bg-white/5 border-white/10" value={settings.sonarr_url} onChange={(e) => setSettings({...settings, sonarr_url: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase text-white/20 ml-1">Clé API</Label><Input type="password" placeholder="Key" className="bg-white/5 border-white/10" value={settings.sonarr_api_key} onChange={(e) => setSettings({...settings, sonarr_api_key: e.target.value})} /></div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end"><Button className="bg-white text-black font-semibold rounded-lg px-8 h-10 shadow-lg" onClick={handleSaveSettings}>Sauvegarder la stack Arr</Button></div>
          </TabsContent>
        )}

        {/* USERS (Admin) */}
        {currentUser?.isAdmin && (
          <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex justify-between items-center"><h3 className="font-semibold text-white">Gestion des comptes locaux</h3><Button variant="outline" className="border-white/10 h-9 rounded-lg px-4 gap-2" onClick={() => setIsUserDialogOpen(true)}><UserPlus className="h-3.5 w-3.5" /> Ajouter</Button></div>
             <div className="grid gap-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30"><UserIcon className="h-4 w-4" /></div>
                      <div><p className="text-sm font-medium">{u.username}</p><p className="text-[10px] text-white/30 uppercase font-bold tracking-tight">Membre Osmose</p></div>
                      {u.isAdmin && <Badge className="h-4 text-[8px] bg-white text-black font-black px-1.5">ADMIN</Badge>}
                    </div>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-white/10 hover:text-red-500 hover:bg-red-500/10" disabled={u.id === currentUser.id}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
             </div>
             <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="glass-card border-white/10">
                  <DialogHeader><DialogTitle>Nouveau Profil</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5"><Label>Pseudo</Label><Input className="bg-white/5 border-white/10" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Mot de passe</Label><Input type="password" className="bg-white/5 border-white/10" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></div>
                    <div className="flex items-center gap-3 pt-2"><input type="checkbox" checked={newUser.isAdmin} onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})} className="h-4 w-4 accent-white" /><Label>Droits Administrateur</Label></div>
                  </div>
                  <DialogFooter><Button className="bg-white text-black font-bold h-11 px-8 rounded-xl" onClick={handleCreateUser}>Créer le compte</Button></DialogFooter>
                </DialogContent>
             </Dialog>
          </TabsContent>
        )}

        {/* API (Admin) */}
        {currentUser?.isAdmin && (
          <TabsContent value="api" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="glass-card border-0 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Clé TMDB</CardTitle>
                <CardDescription className="text-xs">Requis pour la recherche mondiale et les métadonnées.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 ml-1">TMDB API Key (v3)</Label>
                    <Input 
                      type="password" 
                      placeholder="Collez votre clé API v3 ici..."
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                      value={settings.tmdb_api_key}
                      onChange={(e) => setSettings({...settings, tmdb_api_key: e.target.value})}
                    />
                    <p className="text-[11px] text-white/20 italic">Cette clé permet à Osmose de se connecter à la base de données mondiale des films et séries.</p>
                 </div>
                 <Button className="w-full bg-white text-black font-black h-12 rounded-xl shadow-xl" onClick={handleSaveSettings}>Enregistrer la clé API</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
