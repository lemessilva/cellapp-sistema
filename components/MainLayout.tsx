'use client'

import { useSidebar } from './providers/SidebarContext'
import { cn } from '@/lib/utils'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()

  return (
    <main
      className={cn(
        "pt-16 min-h-screen transition-all duration-300 ease-in-out",
        // Desktop: padding-left when sidebar is open
        isOpen ? "md:pl-64" : "pl-0",
        // Mobile: padding-bottom for BottomNav
        "pb-24 md:pb-0"
      )}
    >
      <div className="p-4 md:p-6">
        {children}
      </div>
    </main>
  )
}
