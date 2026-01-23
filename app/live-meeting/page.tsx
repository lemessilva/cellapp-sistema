import { LiveMeetingInterface } from '@/components/live/LiveMeetingInterface'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getLiveMeetingData } from '@/app/actions/live-meeting'
import { prisma } from '@/lib/prisma'

export default async function LiveMeetingPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  
  // Lógica Robusta de Busca de Célula (Líder, Co-Líder, Membro ou Admin)
  let targetCell = await prisma.cell.findFirst({
    where: {
        OR: [
            { liderId: user.id },
            { lider2Id: user.id },
            { membros: { some: { id: user.id } } }
        ]
    }
  })

  // Fallback para ADMIN: Se não tiver célula vinculada, pega a primeira disponível
  if (!targetCell && user.role === 'ADMIN') {
      targetCell = await prisma.cell.findFirst({
          orderBy: { nome: 'asc' }
      })
  }
  
  if (!targetCell) {
    redirect('/app/celula')
  }

  // Fetch data
  const data = await getLiveMeetingData(targetCell.id)
  
  if ('error' in data || !data.active || !data.report || !data.members) {
    redirect('/app/celula') // No live meeting, go back
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LiveMeetingInterface user={user} data={data} />
    </div>
  )
}
