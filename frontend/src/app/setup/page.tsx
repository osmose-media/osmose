"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlaySquare, Shield, Folder, Share2, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "admin", title: "Identity", icon: Shield, description: "Create your administrator account" },
  { id: "media", title: "Storage", icon: Folder, description: "Map your media directories" },
  { id: "arr", title: "Automation", icon: Share2, description: "Connect to your *arr stack" },
  { id: "finish", title: "Ready", icon: CheckCircle2, description: "Finalize your configuration" }
];

export default function SetupPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    username: "admin",
    password: "",
    rootPath: "/media",
    radarrUrl: "http://localhost:7878",
    radarrKey: "",
    sonarrUrl: "http://localhost:8989",
    sonarrKey: ""
  });
  const [loading, setLoading] = useState(false);

  const currentStep = steps[stepIndex];

  const handleNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/setup/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          mediaPaths: { root: formData.rootPath },
          arrConfig: {
            radarrUrl: formData.radarrUrl,
            radarrKey: formData.radarrKey,
            sonarrUrl: formData.sonarrUrl,
            sonarrKey: formData.sonarrKey
          }
        })
      });

      if (res.ok) {
        toast.success("Osmose initialization successful!");
        router.push("/login");
      } else {
        toast.error("An error occurred during setup.");
      }
    } catch (err) {
      toast.error("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Progress Side */}
        <div className="md:col-span-1 space-y-8 flex flex-col justify-center">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-black">
                <PlaySquare className="h-6 w-6 fill-current" />
             </div>
             <span className="text-xl font-bold text-white tracking-tight">Osmose</span>
          </div>
          
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={s.id} className={cn(
                "flex items-center gap-4 transition-all duration-500",
                i === stepIndex ? "opacity-100 translate-x-2" : "opacity-40"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center",
                  i <= stepIndex ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "border-white/20 text-white"
                )}>
                  {i < stepIndex ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">{s.title}</p>
                  {i === stepIndex && <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest">{s.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Card Side */}
        <div className="md:col-span-2">
          <Card className="glass-card border-0 min-h-[480px] flex flex-col">
            <CardHeader className="p-8 pb-0">
              <h2 className="text-2xl font-bold text-white tracking-tight">{currentStep.title}</h2>
              <p className="text-white/40">{currentStep.description}</p>
            </CardHeader>
            
            <CardContent className="p-8 flex-1">
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {stepIndex === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-white/40 tracking-wider">Administrator Username</Label>
                      <Input 
                        placeholder="admin" 
                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-white/40 tracking-wider">Set Secure Password</Label>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {stepIndex === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-white/40 tracking-wider">Media Base Path</Label>
                      <Input 
                        placeholder="/media" 
                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                        value={formData.rootPath}
                        onChange={(e) => setFormData({...formData, rootPath: e.target.value})}
                      />
                      <p className="text-[11px] text-white/30 italic">Example: /mnt/media or /data</p>
                    </div>
                  </div>
                )}

                {stepIndex === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-white/40 tracking-wider">Radarr URL</Label>
                        <Input 
                          placeholder="http://..." 
                          className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                          value={formData.radarrUrl}
                          onChange={(e) => setFormData({...formData, radarrUrl: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-white/40 tracking-wider">Radarr API Key</Label>
                        <Input 
                          type="password"
                          className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                          value={formData.radarrKey}
                          onChange={(e) => setFormData({...formData, radarrKey: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-white/40 tracking-wider">Sonarr URL</Label>
                        <Input 
                          placeholder="http://..." 
                          className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                          value={formData.sonarrUrl}
                          onChange={(e) => setFormData({...formData, sonarrUrl: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-white/40 tracking-wider">Sonarr API Key</Label>
                        <Input 
                          type="password"
                          className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                          value={formData.sonarrKey}
                          onChange={(e) => setFormData({...formData, sonarrKey: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {stepIndex === 3 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                       <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">All systems set!</h3>
                      <p className="text-white/40 text-sm max-w-[280px]">Your personal Osmose instance is configured and ready to ingest your library.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <div className="p-8 pt-0 flex gap-3">
              {stepIndex > 0 && (
                <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 text-white hover:bg-white/5" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              {stepIndex < steps.length - 1 ? (
                <Button className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold" onClick={handleNext}>
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold" onClick={handleFinish} disabled={loading}>
                  {loading ? "Configuring..." : "Launch Osmose"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
