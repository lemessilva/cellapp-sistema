import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CellApp",
  description: "Gestão de Células",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Sensação de app nativo
}

import { SidebarProvider } from '@/components/providers/SidebarContext';
import { prisma } from '@/lib/prisma';
import { ThemeWrapper } from '@/components/website/ThemeWrapper';
import { getUser } from '@/lib/auth';
import { LiveMeetingWatcher } from '@/components/live/LiveMeetingWatcher';
import { AlertBar } from '@/components/home/AlertBar';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { PWAProvider } from '@/components/providers/PWAProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [churchInfo, siteConfig] = await Promise.all([
    prisma.churchInfo.findUnique({
      where: { id: 'main' },
      select: { 
        themeColor: true
      }
    }),
    prisma.siteConfiguration.findUnique({
      where: { id: 1 },
      select: {
        alertActive: true,
        alertTitle: true,
        alertText: true,
        alertColor: true,
        alertLink: true
      }
    })
  ]);

  const user = await getUser();

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen`}
      >
        <ThemeWrapper themeColor={churchInfo?.themeColor || 'blue'} />
        <PWAProvider>
          <SidebarProvider>
            <AlertBar config={{
              alertActive: siteConfig?.alertActive || false,
              alertTitle: siteConfig?.alertTitle || null,
              alertText: siteConfig?.alertText || null,
              alertColor: siteConfig?.alertColor || 'bg-indigo-600',
              alertLink: siteConfig?.alertLink || null
            }} />
            <LiveMeetingWatcher cellId={user?.celula?.id} />
            <InstallPrompt />
            {children}
          </SidebarProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
