'use client'

import { useState, useEffect } from 'react'
import { Share, Plus, X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 1. Check if running in standalone mode (PWA already installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true
    
    setIsStandalone(isStandaloneMode)

    if (isStandaloneMode) {
      return // Don't show anything if already installed
    }

    // 2. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // 3. Android/Chrome: Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 4. iOS: Show prompt immediately (if not standalone)
    // We can add a delay or check if user has dismissed it before (using localStorage)
    if (isIOSDevice) {
        // Optional: Check localStorage to not annoy user
        const hasDismissed = localStorage.getItem('pwa_prompt_dismissed')
        if (!hasDismissed) {
            setShowPrompt(true)
        }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (!showPrompt || isStandalone) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-96 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-violet-900 text-white p-5 rounded-2xl shadow-2xl border border-violet-700 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-700/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-indigo-600/30 rounded-full blur-2xl"></div>

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-violet-300 hover:text-white hover:bg-violet-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm shrink-0">
             <Smartphone className="w-6 h-6 text-violet-200" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight mb-1">Instale nosso App</h3>
            <p className="text-violet-200 text-sm leading-relaxed mb-4">
              {isIOS 
                ? 'Para uma melhor experiência, adicione este app à sua tela de início.'
                : 'Instale agora para acessar offline e receber notificações!'}
            </p>

            {isIOS ? (
              <div className="bg-violet-950/50 rounded-lg p-3 text-sm space-y-2 border border-violet-800/50">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full text-xs font-bold">1</span>
                  <span>Toque em Compartilhar <Share className="w-4 h-4 inline mx-1" /></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full text-xs font-bold">2</span>
                  <span>Selecione <span className="font-bold text-white">Adicionar à Tela de Início</span> <Plus className="w-4 h-4 inline mx-1 border border-white/40 rounded-[4px] p-[1px]" /></span>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-white text-violet-900 hover:bg-violet-50 font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar Agora
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
