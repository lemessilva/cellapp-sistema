import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getSongs } from '@/app/actions/worship'
import { RepertoryForm } from '@/components/worship/RepertoryForm'

export default async function WorshipRepertoryPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const tags = user.ministryTags || []
  const isWorshipLeader = tags.includes('LOUVOR_LIDER') || user.role === 'ADMIN'

  if (!isWorshipLeader) {
    redirect('/app')
  }

  const songs = await getSongs()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Repertório de Louvor</h1>
        <p className="text-slate-500 mt-1">
          Cadastre e organize as músicas usadas nos cultos.
        </p>
      </div>

      <RepertoryForm songs={songs as any} />
    </div>
  )
}
