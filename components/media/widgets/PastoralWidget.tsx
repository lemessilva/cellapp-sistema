'use client'

import { FileText, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

interface PastoralWidgetProps {
  message: {
    id: string
    titulo: string
    publishedAt: Date
  } | null
}

export function PastoralWidget({ message }: PastoralWidgetProps) {
  if (!message) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-full min-h-[150px] shadow-sm">
        <FileText className="w-8 h-8 text-slate-300 mb-2" />
        <h3 className="font-semibold text-slate-900 text-sm">Nenhuma mensagem recente</h3>
        <Link href="/admin/pastoral" className="mt-3">
          <Button variant="outline" size="sm">Escrever Mensagem</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <FileText className="w-24 h-24 text-indigo-600 rotate-12" />
      </div>
      
      <div className="relative z-10">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-indigo-600" />
          Última Mensagem Pastoral
        </h3>

        <div className="mb-4">
          <h4 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight mb-1">
            {message.titulo}
          </h4>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-3 h-3" />
            {format(new Date(message.publishedAt), "dd 'de' MMMM", { locale: ptBR })}
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Link href={`/mensagem/${message.id}`} target="_blank" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <ExternalLink className="w-3 h-3" />
              Visualizar
            </Button>
          </Link>
          <Link href={`/admin/pastoral`} className="flex-1">
             <Button variant="secondary" size="sm" className="w-full">
               Gerenciar
             </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
