'use client'

import { useSidebar } from './providers/SidebarContext'
import { cn } from '@/lib/utils'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()

  return (
    <main
      className={cn(
        "pt-16 min-h-screen transition-all duration-300 ease-in-out",
        isOpen ? "md:pl-64" : "pl-0"
      )}
    >
      <div className="p-6">
        {children}
      </div>
    </main>
  )
}
