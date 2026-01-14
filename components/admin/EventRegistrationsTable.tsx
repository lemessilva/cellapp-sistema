'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateRegistrationPayment } from '@/app/actions/events'
import { toast } from 'sonner'
import { Check, Loader2, Copy, Undo2, DollarSign } from 'lucide-react'
import PaymentManagementModal from './PaymentManagementModal'

type Transaction = {
  id: string
  amount: number
  date: Date
  notes?: string | null
}

type Registration = {
  id: string
  status: string
  paymentStatus: string
  paidAmount: number
  transactions: Transaction[]
  guestName?: string | null
  user?: {
    id: string
    nome: string
    email: string | null
    telefone: string | null
    role: string
  } | null
  event: {
    title: string
    price: number
  }
}

export function EventRegistrationsTable({ registrations, eventPrice, eventTitle }: { registrations: Registration[], eventPrice: number, eventTitle: string }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)

  // Helper to refresh data - In a real app we might use a router refresh or context
  // For now, the actions revalidatePath, so a router refresh would be ideal.
  // But since we are inside a client component receiving props, we rely on the parent to refresh or router.refresh()
  // We can inject router.
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenPayment = (reg: Registration) => {
    // Inject event data into registration if missing (it comes from props usually but let's ensure)
    const regWithEvent = { ...reg, event: { title: eventTitle, price: eventPrice } }
    setSelectedRegistration(regWithEvent)
    setIsModalOpen(true)
  }


  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Participante</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamento</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Pago</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Nenhum inscrito ainda.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{reg.user?.nome || reg.guestName || 'Visitante'}</div>
                    <div className="text-xs text-slate-500">{reg.user?.role || 'Convidado'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{reg.user?.email || '-'}</div>
                    <div className="text-xs">{reg.user?.telefone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                      reg.status === 'WAITLIST' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {reg.status === 'CONFIRMED' ? 'Confirmado' : reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reg.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reg.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(reg.paidAmount))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* Copy Email */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(reg.user?.email || '')
                                toast.success('Email copiado!')
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Copiar Email"
                        >
                            <Copy className="w-4 h-4" />
                        </button>

                        {/* Payment Actions */}
                        <button
                            onClick={() => handleOpenPayment(reg)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                reg.paymentStatus === 'PAID' 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                : reg.paymentStatus === 'PARTIAL'
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Gerenciar Pagamento"
                        >
                            <DollarSign className="w-3 h-3" />
                            {reg.paymentStatus === 'PAID' ? 'Pago' : 'Gerenciar'}
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRegistration && (
        <PaymentManagementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          registration={selectedRegistration}
          onUpdate={() => {
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
