import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getSystemFeedbacks } from '@/app/actions/feedback'
import FeedbackRow from '@/components/admin/FeedbackRow'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbacksPage() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/app')
  }

  const feedbacks = await getSystemFeedbacks()
  console.log('Feedbacks encontrados:', feedbacks.length)

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
                Anexo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resumo
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
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  Nenhum feedback enviado até o momento.
                </td>
              </tr>
            )}

            {feedbacks.map((feedback: any) => (
              <FeedbackRow key={feedback.id} feedback={feedback} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

