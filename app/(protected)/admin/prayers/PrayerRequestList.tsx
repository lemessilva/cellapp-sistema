'use client'

import { PrayerRequest } from '@prisma/client'
import { markPrayerAsPrayed } from '@/app/actions/prayer'
import { toast } from 'sonner'
import { Check, Clock, Phone, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PrayerRequestListProps {
  initialRequests: PrayerRequest[]
}

export default function PrayerRequestList({ initialRequests }: PrayerRequestListProps) {
  return (
    <div className="space-y-4">
      {initialRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-center mb-4">
             <div className="p-4 bg-slate-100 rounded-full">
                <User className="h-8 w-8 text-slate-400" />
             </div>
          </div>
          <h3 className="text-lg font-medium text-slate-900">Nenhum pedido de oração</h3>
          <p className="text-slate-500 mt-1">Os pedidos de oração enviados aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialRequests.map((request) => (
            <PrayerRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

function PrayerRequestCard({ request }: { request: PrayerRequest }) {
  const [isPending, startTransition] = useTransition()
  const isPrayed = request.status === 'PRAYED'

  const handleMarkAsPrayed = () => {
    startTransition(async () => {
      const result = await markPrayerAsPrayed(request.id)
      if (result.success) {
        toast.success('Pedido marcado como orado!')
      } else {
        toast.error(result.error || 'Erro ao atualizar status')
      }
    })
  }

  return (
    <div className={`p-6 rounded-lg border shadow-sm transition-all ${
      isPrayed 
        ? 'bg-slate-50 border-slate-200 opacity-75' 
        : 'bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isPrayed ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
            <User size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isPrayed ? 'text-slate-700' : 'text-slate-900'}`}>{request.name}</h3>
            {request.phone && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Phone size={12} />
                <span>{request.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isPrayed 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isPrayed ? 'Orado' : 'Pendente'}
        </div>
      </div>

      <p className={`text-sm mb-4 whitespace-pre-wrap ${isPrayed ? 'text-slate-500' : 'text-slate-700'}`}>
        {request.content}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={12} />
          <span>{format(new Date(request.createdAt), "d 'de' MMM, HH:mm", { locale: ptBR })}</span>
        </div>

        {!isPrayed && (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            onClick={handleMarkAsPrayed}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">Salvando...</span>
            ) : (
              <span className="flex items-center gap-2">
                <Check size={16} />
                Marcar como Orado
              </span>
            )}
          </Button>
        )}
        {isPrayed && (
             <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <Check size={14} />
                <span>Orado</span>
             </div>
        )}
      </div>
    </div>
  )
}
