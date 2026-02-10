'use client'

import { useState, useTransition } from 'react'
import { createCalendarEvent, deleteCalendarEvent } from '@/app/actions/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  createdAt: Date
}

interface CalendarClientProps {
  initialEvents: CalendarEvent[]
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) return

    startTransition(async () => {
      // Append T12:00:00 to ensure date stays correct regardless of timezone shifts
      const result = await createCalendarEvent(title, new Date(`${date}T12:00:00`))
      if (result.success) {
        setTitle('')
        setDate('')
        // Ideally we would re-fetch or optimistic update. 
        // Since we used revalidatePath in the action, the server component will refresh if this was a server component.
        // But since we are passing initialEvents, we might not see the update immediately unless we reload or router.refresh().
        // For now, let's just reload the page or assume the parent passes new data if we use router.refresh().
        window.location.reload() 
      } else {
        alert('Erro ao criar evento')
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return

    startTransition(async () => {
      const result = await deleteCalendarEvent(id)
      if (result.success) {
        setEvents(events.filter(e => e.id !== id))
        window.location.reload()
      } else {
        alert('Erro ao excluir evento')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Novo Evento
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Evento</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Santa Ceia"
                required
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar Data'}
            </Button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Agenda Anual</h2>
            <p className="text-sm text-slate-500">Lista de eventos cadastrados</p>
          </div>
          
          <div className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhum evento cadastrado.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                      <span className="text-xs font-bold uppercase">{format(new Date(event.date), 'MMM', { locale: ptBR })}</span>
                      <span className="text-lg font-bold leading-none">{format(new Date(event.date), 'dd')}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{event.title}</h3>
                      <p className="text-sm text-slate-500 capitalize">
                        {format(new Date(event.date), "EEEE", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(event.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    disabled={isPending}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
