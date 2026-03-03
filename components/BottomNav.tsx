'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Heart, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from './providers/SidebarContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { toggle, isOpen } = useSidebar()

  const links = [
    {
      href: '/app',
      label: 'Início',
      icon: Home,
      isActive: (path: string) => path === '/app' || path === '/'
    },
    {
      href: '/agenda',
      label: 'Agenda',
      icon: Calendar,
      isActive: (path: string) => path.startsWith('/agenda')
    },
    {
      href: '/app/oracao',
      label: 'Pedidos',
      icon: Heart,
      isActive: (path: string) => path.startsWith('/app/oracao')
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-between items-center px-6 h-16 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {links.map((link) => {
        const Icon = link.icon
        const active = link.isActive(pathname)
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[64px]',
              active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Icon className={cn("w-6 h-6", active && "fill-current/10")} />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        )
      })}

      <button
        onClick={toggle}
        className={cn(
          'flex flex-col items-center justify-center gap-1 min-w-[64px]',
          isOpen ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
        )}
      >
        <Menu className="w-6 h-6" />
        <span className="text-[10px] font-medium">Mais</span>
      </button>
    </nav>
  )
}
