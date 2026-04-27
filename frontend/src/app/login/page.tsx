"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlaySquare, ArrowRight, Lock, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        toast.success(`Authenticated as ${data.user.username}`);
        router.push("/");
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-6">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black shadow-2xl">
            <PlaySquare className="h-9 w-9 fill-current" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Osmose</h1>
          <p className="text-muted-foreground/80">Sign in to your private cloud</p>
        </div>

        <Card className="glass-card border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="username" 
                      placeholder="admin" 
                      className="pl-10 h-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all rounded-xl text-white placeholder:text-muted-foreground/40"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" d-slot="label" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12 bg-white/5 border-white/10 focus:bg-white/10 transition-all rounded-xl text-white placeholder:text-muted-foreground/40"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold transition-all group shadow-xl" 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground/40 italic">
          Self-hosted Osmose Instance v0.1
        </p>
      </div>
    </div>
  );
}
