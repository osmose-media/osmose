"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Settings, Share2, Bell, FileText, Info, Globe, Mail, MessageSquare, ChevronRight, Plus, Trash2, RefreshCw, ExternalLink, Edit2, Server } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Translation Dictionary
const i18n = {
  fr: {
    title: "Préférences",
    subtitle: "Configurez votre instance Osmose et vos services tiers.",
    tabs: {
      general: "Général",
      services: "Services",
      notifications: "Notifications",
      logs: "Logs",
      about: "À propos"
    },
    general: {
      title: "Paramètres Généraux",
      desc: "Configurez les paramètres globaux et par défaut d'Osmose.",
      apiKey: "Clé API",
      appTitle: "Titre de l'application",
      appUrl: "URL de l'application",
      proxy: "Activer le support Proxy",
      proxyDesc: "Permet à Osmose d'enregistrer les IP clients derrière un proxy",
      caching: "Activer le cache d'images",
      cachingDesc: "Mettre en cache les images externes (expérimental)",
      displayLang: "Langue d'affichage",
      region: "Région de découverte"
    },
    services: {
      radarrTitle: "Paramètres Radarr",
      radarrDesc: "Gérez vos serveurs Radarr pour les films.",
      sonarrTitle: "Paramètres Sonarr",
      sonarrDesc: "Gérez vos serveurs Sonarr pour les séries.",
      noServer: "Aucun serveur connecté",
      noServerDesc: "Connectez un serveur pour commencer à demander du contenu.",
      addServer: "Ajouter un serveur",
      editServer: "Modifier le serveur",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce serveur ?",
      test: "Tester",
      testing: "Test en cours...",
      save: "Enregistrer le serveur"
    }
  },
  en: {
    title: "Settings",
    subtitle: "Configure your Osmose instance and third-party services.",
    tabs: {
      general: "General",
      services: "Services",
      notifications: "Notifications",
      logs: "Logs",
      about: "About"
    },
    general: {
      title: "General Settings",
      desc: "Configure global and default settings for Osmose.",
      apiKey: "API Key",
      appTitle: "Application Title",
      appUrl: "Application URL",
      proxy: "Enable Proxy Support",
      proxyDesc: "Allow Osmose to correctly register client IP addresses behind a proxy",
      caching: "Enable Image Caching",
      cachingDesc: "Cache externally sourced images (experimental)",
      displayLang: "Display Language",
      region: "Discover Region"
    },
    services: {
      radarrTitle: "Radarr Settings",
      radarrDesc: "Configure your Radarr server(s) below.",
      sonarrTitle: "Sonarr Settings",
      sonarrDesc: "Configure your Sonarr server(s) below.",
      noServer: "No server connected",
      noServerDesc: "Connect a server to start requesting content.",
      addServer: "Add Server",
      editServer: "Edit Server",
      deleteConfirm: "Are you sure you want to delete this server?",
      test: "Test",
      testing: "Testing...",
      save: "Save Server"
    }
  }
};

interface ServerData {
  id?: string;
  name: string;
  hostname: string;
  port: string;
  apiKey: string;
  useSsl: boolean;
  isDefault?: boolean;
  is4k?: boolean;
}

const AddServerModal = ({ 
  type, 
  setOpen, 
  token, 
  lang,
  onSave,
  initialData
}: { 
  type: 'Radarr' | 'Sonarr', 
  setOpen: (open: boolean) => void,
  token: string | null,
  lang: 'fr' | 'en',
  onSave: (data: ServerData) => void,
  initialData?: ServerData | null
}) => {
  const [testLoading, setTestLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [serverData, setServerData] = useState<ServerData>(initialData || {
    name: "",
    hostname: "",
    port: type === 'Radarr' ? "7878" : "8989",
    apiKey: "",
    useSsl: false,
    isDefault: true,
    is4k: false
  });

  const t = i18n[lang];

  const isValid = serverData.name && serverData.hostname && serverData.port && serverData.apiKey;

  const handleTest = async () => {
    if (!serverData.hostname || !serverData.apiKey) {
      toast.error(lang === 'fr' ? "L'hôte et la clé API sont requis" : "Hostname and API Key are required");
      return;
    }

    setTestLoading(true);
    setTestSuccess(false);

    try {
      const protocol = serverData.useSsl ? 'https' : 'http';
      const url = `${protocol}://${serverData.hostname}:${serverData.port}`;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/settings/test-connection`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: type.toLowerCase(),
          url,
          apiKey: serverData.apiKey
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestSuccess(true);
        toast.success(lang === 'fr' ? `Connexion réussie (${type} v${data.version})` : `Connection successful (${type} v${data.version})`);
      } else {
        toast.error(data.message || (lang === 'fr' ? "Échec de la connexion" : "Connection failed"));
      }
    } catch (err) {
      toast.error(lang === 'fr' ? "Erreur réseau" : "Network error");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <DialogContent className="glass-card border-white/10 max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="text-xl font-bold">{initialData ? t.services.editServer : t.services.addServer} {type}</DialogTitle>
        <DialogDescription className="text-white/40 text-xs">Configure your {type} instance settings below.</DialogDescription>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="default" 
                className="border-white/20 checked:bg-white" 
                checked={serverData.isDefault}
                onCheckedChange={(checked) => setServerData({...serverData, isDefault: !!checked})}
              />
              <Label htmlFor="default" className="text-sm font-medium cursor-pointer">Default Server</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="4k" 
                className="border-white/20 checked:bg-white" 
                checked={serverData.is4k}
                onCheckedChange={(checked) => setServerData({...serverData, is4k: !!checked})}
              />
              <Label htmlFor="4k" className="text-sm font-medium cursor-pointer">4K Server</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Server Name*</Label>
              <Input 
                className="bg-white/5 border-white/10 h-11" 
                placeholder="e.g. My Radarr" 
                value={serverData.name}
                onChange={(e) => setServerData({...serverData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Hostname or IP Address*</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-xs text-white/30">
                  {serverData.useSsl ? 'https://' : 'http://'}
                </div>
                <Input 
                  className="bg-white/5 border-white/10 h-11 rounded-l-none" 
                  placeholder="192.168.1.50" 
                  value={serverData.hostname}
                  onChange={(e) => setServerData({...serverData, hostname: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Port*</Label>
              <Input 
                className="bg-white/5 border-white/10 h-11" 
                value={serverData.port}
                onChange={(e) => setServerData({...serverData, port: e.target.value})}
              />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="ssl" 
                  className="border-white/20 checked:bg-white" 
                  checked={serverData.useSsl}
                  onCheckedChange={(checked) => setServerData({...serverData, useSsl: !!checked})}
                />
                <Label htmlFor="ssl" className="text-sm font-medium cursor-pointer">Use SSL</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">API Key*</Label>
            <Input 
              type="password" 
              className="bg-white/5 border-white/10 h-11" 
              placeholder="Paste your API key here" 
              value={serverData.apiKey}
              onChange={(e) => setServerData({...serverData, apiKey: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">URL Base</Label>
              <Input className="bg-white/5 border-white/10 h-11" placeholder="/" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Quality Profile*</Label>
              <div className="h-11 flex items-center px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/20 italic">Select a profile...</div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Root Folder*</Label>
              <div className="h-11 flex items-center px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/20 italic">Select a folder...</div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Minimum Availability*</Label>
              <div className="h-11 flex items-center px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/20 italic">Select availability...</div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="p-6 pt-2 gap-2 border-t border-white/5">
        <Button 
          variant="outline" 
          className="border-white/10 rounded-xl px-8 flex items-center gap-2 min-w-[100px]" 
          onClick={handleTest}
          disabled={testLoading}
        >
          {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (testSuccess ? <Check className="h-4 w-4 text-green-500" /> : t.services.test)}
        </Button>
        <Button 
          className="bg-white text-black font-bold px-10 rounded-xl disabled:opacity-50" 
          disabled={!isValid}
          onClick={() => onSave(serverData)}
        >
          {t.services.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function RequestsSettingsPage() {
  const { token } = useAuth();
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [activeTab, setActiveTab] = useState("general");
  const [isRadarrModalOpen, setIsRadarrModalOpen] = useState(false);
  const [isSonarrModalOpen, setIsSonarrModalOpen] = useState(false);
  
  const [radarrServers, setRadarrServers] = useState<ServerData[]>([]);
  const [sonarrServers, setSonarrServers] = useState<ServerData[]>([]);
  const [editingServer, setEditingServer] = useState<{type: 'Radarr' | 'Sonarr', data: ServerData} | null>(null);

  const t = i18n[lang];

  // Load servers from localStorage
  useEffect(() => {
    const savedRadarr = localStorage.getItem('radarr_servers');
    const savedSonarr = localStorage.getItem('sonarr_servers');
    if (savedRadarr) setRadarrServers(JSON.parse(savedRadarr));
    if (savedSonarr) setSonarrServers(JSON.parse(savedSonarr));
  }, []);

  // Save servers to localStorage
  useEffect(() => {
    localStorage.setItem('radarr_servers', JSON.stringify(radarrServers));
    localStorage.setItem('sonarr_servers', JSON.stringify(sonarrServers));
  }, [radarrServers, sonarrServers]);

  const handleSaveServer = (type: 'Radarr' | 'Sonarr', data: ServerData) => {
    if (type === 'Radarr') {
      if (data.id) {
        setRadarrServers(radarrServers.map(s => s.id === data.id ? data : s));
      } else {
        setRadarrServers([...radarrServers, { ...data, id: crypto.randomUUID() }]);
      }
      setIsRadarrModalOpen(false);
    } else {
      if (data.id) {
        setSonarrServers(sonarrServers.map(s => s.id === data.id ? data : s));
      } else {
        setSonarrServers([...sonarrServers, { ...data, id: crypto.randomUUID() }]);
      }
      setIsSonarrModalOpen(false);
    }
    setEditingServer(null);
    toast.success(lang === 'fr' ? "Serveur enregistré" : "Server saved");
  };

  const handleDeleteServer = (type: 'Radarr' | 'Sonarr', id: string) => {
    if (confirm(t.services.deleteConfirm)) {
      if (type === 'Radarr') {
        setRadarrServers(radarrServers.filter(s => s.id !== id));
      } else {
        setSonarrServers(sonarrServers.filter(s => s.id !== id));
      }
      toast.success(lang === 'fr' ? "Serveur supprimé" : "Server deleted");
    }
  };

  const handleEditServer = (type: 'Radarr' | 'Sonarr', data: ServerData) => {
    setEditingServer({ type, data });
    if (type === 'Radarr') setIsRadarrModalOpen(true);
    else setIsSonarrModalOpen(true);
  };

  const sidebarTabs = [
    { id: "general", label: t.tabs.general, icon: Settings },
    { id: "services", label: t.tabs.services, icon: Share2 },
    { id: "notifications", label: t.tabs.notifications, icon: Bell },
    { id: "logs", label: t.tabs.logs, icon: FileText },
    { id: "about", label: t.tabs.about, icon: Info },
  ];

  const ServerList = ({ type, servers }: { type: 'Radarr' | 'Sonarr', servers: ServerData[] }) => {
    if (servers.length === 0) {
      return (
        <DialogTrigger render={<div className="p-10 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center gap-4 hover:bg-white/[0.01] transition-colors group cursor-pointer" />}>
          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Plus className="h-6 w-6 text-white/20 group-hover:text-white/40" />
          </div>
          <div>
            <p className="font-bold text-white/60 group-hover:text-white transition-colors">{t.services.noServer}</p>
            <p className="text-xs text-white/20">{t.services.noServerDesc}</p>
          </div>
          <span className="inline-flex items-center justify-center rounded-xl px-6 h-10 border border-white/10 text-white/80 text-sm font-bold group-hover:border-white/30 transition-all">
            {t.services.addServer}
          </span>
        </DialogTrigger>
      );
    }

    return (
      <div className="space-y-4">
        {servers.map((server) => (
          <div key={server.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Server className="h-5 w-5 text-white/40" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white">{server.name}</p>
                    {server.isDefault && <Badge className="h-4 text-[8px] bg-white text-black font-black px-1.5">DEFAULT</Badge>}
                    {server.is4k && <Badge className="h-4 text-[8px] bg-blue-500 text-white font-black px-1.5">4K</Badge>}
                  </div>
                  <p className="text-[10px] text-white/30 font-mono">
                    {server.useSsl ? 'https://' : 'http://'}{server.hostname}:{server.port}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] text-white/30 font-mono mr-2">
                  API: {server.apiKey.substring(0, 4)}...{server.apiKey.substring(server.apiKey.length - 4)}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/10"
                  onClick={() => handleEditServer(type, server)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDeleteServer(type, server.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        <DialogTrigger render={<Button variant="outline" className="w-full border-dashed border-white/10 rounded-xl h-12 text-xs font-bold gap-2 hover:bg-white/5" />}>
          <Plus className="h-4 w-4" /> {t.services.addServer}
        </DialogTrigger>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">{t.title}</h1>
        <p className="text-sm text-white/40">{t.subtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-1">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group text-left",
                activeTab === tab.id 
                  ? "bg-white text-black shadow-xl" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn(
                "h-4 w-4",
                activeTab === tab.id ? "text-black" : "text-white/20 group-hover:text-white"
              )} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl">
          <Tabs value={activeTab} className="w-full">
            
            {/* GENERAL */}
            <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{t.general.title}</CardTitle>
                  <CardDescription>{t.general.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/40">{t.general.apiKey}</Label>
                      <div className="flex gap-2">
                        <Input className="bg-white/5 border-white/10 font-mono text-xs" readOnly placeholder="API Key will appear here" />
                        <Button variant="outline" className="border-white/10">{lang === 'fr' ? 'Rénégénérer' : 'Regenerate'}</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-white/40">{t.general.appTitle}</Label>
                        <Input className="bg-white/5 border-white/10" placeholder="Osmose" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-white/40">{t.general.appUrl}</Label>
                        <Input className="bg-white/5 border-white/10" placeholder="https://osmose.example.com" />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{t.general.proxy}</p>
                        <p className="text-[10px] text-white/30">{t.general.proxyDesc}</p>
                      </div>
                      <Checkbox className="border-white/20 checked:bg-white" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{t.general.caching}</p>
                        <p className="text-[10px] text-white/30">{t.general.cachingDesc}</p>
                      </div>
                      <Checkbox className="border-white/20 checked:bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/40">{t.general.displayLang}</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex w-full h-12 items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 hover:bg-white/10 text-white transition-all cursor-pointer group">
                             <div className="flex items-center gap-2">
                               <Globe className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
                               <span className="text-sm font-medium">{lang === 'fr' ? 'Français' : 'English'}</span>
                             </div>
                             <ChevronRight className="h-4 w-4 text-white/20 rotate-90" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 glass-card border-white/10">
                          <DropdownMenuItem onClick={() => setLang('fr')} className="gap-2">🇫🇷 Français</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLang('en')} className="gap-2">🇺🇸 English</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/40">{t.general.region}</Label>
                      <div className="h-12 flex items-center px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white/60">
                         {lang === 'fr' ? 'France' : 'United States'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button className="bg-white text-black font-bold h-12 px-10 rounded-xl shadow-2xl hover:bg-white/90">
                   {lang === 'fr' ? 'Sauvegarder' : 'Save Changes'}
                </Button>
              </div>
            </TabsContent>

            {/* SERVICES */}
            <TabsContent value="services" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-xl p-2">
                        <Image 
                          src="/radarr.png" 
                          alt="Radarr" 
                          width={40} 
                          height={40} 
                          style={{ width: "auto", height: "auto" }}
                          className="object-contain" 
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{t.services.radarrTitle}</CardTitle>
                        <CardDescription>{t.services.radarrDesc}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Dialog 
                    open={isRadarrModalOpen} 
                    onOpenChange={(open) => {
                      setIsRadarrModalOpen(open);
                      if (!open) setEditingServer(null);
                    }}
                  >
                    <ServerList type="Radarr" servers={radarrServers} />
                    <AddServerModal 
                      type="Radarr" 
                      setOpen={setIsRadarrModalOpen} 
                      token={token} 
                      lang={lang}
                      onSave={(data) => handleSaveServer('Radarr', data)}
                      initialData={editingServer?.type === 'Radarr' ? editingServer.data : null}
                    />
                  </Dialog>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-xl p-2">
                        <Image 
                          src="/sonarr.png" 
                          alt="Sonarr" 
                          width={40} 
                          height={40} 
                          style={{ width: "auto", height: "auto" }}
                          className="object-contain" 
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{t.services.sonarrTitle}</CardTitle>
                        <CardDescription>{t.services.sonarrDesc}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Dialog 
                    open={isSonarrModalOpen} 
                    onOpenChange={(open) => {
                      setIsSonarrModalOpen(open);
                      if (!open) setEditingServer(null);
                    }}
                  >
                    <ServerList type="Sonarr" servers={sonarrServers} />
                    <AddServerModal 
                      type="Sonarr" 
                      setOpen={setIsSonarrModalOpen} 
                      token={token} 
                      lang={lang}
                      onSave={(data) => handleSaveServer('Sonarr', data)}
                      initialData={editingServer?.type === 'Sonarr' ? editingServer.data : null}
                    />
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NOTIFICATIONS */}
            <TabsContent value="notifications" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Email", icon: Mail, enabled: false },
                    { name: "Discord", icon: MessageSquare, enabled: false },
                    { name: "Telegram", icon: Globe, enabled: false },
                    { name: "Web Push", icon: Bell, enabled: false },
                  ].map((agent) => (
                    <Card key={agent.name} className="glass-card border-0 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                          agent.enabled ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white/40"
                        )}>
                          <agent.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{agent.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Not configured</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-white/40" />
                      </CardContent>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            {/* LOGS */}
            <TabsContent value="logs" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <Card className="glass-card border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-xl font-bold">{t.tabs.logs}</CardTitle>
                      <CardDescription>System activity logs</CardDescription>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="outline" className="border-white/10 h-9 px-4 text-xs font-bold gap-2">
                          <RefreshCw className="h-3.5 w-3.5" /> Refresh
                       </Button>
                       <Button variant="outline" className="border-white/10 h-9 px-4 text-xs font-bold gap-2 text-red-400">
                          <Trash2 className="h-3.5 w-3.5" /> Clear
                       </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-black/20 font-mono text-[10px] p-4 h-[400px] overflow-y-auto">
                       <p className="text-white/20">Select a service to view logs...</p>
                    </div>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* ABOUT */}
            <TabsContent value="about" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <Card className="glass-card border-0">
                  <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-6">
                     <div className="h-24 w-24 rounded-3xl bg-white p-4 shadow-2xl">
                        <Image src="/big_white_logo_osmose.png" alt="Osmose" width={80} height={80} className="object-contain" />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter">OSMOSE</h2>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Version 1.0.0-alpha</p>
                     </div>
                     <p className="max-w-md text-sm text-white/60 leading-relaxed">
                        Osmose is an open-source media request management system designed for ease of use and aesthetic pleasure.
                     </p>
                     <div className="flex gap-4 pt-4">
                        <Button variant="outline" className="border-white/10 gap-2 rounded-xl h-11 px-6">
                           <ExternalLink className="h-4 w-4" /> GitHub
                        </Button>
                        <Button variant="outline" className="border-white/10 gap-2 rounded-xl h-11 px-6">
                           <Info className="h-4 w-4" /> Documentation
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
