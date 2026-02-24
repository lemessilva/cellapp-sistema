import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getSystemFeedbackById, updateFeedbackStatus } from '@/app/actions/feedback'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Calendar, User, Tag, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function FeedbackDetailPage({ params }: Props) {
  const { id } = await params
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/app')
  }

  const feedback = await getSystemFeedbackById(id)

  if (!feedback) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-800">Feedback não encontrado</h2>
        <Link href="/admin/feedbacks" className="text-indigo-600 hover:underline mt-4 block">
          Voltar para a lista
        </Link>
      </div>
    )
  }

  const isBug = feedback.type === 'BUG'
  const isResolved = feedback.status === 'RESOLVED'
  const isInAnalysis = feedback.status === 'REVIEWED'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/feedbacks"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Detalhes do Feedback</h1>
          <p className="text-slate-500 text-sm">
            Visualizando feedback #{feedback.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Conteúdo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagem do Feedback se houver */}
          {feedback.imageUrl && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Imagem Anexada
              </h3>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                <Image
                  src={feedback.imageUrl}
                  alt="Anexo do feedback"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <a 
                  href={feedback.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Abrir imagem original
                </a>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isBug ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isBug ? 'Bug / Erro' : feedback.type === 'PRAISE' ? 'Elogio' : 'Sugestão'}
              </span>
              <span className="text-slate-400 text-sm">•</span>
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(feedback.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="prose prose-slate max-w-none">
              <div className="bg-slate-50 rounded-xl p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                {feedback.message}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral - Informações e Ações */}
        <div className="space-y-6">
          {/* Card do Usuário */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Quem enviou
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-lg font-semibold text-slate-700">
                {feedback.user.foto_url ? (
                  <Image
                    src={feedback.user.foto_url}
                    alt={feedback.user.nome}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  feedback.user.nome.charAt(0)
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900">{feedback.user.nome}</div>
                <div className="text-xs text-slate-500">{feedback.user.email}</div>
              </div>
            </div>
          </div>

          {/* Card de Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Status Atual
            </h3>
            
            <form action={updateFeedbackStatus} className="space-y-4">
              <input type="hidden" name="id" value={feedback.id} />
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="status"
                    value="PENDING"
                    defaultChecked={feedback.status === 'PENDING'}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700"></span>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 cursor-pointer hover:bg-amber-100">
                  <input
                    type="radio"
                    name="status"
                    value="REVIEWED"
                    defaultChecked={feedback.status === 'REVIEWED'}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-amber-900">Em Análise</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 cursor-pointer hover:bg-emerald-100">
                  <input
                    type="radio"
                    name="status"
                    value="RESOLVED"
                    defaultChecked={feedback.status === 'RESOLVED'}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-emerald-900">Resolvido</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                Atualizar Status
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
