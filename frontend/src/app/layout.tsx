import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import RootWrapper from "@/components/root-wrapper";
import { AuthProvider } from "@/context/auth-context";
import { AppShell } from "@/components/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Osmose",
  description: "Modern self-hosted streaming",
  icons: {
    icon: "/osmosefavicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <AuthProvider>
          <RootWrapper>
            <TooltipProvider>
              <AppShell>
                {children}
              </AppShell>
              <Toaster />
            </TooltipProvider>
          </RootWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
