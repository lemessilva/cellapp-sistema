import { getCalendarEvents } from '@/app/actions/calendar'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format, isPast, isToday, isFuture, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const events = await getCalendarEvents()

  // Group events by month
  const eventsByMonth: Record<string, typeof events> = {}
  
  events.forEach(event => {
    const monthKey = format(new Date(event.date), 'MMMM yyyy', { locale: ptBR })
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = []
    }
    eventsByMonth[monthKey].push(event)
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Agenda {new Date().getFullYear()}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {events.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p>Nenhum evento cadastrado para este ano.</p>
          </div>
        ) : (
          <div className="space-y-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200" />

            {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month} className="relative">
                {/* Month Header */}
                <div className="sticky top-20 z-10 mb-6 ml-14">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold capitalize border border-indigo-200 shadow-sm">
                    {month}
                  </span>
                </div>

                <div className="space-y-6">
                  {monthEvents.map((event) => {
                    const eventDate = new Date(event.date)
                    const isEventPast = isPast(eventDate) && !isToday(eventDate)
                    const isEventFuture = isFuture(eventDate) || isToday(eventDate)

                    return (
                      <div 
                        key={event.id} 
                        className={`relative flex items-start gap-4 ${isEventPast ? 'opacity-60 grayscale' : ''}`}
                      >
                        {/* Dot on Timeline */}
                        <div className={`
                          absolute left-6 -translate-x-1/2 w-3 h-3 rounded-full border-2 
                          ${isEventFuture ? 'bg-indigo-600 border-white ring-4 ring-indigo-50' : 'bg-slate-400 border-white ring-4 ring-slate-50'}
                        `} />

                        {/* Date Box */}
                        <div className="ml-12 min-w-[60px] flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200 p-2 shadow-sm">
                          <span className="text-xs font-bold uppercase text-slate-500">
                            {format(eventDate, 'EEE', { locale: ptBR }).replace('.', '')}
                          </span>
                          <span className={`text-xl font-bold ${isEventFuture ? 'text-indigo-600' : 'text-slate-600'}`}>
                            {format(eventDate, 'dd')}
                          </span>
                        </div>

                        {/* Event Details */}
                        <div className={`flex-1 bg-white p-4 rounded-xl border shadow-sm ${isEventFuture ? 'border-indigo-100 shadow-indigo-50' : 'border-slate-200'}`}>
                          <h3 className={`font-bold ${isEventFuture ? 'text-slate-900' : 'text-slate-600'}`}>
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
