import { PastoralForm } from '../_components/PastoralForm'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewPastoralMessagePage() {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    redirect('/app')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nova Mensagem Pastoral</h1>
        <p className="text-slate-500">Escreva uma nova palavra para a igreja.</p>
      </div>

      <PastoralForm />
    </div>
  )
}
