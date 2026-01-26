'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface AlertBarProps {
  info: {
    isAlertActive: boolean
    globalAlertTitle?: string | null
    globalAlertMessage?: string | null
  }
}

export function AlertBar({ info }: AlertBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!info.isAlertActive || !isVisible || (!info.globalAlertTitle && !info.globalAlertMessage)) return null

  return (
    <div className={`relative z-50 w-full bg-indigo-600 text-white px-4 py-3 shadow-md`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-center text-sm md:text-base font-medium flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
          {info.globalAlertTitle && (
            <span className="font-bold uppercase tracking-wide opacity-90">{info.globalAlertTitle}:</span>
          )}
          <span>{info.globalAlertMessage}</span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white transition-colors p-1"
          aria-label="Fechar aviso"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
