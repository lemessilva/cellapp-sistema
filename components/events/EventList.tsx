'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerForEvent } from '@/app/actions/events'
import { TicketModal } from './TicketModal'
import { toast } from 'sonner'
import { Calendar, MapPin, Loader2, Ticket, Check } from 'lucide-react'

type Event = {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  price: number | string | any // Decimal type from Prisma
  bannerUrl: string | null
  isRegistered: boolean
  registration: {
    id: string
    status: string
    paymentStatus: string
  } | null
}

export function EventList({ events, userName }: { events: Event[], userName: string }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Event | null>(null)

  async function handleRegister(event: Event) {
    if (!confirm(`Confirmar inscrição em ${event.title}?`)) return

    setLoadingId(event.id)
    try {
      const result = await registerForEvent(event.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Inscrição realizada!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao realizar inscrição')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
           const price = Number(event.price)
           const isFree = price === 0
           const isRegistered = event.isRegistered
           const registration = event.registration

           return (
             <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
               <div className="h-32 bg-slate-100 relative">
                 {event.bannerUrl ? (
                   <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                     <Calendar className="w-12 h-12" />
                   </div>
                 )}
                 {isRegistered && (
                   <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                     <Check className="w-3 h-3" /> Inscrito
                   </div>
                 )}
               </div>
               
               <div className="p-5 flex flex-col flex-1">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg text-slate-900 leading-tight">{event.title}</h3>
                   <span className={`text-sm font-semibold px-2 py-0.5 rounded ${isFree ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                     {isFree ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                   </span>
                 </div>
                 
                 <div className="space-y-2 mb-4 flex-1">
                   <p className="text-sm text-slate-500 line-clamp-2">{event.description || 'Sem descrição.'}</p>
                   
                   <div className="flex items-center gap-2 text-xs text-slate-600">
                     <Calendar className="w-3 h-3" />
                     {new Date(event.date).toLocaleDateString('pt-BR')} às {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   
                   {event.location && (
                     <div className="flex items-center gap-2 text-xs text-slate-600">
                       <MapPin className="w-3 h-3" />
                       {event.location}
                     </div>
                   )}
                 </div>

                 <div className="mt-auto pt-4 border-t border-slate-50">
                   {isRegistered && registration ? (
                     <div className="space-y-2">
                       <button
                         onClick={() => setSelectedTicket(event)}
                         className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 rounded-lg text-sm font-medium transition-colors"
                       >
                         <Ticket className="w-4 h-4" /> Ver Ingresso Digital
                       </button>
                       {!isFree && registration.paymentStatus !== 'PAID' && (
                         <p className="text-xs text-center text-yellow-600 bg-yellow-50 p-2 rounded">
                           Pagamento pendente. Procure a secretaria.
                         </p>
                       )}
                     </div>
                   ) : (
                     <button
                       onClick={() => handleRegister(event)}
                       disabled={loadingId === event.id}
                       className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                       {loadingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Inscrever-se Agora'}
                     </button>
                   )}
                 </div>
               </div>
             </div>
           )
        })}
      </div>

      {selectedTicket && selectedTicket.registration && (
        <TicketModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          eventTitle={selectedTicket.title}
          eventDate={selectedTicket.date.toString()}
          eventLocation={selectedTicket.location || ''}
          userName={userName}
          status={selectedTicket.registration.status}
          paymentStatus={selectedTicket.registration.paymentStatus}
          registrationId={selectedTicket.registration.id}
        />
      )}
    </>
  )
}
