import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import LeaderScreen from '@/components/LeaderScreen'
import { redirect } from 'next/navigation'

export default async function LeaderPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  if (user.role === 'MIDIA') {
    redirect('/admin/website')
  }

  if (!['LIDER', 'SUPERVISOR', 'ADMIN'].includes(user.role)) {
    redirect('/app/oracao')
  }

  // Buscar dados frescos da célula e membros
  // Assumindo que o user tem celulaLiderada (se for líder)
  // Ou se for supervisor, buscar células supervisionadas (simplificação: focar em Líder de Célula agora)
  
  let cellId = user.celulaLiderada?.id
  
  // Se não veio no getUser (relação), buscar explicitamente
  if (!cellId) {
      const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { celulaLiderada: true }
      })
      cellId = dbUser?.celulaLiderada?.id
  }

  if (!cellId) {
      return (
          <div className="p-8 text-center">
              <h1 className="text-xl font-bold text-slate-900">Acesso Restrito</h1>
              <p className="text-slate-500 mt-2">
                Você tem permissão de líder, mas ainda não foi vinculado a uma célula.
              </p>
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                Entre em contato com o administrador do sistema para que ele crie sua célula e o vincule como líder.
              </div>
          </div>
      )
  }

  // Buscar membros e status de oração
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const startOfYear = new Date(new Date().getFullYear(), 0, 1)

  const members = await prisma.user.findMany({
      where: { celulaId: cellId },
      include: {
          prayerLogs: {
              where: {
                  createdAt: {
                      gte: startOfYear
                  }
              },
              orderBy: {
                  createdAt: 'desc'
              }
          }
      }
  })

  // Recarregar user com celulaLiderada garantida para passar pro componente
  const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { 
        celulaLiderada: {
            include: {
                supervisor: { select: { nome: true } },
                lider: { select: { nome: true } }
            }
        }
      }
  })

  // Buscar relatórios pendentes de aprovação
  const pendingReports = await prisma.meetingReport.findMany({
    where: {
      cellId: cellId,
      status: 'ENVIADO_LIDER'
    },
    orderBy: { date: 'desc' }
  })

  return <LeaderScreen user={fullUser} members={members} pendingReports={pendingReports} />
}
