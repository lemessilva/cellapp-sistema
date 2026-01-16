import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MembersManagementTable from '@/components/admin/MembersManagementTable'

async function getMembersWithPrayerStats() {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const thirtyDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 30
  )

  const users = await prisma.user.findMany({
    where: {
      role: 'MEMBRO',
    },
    select: {
      id: true,
      nome: true,
      foto_url: true,
      dataNascimento: true,
      data_nascimento: true,
      telefone: true,
      whatsapp: true,
      bairro: true,
      ativo: true,
      celula: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: {
      nome: 'asc',
    },
  })

  const userIds = users.map((u) => u.id)
  if (userIds.length === 0) return []

  const groupedYear = await prisma.prayerLog.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      date: {
        gte: yearStart,
        lte: now,
      },
    },
    _count: {
      _all: true,
    },
    _max: {
      date: true,
    },
  })

  const grouped30 = await prisma.prayerLog.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      date: {
        gte: thirtyDaysAgo,
        lte: now,
      },
    },
    _count: {
      _all: true,
    },
  })

  const yearMap = new Map(
    groupedYear.map((g) => [g.userId, { total: g._count._all, last: g._max.date }])
  )

  const last30Map = new Map(
    grouped30.map((g) => [g.userId, g._count._all])
  )

  return users.map((u) => {
    const yearStats = yearMap.get(u.id)
    const totalDays = yearStats ? yearStats.total : 0
    const lastPrayerDate = yearStats ? yearStats.last : null
    const last30 = last30Map.get(u.id) ?? 0
    const ratio = 30 > 0 ? last30 / 30 : 0
    const prayerFrequency = ratio >= 0.6 ? 'Alta' : 'Baixa'

    return {
      ...u,
      prayerTotalDays: totalDays,
      lastPrayerDate,
      prayerFrequency,
    }
  })
}

export default async function MembersAdminPage() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') redirect('/app')

  const members = await getMembersWithPrayerStats()

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Membros</h1>
          <p className="text-slate-500 mt-1">
            Visualize informações detalhadas dos membros e seus relatórios de oração.
          </p>
        </div>
        <a href="/admin" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Voltar ao Painel
        </a>
      </header>

      <MembersManagementTable members={members} />
    </div>
  )
}
