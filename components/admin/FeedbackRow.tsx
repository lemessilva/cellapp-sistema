'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { updateFeedbackStatus } from '@/app/actions/feedback'
import { AlertCircle } from 'lucide-react'

interface FeedbackRowProps {
  feedback: any // Using any for simplicity as per previous code context, ideally should be typed
}

export default function FeedbackRow({ feedback }: FeedbackRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const isBug = feedback.tipo === 'BUG'
  const isResolved = feedback.status === 'RESOLVIDO'
  const isInAnalysis = feedback.status === 'EM_ANALISE'

  const rowClass = isResolved
    ? 'bg-emerald-50'
    : isInAnalysis
    ? 'bg-amber-50'
    : ''

  return (
    <tr className={`group hover:bg-slate-50 transition-colors ${rowClass}`}>
      <td className="px-4 py-3 text-sm text-slate-700">
        {new Date(feedback.createdAt).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-slate-700">
            {feedback.user.foto_url ? (
              <Image
                src={feedback.user.foto_url}
                alt={feedback.user.nome}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              feedback.user.nome.charAt(0)
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">
              {feedback.user.nome}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            isBug
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isBug ? 'Bug' : 'Sugestão'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-800 max-w-[200px] truncate" title={feedback.titulo}>
        {feedback.titulo}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            isResolved
              ? 'bg-emerald-100 text-emerald-700'
              : isInAnalysis
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {feedback.status === 'PENDENTE' && 'Pendente'}
          {feedback.status === 'EM_ANALISE' && 'Em Análise'}
          {feedback.status === 'RESOLVIDO' && 'Resolvido'}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
              Ver / Editar
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isBug
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isBug ? 'Bug' : 'Sugestão'}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(feedback.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <DialogTitle className="text-xl">{feedback.titulo}</DialogTitle>
              <DialogDescription>
                Enviado por {feedback.user.nome} ({feedback.user.email})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap">
                {feedback.descricao}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Atualizar Status
                </h4>
                <form action={async (formData) => {
                    await updateFeedbackStatus(formData)
                    setIsOpen(false)
                }} className="flex items-center gap-4">
                  <input type="hidden" name="id" value={feedback.id} />
                  <select
                    name="status"
                    defaultValue={feedback.status}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM_ANALISE">Em Análise</option>
                    <option value="RESOLVIDO">Resolvido</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Salvar
                  </button>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  )
}
