import { getCalendarEvents } from '@/app/actions/calendar'
import CalendarClient from './CalendarClient'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const user = await getUser()
  if (!user || !['ADMIN', 'SUPERVISOR'].includes(user.role)) {
    redirect('/app')
  }

  const events = await getCalendarEvents()

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Calendário da Igreja</h1>
        <p className="text-slate-500 mt-1">Gerencie as datas importantes e eventos anuais.</p>
      </header>

      <CalendarClient initialEvents={events} />
    </div>
  )
}
