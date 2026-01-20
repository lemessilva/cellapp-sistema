'use client'

import { MessageCircle } from 'lucide-react'

interface FloatingWhatsAppButtonProps {
  whatsapp: string
}

export function FloatingWhatsAppButton({ whatsapp }: FloatingWhatsAppButtonProps) {
  if (!whatsapp) return null

  const cleanNumber = whatsapp.replace(/\D/g, '')
  if (!cleanNumber) return null

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  )
}
