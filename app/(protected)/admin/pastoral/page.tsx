import Link from 'next/link'
import { Plus, MessageSquare, Calendar, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { getPastoralMessages, deletePastoralMessage, togglePastoralMessageStatus } from '@/app/actions/pastoral-messages'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DeletePastoralButton } from './DeletePastoralButton'
import { TogglePastoralStatusButton } from './TogglePastoralStatusButton'

export default async function PastoralMessagesPage() {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    redirect('/app')
  }

  const messages = await getPastoralMessages()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mensagens Pastorais</h1>
          <p className="text-slate-500">Publique palavras semanais para a igreja.</p>
        </div>
        <Link 
          href="/admin/pastoral/novo" 
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Mensagem
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma mensagem publicada ainda.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{msg.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {msg.content.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(msg.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <TogglePastoralStatusButton id={msg.id} initialStatus={msg.isActive} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/pastoral/${msg.id}`}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeletePastoralButton id={msg.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
