import { getFutureEvents } from '@/app/actions/events'
import { getUser } from '@/lib/auth'
import { EventList } from '@/components/events/EventList'
import { Calendar, Ticket } from 'lucide-react'

export default async function MemberEventsPage() {
  const [events, user] = await Promise.all([
    getFutureEvents(),
    getUser()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Eventos & Inscrições</h1>
        <p className="text-slate-500">Inscreva-se nos próximos eventos da igreja.</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Nenhum evento disponível</h3>
          <p className="text-slate-500">Fique atento, logo teremos novidades!</p>
        </div>
      ) : (
        <EventList 
            userName={user?.nome || 'Participante'}
            // @ts-ignore - Prisma types matching manual types can be tricky, passing necessary fields
            events={events.map(e => ({
                ...e,
                price: Number(e.price), // Ensure number
                description: e.description || null,
                location: e.location || null,
                bannerUrl: e.bannerUrl || null,
                isRegistered: e.isRegistered,
                registration: e.registration ? {
                    id: e.registration.id,
                    status: e.registration.status,
                    paymentStatus: e.registration.paymentStatus
                } : null
            }))} 
        />
      )}
    </div>
  )
}
