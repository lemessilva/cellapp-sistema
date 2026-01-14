import { getPublicEventDetails } from '@/app/actions/events'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, Clock, DollarSign, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SmartRegistrationForm from './SmartRegistrationForm'
import { getUser } from '@/lib/auth'

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getPublicEventDetails(id)
  const user = await getUser()

  if (!event) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* Banner */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        {event.bannerUrl ? (
          <img 
            src={event.bannerUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <Calendar className="w-24 h-24 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-10">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Main Info */}
          <div className="flex-1 space-y-8">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-bold mb-4 border border-indigo-500/20">
                {event.isOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas'}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>{new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span>{new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  <span>{event.location || 'Local a definir'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4">Sobre o evento</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {event.description || 'Sem descrição.'}
              </p>
            </div>
          </div>

          {/* Sidebar / Form */}
          <div className="w-full md:w-96 flex-shrink-0">
             <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 sticky top-8 shadow-xl shadow-black/50">
                <div className="mb-6 flex items-center justify-between pb-6 border-b border-slate-800">
                   <div>
                     <p className="text-sm text-slate-400">Valor da Inscrição</p>
                     <p className="text-3xl font-bold text-white">
                        {Number(event.price) === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2).replace('.', ',')}`}
                     </p>
                   </div>
                   <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                      <DollarSign className="w-6 h-6" />
                   </div>
                </div>

                {event.isOpen ? (
                    <SmartRegistrationForm 
                      eventId={event.id} 
                      eventTitle={event.title}
                      eventDate={event.date}
                      eventLocation={event.location}
                      currentUser={user}
                    />
                ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center text-red-200">
                        Inscrições encerradas para este evento.
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
