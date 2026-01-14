import { getGrowthSteps } from '@/app/actions/growth-track'
import GrowthTrackManager from '@/components/admin/GrowthTrackManager'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function GrowthTrackPage() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/app')
  }

  const steps = await getGrowthSteps()

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Trilho de Crescimento</h1>
        <p className="text-slate-500 mt-2">
          Defina a jornada de evolução espiritual dos membros da igreja.
        </p>
      </div>

      <GrowthTrackManager initialSteps={steps} />
    </div>
  )
}
