import { getPrayerRequests } from '@/app/actions/prayer'
import PrayerRequestList from './PrayerRequestList'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function PrayerRequestsPage() {
  const user = await getUser()
  if (!user || !['ADMIN', 'LIDER', 'SUPERVISOR'].includes(user.role)) {
    redirect('/app')
  }

  const requests = await getPrayerRequests()

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pedidos de Oração</h1>
          <p className="text-slate-500 mt-1">Gerencie os pedidos de oração recebidos pelo site.</p>
        </div>
        <a href="/admin" className="text-indigo-600 hover:text-indigo-800 font-medium">Voltar ao Painel</a>
      </header>

      <PrayerRequestList initialRequests={requests} />
    </div>
  )
}
