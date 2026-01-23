'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard, User } from 'lucide-react'

interface LandingNavbarProps {
  isAuthenticated?: boolean
  isLive?: boolean
  isMobilePreview?: boolean
  churchName?: string
  logoUrl?: string | null
}

export function LandingNavbar({ 
  isAuthenticated = false, 
  isLive, 
  isMobilePreview = false,
  churchName = "CellApp",
  logoUrl
}: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className={`${isMobilePreview ? 'sticky' : 'fixed'} top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${isMobilePreview ? 'h-16' : 'h-20'}`}>
          <div className="flex-shrink-0 flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={logoUrl} 
                alt={churchName} 
                className={`rounded-lg object-contain p-1 ${isMobilePreview ? 'w-8 h-8' : 'w-auto max-h-[60px]'}`} 
              />
            ) : (
              <div className={`bg-indigo-600 rounded-lg flex items-center justify-center ${isMobilePreview ? 'w-6 h-6' : 'w-8 h-8'}`}>
                <span className={`font-bold text-white ${isMobilePreview ? 'text-sm' : 'text-lg'}`}>
                  {churchName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className={`${isMobilePreview ? 'hidden' : 'hidden md:flex'} items-center space-x-8`}>
            {isLive && (
              <Link 
                href="#transmissao" 
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-all group animate-in fade-in zoom-in duration-300"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-red-500 tracking-wide">AO VIVO AGORA</span>
              </Link>
            )}
            <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Início
            </Link>
            <Link href="#sobre" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sobre
            </Link>
            <Link href="#celulas" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Células
            </Link>
            <Link href="#agenda" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Agenda
            </Link>
            <Link href="#contato" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Contato
            </Link>
            <Link href="/mensagens" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Mensagens
            </Link>
            <Link href="/links" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Links
            </Link>
          </div>

          <div className="hidden md:block">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Ir para o Painel
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 gap-2"
              >
                <User className="w-4 h-4" />
                Área de Membros
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="text-slate-300 hover:text-white p-2"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2 pt-2">
              {isLive && (
                <Link
                  href="#transmissao"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  AO VIVO AGORA
                </Link>
              )}
              <Link
                href="#"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Início
              </Link>
              <Link
                href="#sobre"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Sobre
              </Link>
              <Link
                href="#celulas"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Células
              </Link>
              <Link
                href="#agenda"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Agenda
              </Link>
              <Link
                href="#contato"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Contato
              </Link>
              <Link
                href="/mensagens"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Mensagens
              </Link>
              <Link
                href="/links"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Links
              </Link>
            </div>

            <div className="mt-4">
              <Link
                href={isAuthenticated ? '/app' : '/login'}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Ir para o Painel
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Área de Membros
                  </>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
