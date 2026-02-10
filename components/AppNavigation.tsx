'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, User, LogOut, Shield, FileText, Heart, Globe, BarChart3, Calendar, Ticket, Bug, LayoutGrid, ExternalLink, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import { useSidebar } from './providers/SidebarContext'

export default function AppNavigation({ role, isSecretary }: { role: string; isSecretary?: boolean }) {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  // Normaliza para maiúsculo para evitar erro de 'Lider' vs 'LIDER'
  const normalizedRole = (role || 'MEMBRO').toUpperCase()

  let links: { href: string; label: string; icon: any; header?: string }[] = []

  if (normalizedRole === 'MIDIA') {
    links = [
      { href: '/app', label: 'Início', icon: Home },
      { href: '/media', label: 'Mídia', icon: LayoutGrid },
      { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
      { href: '/admin/pastoral', label: 'Mensagem Pastoral', icon: FileText },
      { href: '/admin/trilho', label: 'Trilho', icon: BarChart3 },
      { href: '/admin/website', label: 'Website', icon: Globe },
    ]
  } else {
    links = [
      { href: '/app', label: 'Início', icon: Home },
      { href: '/carteirinha', label: 'Carteirinha', icon: CreditCard },
      { href: '/app/oracao', label: 'Oração Diária', icon: Heart },
      { href: '/app/meus-ingressos', label: 'Meus Ingressos', icon: Ticket },
      { href: '/app/feedback', label: 'Feedback / Bugs', icon: Bug },
    ]

    // Regra de Ouro de Visibilidade
    const isManagement = ['ADMIN', 'SUPERVISOR', 'LIDER', 'LEADER', 'SECRETARIO', 'SECRETARY'].includes(normalizedRole) || isSecretary
    
    // Links de Gestão
    if (isManagement) {
      links.push({ href: '/app/lideranca', label: 'Minha Célula', icon: Users, header: 'Gestão' })
      links.push({ href: '/reports/list', label: 'Relatórios', icon: FileText })
    }

    // Perfil sempre por último na lista do usuário comum
    links.push({ href: '/app/perfil', label: 'Perfil', icon: User })

    if (normalizedRole === 'ADMIN') {
      links.push({ href: '/admin', label: 'Admin', icon: Shield, header: 'Administração' })
      links.push({ href: '/admin/membros', label: 'Gerenciar Membros', icon: Users })
      links.push({ href: '/admin/website', label: 'Website', icon: Globe })
      links.push({ href: '/admin/pastoral', label: 'Mensagem Pastoral', icon: FileText })
      links.push({ href: '/admin/trilho', label: 'Trilho', icon: BarChart3 })
      links.push({ href: '/admin/eventos', label: 'Gestão Eventos', icon: Calendar })
    }
  }

  // Add Homepage link for everyone
  links.push({ href: '/', label: 'Ir para o Site', icon: ExternalLink })

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'flex flex-col w-64 bg-white border-r fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link, index) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <div key={link.href}>
                {link.header && (
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider ml-4 mt-4 mb-2">
                    {link.header}
                  </p>
                )}
                <Link
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      close()
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              </div>
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
