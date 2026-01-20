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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const churchInfo = await prisma.churchInfo.findUnique({
    where: { id: 'main' },
    select: { themeColor: true }
  });

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen`}
      >
        <ThemeWrapper themeColor={churchInfo?.themeColor || 'blue'} />
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
