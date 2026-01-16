'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, User, LogOut, Shield, FileText, Heart, Globe, BarChart3, Calendar, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import { useSidebar } from './providers/SidebarContext'

export default function AppNavigation({ role, isSecretary }: { role: string, isSecretary?: boolean }) {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  let links: { href: string; label: string; icon: any }[] = []

  if (role === 'MIDIA') {
    links = [
      { href: '/admin/website', label: 'Website', icon: Globe },
      { href: '/app/perfil', label: 'Perfil', icon: User },
    ]
  } else {
    links = [
      { href: '/app', label: 'Início', icon: Home },
      { href: '/app/oracao', label: 'Oração Diária', icon: Heart },
      { href: '/app/meus-ingressos', label: 'Meus Ingressos', icon: Ticket },
      { href: '/app/perfil', label: 'Perfil', icon: User },
    ]

    // Add 'Relatórios' if Admin, Leader/Supervisor OR Secretary
    if (['LIDER', 'SUPERVISOR', 'ADMIN'].includes(role) || isSecretary) {
      // Insert before 'Perfil' (which is last)
      links.splice(links.length - 1, 0, { href: '/app/celula/reuniao', label: 'Relatório', icon: FileText })
    }

    if (['LIDER', 'SUPERVISOR', 'ADMIN'].includes(role)) {
      // Insert 'Célula' before 'Relatórios' (or 'Perfil' if no reports)
      // Find index of 'Perfil'
      const perfilIndex = links.findIndex(l => l.href === '/app/perfil')
      links.splice(perfilIndex, 0, { href: '/app/lideranca', label: 'Célula', icon: Users })
    }
    
    if (role === 'ADMIN') {
        links.push({ href: '/admin', label: 'Admin', icon: Shield })
        links.push({ href: '/admin/membros', label: 'Gerenciar Membros', icon: Users })
        links.push({ href: '/admin/website', label: 'Website', icon: Globe })
        links.push({ href: '/admin/trilho', label: 'Trilho', icon: BarChart3 })
        links.push({ href: '/admin/eventos', label: 'Gestão Eventos', icon: Calendar })
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside 
        className={cn(
          "flex flex-col w-64 bg-white border-r fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  // On mobile, close sidebar after clicking a link
                  if (window.innerWidth < 768) {
                    close()
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
