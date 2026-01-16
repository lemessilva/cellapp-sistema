import { PastoralForm } from '../_components/PastoralForm'
import { getPastoralMessageById } from '@/app/actions/pastoral-messages'
import { getUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'

export default async function EditPastoralMessagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    redirect('/app')
  }

  const { id } = await params
  const message = await getPastoralMessageById(id)

  if (!message) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar Mensagem</h1>
        <p className="text-slate-500">Atualize o conteúdo da mensagem pastoral.</p>
      </div>

      <PastoralForm initialData={message} />
    </div>
  )
}
