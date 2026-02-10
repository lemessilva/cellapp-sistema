import { getEventDetails } from '@/app/actions/events'
import { EventRegistrationsTable } from '@/components/admin/EventRegistrationsTable'
import { ArrowLeft, Calendar, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    redirect('/app')
  }

  const { id } = await params
  const result = await getEventDetails(id)

  if ('error' in result || !result.event) {
    return notFound()
  }

  const { event } = result
  
  // Calculate stats
  const totalRegistrants = event.registrations.length
  const spotsLeft = event.maxCapacity ? event.maxCapacity - totalRegistrants : 'Ilimitado'
  const totalRevenue = event.registrations.reduce((acc, r) => acc + Number(r.paidAmount), 0)
  const paidCount = event.registrations.filter(r => r.paymentStatus === 'PAID').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/eventos" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-slate-500">
            {new Date(event.date).toLocaleDateString('pt-BR')} • {event.location || 'Local não definido'}
          </p>
        </div>
        <div className="ml-auto">
             <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {event.isOpen ? 'Inscrições Abertas' : 'Fechado'}
             </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col">
                <span className="text-sm text-slate-500 mb-1">Total Inscritos</span>
                <span className="text-2xl font-bold text-slate-900">{totalRegistrants}</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col">
                <span className="text-sm text-slate-500 mb-1">Vagas Restantes</span>
                <span className="text-2xl font-bold text-indigo-600">{spotsLeft}</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col">
                <span className="text-sm text-slate-500 mb-1">Pagantes</span>
                <span className="text-2xl font-bold text-green-600">{paidCount}</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col">
                <span className="text-sm text-slate-500 mb-1">Arrecadação</span>
                <span className="text-2xl font-bold text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                </span>
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Lista de Participantes</h2>
        {/* Passamos o preço do evento para saber se deve mostrar botão de pagamento */}
        <EventRegistrationsTable 
            registrations={event.registrations.map(r => ({
                ...r,
                paidAmount: Number(r.paidAmount),
                event: {
                    title: event.title,
                    price: Number(event.price)
                },
                transactions: r.transactions.map(t => ({
                    ...t,
                    amount: Number(t.amount),
                    date: t.createdAt
                }))
            }))} 
            eventPrice={Number(event.price)} 
            eventTitle={event.title}
        />
      </div>
    </div>
  )
}
