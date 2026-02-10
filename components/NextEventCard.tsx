import { getNextCalendarEvent } from '@/app/actions/calendar'
import { Calendar, Clock } from 'lucide-react'
import { format, differenceInCalendarDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function NextEventCard() {
  const event = await getNextCalendarEvent()

  if (!event) return null

  const now = new Date()
  const eventDate = new Date(event.date)
  const daysRemaining = differenceInCalendarDays(eventDate, now)

  // Calculate strict days remaining
  let timeText = ''
  if (daysRemaining < 0) {
      timeText = 'Aconteceu recentemente'
  } else if (daysRemaining === 0) {
      timeText = 'É hoje!'
  } else if (daysRemaining === 1) {
      timeText = 'Falta 1 dia'
  } else {
      timeText = `Faltam ${daysRemaining} dias`
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Calendar className="w-32 h-32 transform rotate-12 -translate-y-8 translate-x-8" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-indigo-100 mb-1">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Próxima Data Importante</span>
        </div>

        <h3 className="text-2xl font-bold mb-1 leading-tight">
          {event.title}
        </h3>
        
        <p className="text-indigo-100 text-sm mb-4">
          {format(eventDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>

        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold">
          <Clock className="w-4 h-4" />
          <span>{timeText}</span>
        </div>
      </div>
    </div>
  )
}
