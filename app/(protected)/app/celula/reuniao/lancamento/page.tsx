import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ReportForm } from '@/components/reports/ReportForm'
import { getMeetingData, getReportByDate } from '@/app/actions/meeting'
import { getRosterForDate } from '@/app/actions/roster'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Permitir Líderes, Supervisores, Admins OU Secretário da Célula
  const isSecretary = user.celula?.secretarioId === user.id
  
  if (!['LIDER', 'SUPERVISOR', 'ADMIN'].includes(user.role) && !isSecretary) {
    redirect('/app')
  }

  const data = await getMeetingData(user.id)

  if ('error' in data) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{data.error}</p>
        <a href="/app" className="text-indigo-600 underline mt-4 block">Voltar</a>
      </div>
    )
  }

  // Permissão de EDIÇÃO DO RELATÓRIO (Apenas Líder e Secretário)
  const isAuthorized = 
    user.id === data.cell.leaderId || 
    user.id === data.cell.leader2Id || 
    user.id === data.cell.secretaryId

  const resolvedSearchParams = await searchParams
  // Get date from query params
  const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : undefined
  
  // Format date for the form (YYYY-MM-DD) if it comes in ISO format from the hub
  let initialDate = dateParam
  if (initialDate && initialDate.includes('T')) {
      initialDate = initialDate.split('T')[0]
  }

  // Try to fetch existing report
  let initialReport = undefined
  let rosterData = undefined
  
  if (initialDate) {
    const reportData = await getReportByDate(data.cell.id, initialDate)
    if ('report' in reportData && reportData.report) {
      initialReport = reportData.report
    } else {
        // Only fetch roster if report doesn't exist (for pre-fill)
        // Or fetch anyway? Pre-fill only happens if report is new.
        // We pass it to the form, the form logic decides.
        const dateObj = new Date(initialDate)
        // dateObj is UTC 00:00. getRosterForDate handles full day range.
        // Note: new Date("2024-01-01") is UTC.
        // If local timezone is GMT-3, this is previous day 21:00.
        // Wait, standard ISO string YYYY-MM-DD is UTC.
        // We should ensure we pass a Date that falls within the target day in the system timezone or just rely on the string parsing in getRosterForDate if it took string.
        // getRosterForDate takes Date.
        // Let's create a date object that is safely in the middle of the day to avoid boundary issues.
        const [y, m, d] = initialDate.split('-').map(Number)
        const safeDate = new Date(y, m - 1, d, 12, 0, 0)
        
        const roster = await getRosterForDate(data.cell.id, safeDate)
        if (roster) {
            rosterData = roster
        }
    }
  }

  return (
    <ReportForm 
      key={initialDate}
      cellId={data.cell.id} 
      adults={data.adults}
      kids={data.kids}
      initialDate={initialDate}
      initialReport={initialReport}
      rosterData={rosterData}
      readonly={!isAuthorized}
    />
  )
}
