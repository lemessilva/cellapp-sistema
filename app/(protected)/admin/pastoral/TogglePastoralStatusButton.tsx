'use client'

import { useState } from 'react'
import { togglePastoralMessageStatus } from '@/app/actions/pastoral-messages'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TogglePastoralStatusButton({ id, initialStatus }: { id: string, initialStatus: boolean }) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    setIsLoading(true)
    const newStatus = !status
    
    try {
      const result = await togglePastoralMessageStatus(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setStatus(newStatus)
        toast.success(newStatus ? 'Mensagem ativada!' : 'Mensagem desativada!')
      }
    } catch (error) {
      toast.error('Erro ao alterar status.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full border transition-colors flex items-center justify-center gap-1 mx-auto min-w-[80px]",
        status 
          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
      )}
    >
      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (status ? 'Publicado' : 'Rascunho')}
    </button>
  )
}
