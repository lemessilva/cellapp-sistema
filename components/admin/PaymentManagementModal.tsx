'use client'

import { useState } from 'react'
import { X, Check, Loader2, DollarSign, Copy, Send } from 'lucide-react'
import { addPaymentTransaction } from '@/app/actions/events'
import { toast } from 'sonner'

type Transaction = {
  id: string
  amount: number
  date: Date
  notes?: string | null
}

type Registration = {
  id: string
  paidAmount: number
  paymentStatus: string
  guestName?: string | null
  user?: {
    nome: string
    telefone: string | null
  } | null
  event: {
    title: string
    price: number
  }
  transactions: Transaction[]
}

interface PaymentManagementModalProps {
  isOpen: boolean
  onClose: () => void
  registration: Registration
  onUpdate: () => void
}

export default function PaymentManagementModal({ isOpen, onClose, registration, onUpdate }: PaymentManagementModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [currentPaid, setCurrentPaid] = useState(registration.paidAmount)
  const [receiptInfo, setReceiptInfo] = useState<{ amount: number; totalPaid: number } | null>(null)

  if (!isOpen) return null

  const price = registration.event.price
  const paid = currentPaid
  const remaining = Math.max(0, price - paid)
  const displayName = registration.user?.nome || registration.guestName || 'Visitante'

  const parsedAmount = Number(amount || 0)
  const remainingAfterInput = Math.max(0, price - (paid + (isNaN(parsedAmount) ? 0 : parsedAmount)))

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Valor inválido')
      return
    }

    const value = Number(amount)
    const newTotalLocal = paid + value

    if (newTotalLocal > price) {
      const restanteLocal = Math.max(0, price - paid)
      toast.error(
        `Valor excede o total do evento. Restante a pagar: R$ ${restanteLocal
          .toFixed(2)
          .replace('.', ',')}`
      )
      return
    }

    setLoading(true)
    try {
      const result = await addPaymentTransaction(registration.id, value, notes)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Pagamento registrado!')
        const totalPagoServidor = typeof result.paidAmount === 'number' ? result.paidAmount : newTotalLocal
        setCurrentPaid(totalPagoServidor)
        setReceiptInfo({
          amount: value,
          totalPaid: totalPagoServidor
        })
        setAmount('')
        setNotes('')
        onUpdate()
      }
    } catch (error) {
      toast.error('Erro ao registrar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMessage = () => {
    if (!receiptInfo) {
      toast.error('Registre o pagamento antes de gerar o comprovante.')
      return
    }

    const restante = Math.max(0, price - receiptInfo.totalPaid)
    const whatsappMessage = `Olá ${
      displayName.split(' ')[0]
    }! Recebemos seu pagamento de R$ ${receiptInfo.amount
      .toFixed(2)
      .replace('.', ',')} referente ao ${registration.event.title}.
✅ Total Pago: R$ ${receiptInfo.totalPaid.toFixed(2).replace('.', ',')}
⏳ Resta Pagar: R$ ${restante.toFixed(2).replace('.', ',')}
Deus abençoe!`

    navigator.clipboard.writeText(whatsappMessage)
    toast.success('Mensagem copiada!')
  }

  const handleOpenWhatsApp = () => {
    if (!receiptInfo) {
      toast.error('Registre o pagamento antes de abrir o WhatsApp.')
      return
    }

    if (!registration.user?.telefone) {
      toast.error('Usuário sem telefone cadastrado')
      return
    }

    const restante = Math.max(0, price - receiptInfo.totalPaid)
    const whatsappMessage = `Olá ${
      displayName.split(' ')[0]
    }! Recebemos seu pagamento de R$ ${receiptInfo.amount
      .toFixed(2)
      .replace('.', ',')} referente ao ${registration.event.title}.
✅ Total Pago: R$ ${receiptInfo.totalPaid.toFixed(2).replace('.', ',')}
⏳ Resta Pagar: R$ ${restante.toFixed(2).replace('.', ',')}
Deus abençoe!`

    const phone = registration.user.telefone.replace(/\D/g, '')
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Gerenciar Pagamento
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase">Valor Total</div>
              <div className="text-lg font-bold text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase">Já Pago</div>
              <div className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paid)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase">Restante</div>
              <div className={`text-lg font-bold ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
              </div>
            </div>
          </div>

          {/* Nova Transação */}
          {remaining > 0 && (
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Registrar Pagamento</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Restante a pagar:{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(remainingAfterInput)}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !amount}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Registrar
                </button>
              </div>
              
              {/* WhatsApp Generator Preview */}
              {amount && Number(amount) > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                            <Send className="w-3 h-3" /> Comprovante Rápido
                        </span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={handleCopyMessage}
                                className="p-1.5 hover:bg-green-200 rounded-md text-green-700 transition-colors"
                                title="Copiar Texto"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                            <button
                                type="button"
                                onClick={handleOpenWhatsApp}
                                className="p-1.5 hover:bg-green-200 rounded-md text-green-700 transition-colors"
                                title="Abrir WhatsApp"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-green-900 whitespace-pre-wrap font-mono bg-white/50 p-2 rounded border border-green-100/50">
                        {whatsappMessage}
                    </p>
                </div>
              )}
            </form>
          )}

          {/* Histórico */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Histórico de Pagamentos</h3>
            {registration.transactions?.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                    Nenhum pagamento registrado
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                    {registration.transactions?.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3">
                            <div>
                                <div className="font-medium text-slate-900">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {new Date(t.date).toLocaleDateString('pt-BR')} às {new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            {t.notes && (
                                <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                    {t.notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
