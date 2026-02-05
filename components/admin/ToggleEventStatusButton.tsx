"use client"

import { useTransition } from "react"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { toggleEventStatus } from "@/app/actions/events"

interface ToggleEventStatusButtonProps {
  eventId: string
  isOpen: boolean
}

export function ToggleEventStatusButton({ eventId, isOpen }: ToggleEventStatusButtonProps) {
  const [isPending, startTransition] = useTransition()
  
  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleEventStatus(eventId, !isOpen)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isOpen ? "Evento encerrado (oculto)!" : "Evento reaberto (visível)!")
      }
    })
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors ${
        isOpen 
          ? "text-green-600 hover:text-green-900 hover:bg-green-50" 
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
      }`}
      title={isOpen ? "Encerrar evento (ocultar)" : "Reabrir evento (mostrar)"}
    >
      {isOpen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  )
}
