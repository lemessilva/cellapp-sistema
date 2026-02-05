'use client'

import { Calendar, Users, Edit, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

interface NextEventWidgetProps {
  event: {
    id: string
    title: string
    date: Date
    bannerUrl: string | null
    registrationsCount: number
  } | null
}

export function NextEventWidget({ event }: NextEventWidgetProps) {
  if (!event) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <Calendar className="w-10 h-10 text-slate-300 mb-3" />
        <h3 className="font-semibold text-slate-900">Nenhum evento próximo</h3>
        <p className="text-sm text-slate-500 mb-4">Agende um novo evento para começar.</p>
        <Link href="/admin/eventos">
          <Button variant="outline" size="sm">Gerenciar Eventos</Button>
        </Link>
      </div>
    )
  }

  const daysRemaining = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-32 bg-slate-100">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
            <Calendar className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {daysRemaining > 0 ? `Faltam ${daysRemaining} dias` : 'É hoje!'}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{event.title}</h3>
          <p className="text-sm text-slate-500">
            {format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">{event.registrationsCount}</span>
            <span className="text-xs text-slate-500">inscritos</span>
          </div>
        </div>

        <div className="mt-auto">
          <Link href={`/admin/eventos/${event.id}`}>
            <Button className="w-full gap-2" variant="outline">
              <Edit className="w-4 h-4" />
              Editar Arte / Detalhes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
