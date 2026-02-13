import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MonthlyReportGenerator } from '@/components/reports/MonthlyReportGenerator'
import { prisma } from '@/lib/prisma'

export default async function MonthlyReportPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Determine cell (leader or member)
  let cellId: string | null = user.celulaLiderada?.[0]?.id || user.celulaLiderada2?.[0]?.id || user.celula?.id || user.celulaId || null
  
  if (!cellId) {
    // Fallback search if not in session includes
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { 
        celulaLiderada: true, 
        celulaLiderada2: true,
        celula: true 
      }
    })
    cellId = dbUser?.celulaLiderada?.[0]?.id || dbUser?.celulaLiderada2?.[0]?.id || dbUser?.celula?.id || dbUser?.celulaId || null
  }

  if (!cellId) {
    return (
      <div className="p-6 text-center text-slate-600">
        Você não está vinculado a nenhuma célula.
      </div>
    )
  }

  const cell = await prisma.cell.findUnique({ where: { id: cellId } })

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <MonthlyReportGenerator cellId={cellId} cellName={cell?.nome || 'Minha Célula'} />
    </div>
  )
}
