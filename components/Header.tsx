'use client'

import Link from 'next/link'
import { Home, Menu } from 'lucide-react'
import { useSidebar } from './providers/SidebarContext'
import NotificationsPopover from '@/components/notifications/NotificationsPopover'

export default function Header({ userId }: { userId?: string }) {
  const { toggle } = useSidebar()

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
          title="Alternar menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <Link href="/app" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
          CellApp
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {userId && <NotificationsPopover userId={userId} />}
        
        <Link 
          href="/app" 
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden md:block"
          title="Início"
        >
          <Home className="w-6 h-6" />
        </Link>
      </div>
    </header>
  )
}
