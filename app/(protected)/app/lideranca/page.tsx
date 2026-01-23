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

  // Buscar a célula onde o usuário é líder OU membro (Lógica Robusta + Fallback Admin)
  let targetCell = await prisma.cell.findFirst({
    where: {
        OR: [
            { liderId: user.id },
            { lider2Id: user.id },
            { membros: { some: { id: user.id } } }
        ]
    },
    include: {
        lider: { select: { nome: true } },
        supervisor: { select: { nome: true } }
    }
  })

  // Fallback para ADMIN: Se não tiver célula, pega a primeira disponível
  if (!targetCell && user.role === 'ADMIN') {
      targetCell = await prisma.cell.findFirst({
          orderBy: { nome: 'asc' },
          include: {
              lider: { select: { nome: true } },
              supervisor: { select: { nome: true } }
          }
      })
  }

  if (!targetCell) {
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

  const cellId = targetCell.id

  // Buscar membros e status de oração
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const startOfYear = new Date(new Date().getFullYear(), 0, 1)

  const members = await prisma.user.findMany({
      where: { celulaId: cellId, ativo: true },
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
  // NOTA: Injetamos manualmente a 'targetCell' encontrada pela lógica robusta acima
  // para garantir que Admins ou Membros vejam a célula correta, mesmo que não sejam o líder oficial no DB.
  const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
  })

  const fullUser = {
      ...dbUser,
      celulaLiderada: targetCell
  }

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
