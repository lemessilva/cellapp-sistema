import { EventForm } from '@/components/admin/EventForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/eventos" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Evento</h1>
          <p className="text-slate-500">Preencha as informações para criar um novo evento.</p>
        </div>
      </div>

      <EventForm />
    </div>
  )
}
