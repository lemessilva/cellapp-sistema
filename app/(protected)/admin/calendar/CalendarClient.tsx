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
  endDate?: Date | null
  createdAt: Date
}

interface CalendarClientProps {
  initialEvents: CalendarEvent[]
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPeriod, setIsPeriod] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) return
    if (isPeriod && !endDate) {
      alert('Por favor, selecione a data final para o período.')
      return
    }

    startTransition(async () => {
      const startDateObj = new Date(`${date}T12:00:00`)
      const endDateObj = isPeriod && endDate ? new Date(`${endDate}T12:00:00`) : null

      if (endDateObj && endDateObj < startDateObj) {
        alert('A data final não pode ser anterior à data inicial.')
        return
      }

      const result = await createCalendarEvent(title, startDateObj, endDateObj)
      if (result.success) {
        setTitle('')
        setDate('')
        setEndDate('')
        setIsPeriod(false)
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
              <Label htmlFor="date">{isPeriod ? 'Data Inicial' : 'Data'}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="isPeriod"
                checked={isPeriod}
                onChange={(e) => setIsPeriod(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                disabled={isPending}
              />
              <Label htmlFor="isPeriod" className="text-sm font-medium text-slate-700 cursor-pointer">
                Evento de vários dias (Período)
              </Label>
            </div>

            {isPeriod && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required={isPeriod}
                  disabled={isPending}
                  className="mt-1"
                />
              </div>
            )}
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
                        {event.endDate ? (
                          <>
                            do dia {format(new Date(event.date), 'dd/MM')} ao dia {format(new Date(event.endDate), 'dd/MM/yyyy')}
                          </>
                        ) : (
                          format(new Date(event.date), "EEEE", { locale: ptBR })
                        )}
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
