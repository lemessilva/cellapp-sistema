import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import PrayerScreen from '@/components/PrayerScreen'
import { redirect } from 'next/navigation'

export default async function PrayerPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  
  if (user.role === 'MIDIA') {
    redirect('/admin/website')
  }

  // Buscar dados completos do usuário (Oikos e Célula)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      oikos: true,
      celula: {
        include: {
          membros: {
            where: { ativo: true },
            include: { oikos: true }
          }
        }
      },
      celulaLiderada: {
        include: {
          membros: {
            where: { ativo: true },
            include: { oikos: true }
          }
        }
      }
    }
  })

  if (!dbUser) redirect('/login')

  // Determinar membros da célula (seja como membro ou líder)
  const cell = dbUser.celula || dbUser.celulaLiderada
  const members = cell?.membros || []
  const oikos = dbUser.oikos || []

  // Verificar se orou hoje
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const prayerLog = await prisma.prayerLog.findFirst({
    where: {
      userId: user.id,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  return (
    <PrayerScreen 
      user={dbUser} 
      oikos={oikos} 
      members={members} 
      hasPrayedToday={!!prayerLog} 
    />
  )
}
