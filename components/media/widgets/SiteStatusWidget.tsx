'use client'

import { useState, useTransition } from 'react'
import { RadioTower, Power, Loader2, Image as ImageIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { toggleLiveStatus } from '@/app/actions/website'

interface SiteStatusWidgetProps {
  isLive: boolean
  activeBannerUrl?: string | null
}

export function SiteStatusWidget({ isLive: initialIsLive, activeBannerUrl }: SiteStatusWidgetProps) {
  const [isLive, setIsLive] = useState(initialIsLive)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    // Optimistic update
    const newState = !isLive
    setIsLive(newState)
    
    startTransition(async () => {
      try {
        await toggleLiveStatus()
        toast.success(newState ? 'Estamos AO VIVO!' : 'Transmissão encerrada.')
      } catch (error) {
        setIsLive(!newState) // Revert
        toast.error('Erro ao atualizar status.')
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <RadioTower className="w-5 h-5 text-indigo-600" />
          Status do Site
        </h3>
        {pending && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      <div className="space-y-6 flex-1">
        {/* Banner Preview */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Banner Ativo</p>
          <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            {activeBannerUrl ? (
              <img src={activeBannerUrl} alt="Banner Ativo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">Sem banner ativo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
              <span className="text-white text-xs font-medium">Visualização da Home</span>
            </div>
          </div>
        </div>

        {/* Live Toggle */}
        <div className={`p-4 rounded-xl border-2 transition-colors ${isLive ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-3 w-3 ${isLive ? '' : 'hidden'}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <Label htmlFor="live-mode" className={`font-bold ${isLive ? 'text-red-600' : 'text-slate-600'}`}>
                {isLive ? 'AO VIVO AGORA' : 'Transmissão Offline'}
              </Label>
            </div>
            <Switch 
              id="live-mode" 
              checked={isLive}
              onCheckedChange={handleToggle}
              disabled={pending}
            />
          </div>
          <p className="text-xs text-slate-500">
            {isLive 
              ? 'O site está exibindo o aviso de "Ao Vivo" para todos os visitantes.' 
              : 'Ative para mostrar o banner de transmissão na Home.'}
          </p>
        </div>
      </div>
    </div>
  )
}
