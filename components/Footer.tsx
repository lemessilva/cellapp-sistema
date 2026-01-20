'use client'

import Link from 'next/link'
import { Instagram, MapPin, MessageCircle, Youtube } from 'lucide-react'

interface FooterProps {
  contactWhatsapp: string
  footerAddress: string
  socialInstagram: string
  socialYoutube?: string | null
  user?: any
  isPreview?: boolean
  churchName?: string
  logoUrl?: string | null
}

export function Footer({ 
  contactWhatsapp, 
  footerAddress, 
  socialInstagram, 
  socialYoutube,
  user, 
  isPreview = false,
  churchName = "CellApp",
  logoUrl
}: FooterProps) {
  return (
    <footer id="contato" className={`bg-slate-950 border-t border-slate-900 ${isPreview ? 'py-10' : 'pt-20 pb-10'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${isPreview ? 'gap-8' : 'md:grid-cols-4 gap-12'} mb-16`}>
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={churchName} 
                  className="h-10 w-auto object-contain bg-white/5 rounded-lg p-1" 
                />
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-xl">{churchName.charAt(0)}</span>
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-white">{churchName}</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8">
              Levando o amor de Deus a cada lar, transformando vidas através do discipulado e da comunhão.
            </p>
            <div className="flex gap-4">
              {socialInstagram && (
                <a href={`https://instagram.com/${socialInstagram.replace('@', '')}`} target="_blank" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialYoutube && (
                <a href={socialYoutube} target="_blank" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {!isPreview && (
            <div>
              <h4 className="font-bold text-white mb-6">Links Rápidos</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Início</Link></li>
                <li><Link href="#sobre" className="text-slate-400 hover:text-indigo-400 transition-colors">Sobre Nós</Link></li>
                <li><Link href="#celulas" className="text-slate-400 hover:text-indigo-400 transition-colors">Encontrar Célula</Link></li>
                <li>
                  {user ? (
                    <Link href="/app" className="text-slate-400 hover:text-indigo-400 transition-colors">Meu Painel</Link>
                  ) : (
                    <Link href="/login" className="text-slate-400 hover:text-indigo-400 transition-colors">Área de Membros</Link>
                  )}
                </li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-bold text-white mb-6">Contato</h4>
            <ul className="space-y-4 text-slate-400">
              {footerAddress && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="whitespace-pre-line">{footerAddress}</span>
                </li>
              )}
              {contactWhatsapp && (
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>{contactWhatsapp}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
          <p>&copy; 2024 CellApp. Todos os direitos reservados.</p>
          <p>Desenvolvido com ❤️ para o Reino.</p>
        </div>
      </div>
    </footer>
  )
}
