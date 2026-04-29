"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  LayoutDashboard, 
  ArrowLeftRight, 
  UserCircle,
  Sliders,
  PlusCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90 p-0 overflow-hidden">
             {user.avatarPath ? (
               <img src={user.avatarPath} alt={user.username} className="h-full w-full object-cover" />
             ) : (
               <UserIcon className="h-5 w-5 text-white/70" />
             )}
          </Button>
        }
      />
      
      <DropdownMenuContent className="w-64 glass-card p-2" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
               {user.avatarPath ? (
                 <img src={user.avatarPath} alt={user.username} className="h-full w-full object-cover" />
               ) : (
                 <UserIcon className="h-5 w-5 text-white/30" />
               )}
            </div>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-semibold text-white tracking-tight">{user.username}</p>
              <p className="text-[9px] font-bold tracking-widest text-white/30">
                {user?.isAdmin ? "Administrateur" : "Utilisateur"}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link href="/account">
          <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-white/10 py-2.5">
            <UserCircle className="mr-3 h-4 w-4 text-white/40" />
            <span className="text-xs font-medium text-white/80">Détails du compte</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/manage-requests">
          <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-white/10 py-2.5">
            <PlusCircle className="mr-3 h-4 w-4 text-white/40" />
            <span className="text-xs font-medium text-white/80">Mes demandes</span>
          </DropdownMenuItem>
        </Link>

        {user.isAdmin && (
          <Link href="/settings">
            <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-white/10 py-2.5">
              <LayoutDashboard className="mr-3 h-4 w-4 text-white/40" />
              <span className="text-xs font-medium text-white/80">Panneau de configuration</span>
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuItem 
          onClick={() => logout()} 
          className="rounded-lg cursor-pointer focus:bg-white/10 py-2.5"
        >
          <ArrowLeftRight className="mr-3 h-4 w-4 text-white/40" />
          <span className="text-xs font-medium text-white/80">Changer d'utilisateur</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => logout()} className="rounded-lg cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400 py-2.5">
          <LogOut className="mr-3 h-4 w-4 opacity-50" />
          <span className="text-xs font-medium">Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
