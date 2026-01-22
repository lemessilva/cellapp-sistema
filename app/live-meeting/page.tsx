import { LiveMeetingInterface } from '@/components/live/LiveMeetingInterface'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getLiveMeetingData } from '@/app/actions/live-meeting'

export default async function LiveMeetingPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  
  if (!user.celula?.id) {
    redirect('/app/celula')
  }

  // Fetch data
  const data = await getLiveMeetingData(user.celula.id)
  
  if ('error' in data || !data.active || !data.report || !data.members) {
    redirect('/app/celula') // No live meeting, go back
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LiveMeetingInterface user={user} data={data} />
    </div>
  )
}
