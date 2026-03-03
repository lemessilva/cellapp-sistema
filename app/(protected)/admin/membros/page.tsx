import { prisma } from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MembersManagementTable from '@/components/admin/MembersManagementTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getMembersWithPrayerStats(page: number, take: number) {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const thirtyDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 30
  )

  const where = {
    role: 'MEMBRO' as const,
  }

  const totalCount = await prisma.user.count({ where })
  const pageNumber = Number(page) || 1
  const safeTake = Number(take) || 10
  const skip = Math.max(0, (pageNumber - 1) * safeTake)

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      nome: true,
      foto_url: true,
      dataNascimento: true,
      data_nascimento: true,
      email: true,
      telefone: true,
      whatsapp: true,
      bairro: true,
      ativo: true,
      funcoes: true,
      celula: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: {
      nome: 'asc',
    },
    skip,
    take: safeTake,
  })

  const userIds = users.map((u) => u.id)
  if (userIds.length === 0) {
    const totalPages = Math.max(1, Math.ceil(totalCount / safeTake))
    return { items: [], totalCount, totalPages }
  }

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

  const items = users.map((u) => {
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

  const totalPages = Math.max(1, Math.ceil(totalCount / safeTake))

  return { items, totalCount, totalPages }
}

export default async function MembersAdminPage({ searchParams }: { searchParams?: any }) {
  noStore()
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') redirect('/app')

  let pageParam: string | undefined
  const spAny = searchParams as any
  if (spAny && typeof spAny.then === 'function') {
    const resolved = await spAny
    pageParam = resolved?.page
  } else {
    pageParam = spAny?.page
  }
  const page = Math.max(1, Number(pageParam || '1') || 1)
  const take = 10

  const [{ items, totalCount, totalPages }, cells] = await Promise.all([
    getMembersWithPrayerStats(page, take),
    prisma.cell.findMany({
      select: {
        id: true,
        nome: true,
        lider: {
          select: { nome: true }
        }
      },
      orderBy: { nome: 'asc' }
    })
  ])

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

      <MembersManagementTable 
        members={items} 
        cells={cells} 
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={page}
      />
    </div>
  )
}
