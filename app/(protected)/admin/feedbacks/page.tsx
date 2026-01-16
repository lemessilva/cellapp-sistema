import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getSystemFeedbacks, updateFeedbackStatus } from '@/app/actions/feedback'
import Image from 'next/image'

export default async function AdminFeedbacksPage() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/app')
  }

  const feedbacks = await getSystemFeedbacks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedbacks do Sistema</h1>
          <p className="text-slate-500 text-sm">
            Acompanhe os erros e sugestões enviados pelos usuários.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quem enviou
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {feedbacks.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  Nenhum feedback enviado até o momento.
                </td>
              </tr>
            )}

            {feedbacks.map((feedback: any) => {
              const isBug = feedback.tipo === 'BUG'
              const isResolved = feedback.status === 'RESOLVIDO'
              const isInAnalysis = feedback.status === 'EM_ANALISE'

              const rowClass = isResolved
                ? 'bg-emerald-50'
                : isInAnalysis
                ? 'bg-amber-50'
                : ''

              return (
                <tr
                  key={feedback.id}
                  className={rowClass}
                >
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
                  <td className="px-4 py-3 text-sm text-slate-800">
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
                    <form
                      action={updateFeedbackStatus}
                      className="inline-flex items-center gap-2"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={feedback.id}
                      />
                      <select
                        name="status"
                        defaultValue={feedback.status}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="EM_ANALISE">Em Análise</option>
                        <option value="RESOLVIDO">Resolvido</option>
                      </select>
                      <button
                        type="submit"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Atualizar
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

