'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface AlertBarProps {
  config: {
    alertActive: boolean
    alertText?: string | null
    alertColor?: string
    alertLink?: string | null
  }
}

export function AlertBar({ config }: AlertBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!config.alertActive || !isVisible || !config.alertText) return null

  const bgColor = config.alertColor || 'bg-blue-600'

  return (
    <div className={`relative z-50 w-full ${bgColor} text-white px-4 py-3 shadow-md`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-center text-sm md:text-base font-medium">
          {config.alertLink ? (
            <a href={config.alertLink} className="hover:underline underline-offset-4">
              {config.alertText}
            </a>
          ) : (
            <span>{config.alertText}</span>
          )}
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
