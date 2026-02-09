'use client'

import { Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface LockedStateProps {
  title?: string
  message?: string
}

export default function LockedState({ 
  title = "Acesso Restrito", 
  message = "Este recurso é exclusivo para membros ativos." 
}: LockedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-slate-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        {title}
      </h2>
      
      <p className="text-slate-500 max-w-md mb-8">
        {message}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
          <Link href="/trilho" className="flex items-center gap-2">
            Completar Trilho de Crescimento
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full">
          <Link href="/perfil">
            Ver meu Perfil
          </Link>
        </Button>
      </div>
    </div>
  )
}
