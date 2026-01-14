'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek, subWeeks, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function getDashboardMetrics() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const now = new Date()
  const firstDayCurrentMonth = startOfMonth(now)
  const lastDayCurrentMonth = endOfMonth(now)
  
  const firstDayLastMonth = startOfMonth(subMonths(now, 1))
  const lastDayLastMonth = endOfMonth(subMonths(now, 1))

  // 1. KPI: Total Members (Active)
  // Assuming "Active" means not having a status 'INATIVO' if it existed, but User model doesn't have status.
  // We will assume all users in DB are active unless we add a status field later.
  // Prompt says: "exclua status 'INATIVO'". Since it doesn't exist, we rely on role filter.
  const totalMembers = await prisma.user.count({
    where: {
      role: { notIn: ['ADMIN', 'MIDIA'] }
      // status: { not: 'INATIVO' } // Field doesn't exist yet
    }
  })

  const membersLastMonth = await prisma.user.count({
    where: {
      role: { notIn: ['ADMIN', 'MIDIA'] },
      createdAt: { lt: firstDayCurrentMonth }
    }
  })
  
  const membersGrowth = membersLastMonth > 0 
    ? ((totalMembers - membersLastMonth) / membersLastMonth) * 100 
    : 0

  // 2. KPI: Avg Frequency (Last 4 Weeks)
  const fourWeeksAgo = subWeeks(now, 4)
  const reportsLast4Weeks = await prisma.meetingReport.findMany({
    where: {
      date: { gte: fourWeeksAgo },
      status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
    },
    select: {
      presentMembers: true,
      visitorsCount: true
    }
  })

  const totalAttendance = reportsLast4Weeks.reduce((acc, r) => acc + r.presentMembers + r.visitorsCount, 0)
  const avgAttendance = reportsLast4Weeks.length > 0 ? Math.round(totalAttendance / reportsLast4Weeks.length) : 0

  // Previous period (4-8 weeks ago)
  const eightWeeksAgo = subWeeks(now, 8)
  const reportsPrev4Weeks = await prisma.meetingReport.findMany({
    where: {
      date: { gte: eightWeeksAgo, lt: fourWeeksAgo },
      status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
    },
    select: {
      presentMembers: true,
      visitorsCount: true
    }
  })
  const totalAttendanceLast = reportsPrev4Weeks.reduce((acc, r) => acc + r.presentMembers + r.visitorsCount, 0)
  const avgAttendanceLast = reportsPrev4Weeks.length > 0 ? Math.round(totalAttendanceLast / reportsPrev4Weeks.length) : 0
  const attendanceGrowth = avgAttendanceLast > 0 
    ? ((avgAttendance - avgAttendanceLast) / avgAttendanceLast) * 100 
    : 0

  // 3. KPI: Monthly Offerings (Offers + Tithes + Missions)
  // Prompt: "Ofertas + Dízimos + Missões"
  const financialCurrentMonth = await prisma.meetingAttendance.aggregate({
    where: {
      report: {
        date: { gte: firstDayCurrentMonth, lte: lastDayCurrentMonth },
        status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
      }
    },
    _sum: {
      offerValue: true,
      titheValue: true,
      missionsValue: true
    }
  })
  
  const totalOfferings = (financialCurrentMonth._sum.offerValue || 0) + 
                         (financialCurrentMonth._sum.titheValue || 0) + 
                         (financialCurrentMonth._sum.missionsValue || 0)

  // Last Month Financials
  const financialLastMonth = await prisma.meetingAttendance.aggregate({
    where: {
      report: {
        date: { gte: firstDayLastMonth, lte: lastDayLastMonth },
        status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
      }
    },
    _sum: {
      offerValue: true,
      titheValue: true,
      missionsValue: true
    }
  })
  const totalOfferingsLast = (financialLastMonth._sum.offerValue || 0) + 
                             (financialLastMonth._sum.titheValue || 0) + 
                             (financialLastMonth._sum.missionsValue || 0)
                             
  const financialGrowth = totalOfferingsLast > 0
    ? ((totalOfferings - totalOfferingsLast) / totalOfferingsLast) * 100
    : 0


  // 4. KPI: Visitors (Last 30 days)
  // Prompt: "Quantos novos cadastros marcados como 'VISITANTE' no último mês."
  // Assuming this refers to users with role 'VISITANTE' (doesn't exist in enum) or meeting visitors.
  // The enum Role only has ADMIN, SUPERVISOR, LIDER, MEMBRO, MIDIA.
  // So visitors are likely tracked in MeetingVisitor table or MeetingReport.visitorsCount.
  // Prompt says "novos cadastros marcados como 'VISITANTE'".
  // If we look at schema, MeetingVisitor has `type`. Maybe "Primeira Vez" count?
  // Let's stick to total visitors from reports as a proxy, or check MeetingVisitor table directly.
  const thirtyDaysAgo = subDays(now, 30)
  
  // Option A: Sum visitorsCount from reports (Simple)
  // Option B: Count unique MeetingVisitor entries? No, visitors in reports are anonymous usually or simple lists.
  // Schema: MeetingVisitor { name, phone, type, reportId }
  // Let's count MeetingVisitor records created in the last 30 days.
  const visitorsLast30Days = await prisma.meetingVisitor.count({
    where: {
      report: {
        date: { gte: thirtyDaysAgo },
        status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
      }
    }
  })
  
  const totalVisitors = visitorsLast30Days
  
  // Previous 30 days
  const sixtyDaysAgo = subDays(now, 60)
  const visitorsPrev30Days = await prisma.meetingVisitor.count({
    where: {
      report: {
        date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
      }
    }
  })
  const totalVisitorsLast = visitorsPrev30Days
  const visitorsGrowth = totalVisitorsLast > 0
    ? ((totalVisitors - totalVisitorsLast) / totalVisitorsLast) * 100
    : 0

  return {
    kpis: {
      members: { value: totalMembers, growth: membersGrowth },
      attendance: { value: avgAttendance, growth: attendanceGrowth },
      offerings: { value: totalOfferings, growth: financialGrowth },
      visitors: { value: totalVisitors, growth: visitorsGrowth }
    }
  }
}

export async function getGrowthChartData() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') return []

  // Last 6 months
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    months.push({
      date: d,
      label: format(d, 'MMM/yy', { locale: ptBR }),
      monthStart: startOfMonth(d),
      monthEnd: endOfMonth(d)
    })
  }

  const data = await Promise.all(months.map(async (m) => {
    // Members (Cumulative count at end of month)
    const membersCount = await prisma.user.count({
      where: {
        role: { notIn: ['ADMIN', 'MIDIA'] },
        createdAt: { lte: m.monthEnd }
      }
    })

    // Visitors (Sum in that month)
    // Using MeetingVisitor count
    const visitorsCount = await prisma.meetingVisitor.count({
      where: {
        report: {
          date: { gte: m.monthStart, lte: m.monthEnd },
          status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
        }
      }
    })

    return {
      name: m.label,
      Membros: membersCount,
      Visitantes: visitorsCount
    }
  }))

  return data
}

export async function getFinancialChartData() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') return []

  // Last 4 weeks
  const weeks = []
  for (let i = 3; i >= 0; i--) {
    const d = subWeeks(new Date(), i)
    weeks.push({
      date: d,
      label: `Semana ${format(startOfWeek(d), 'dd/MM')}`,
      start: startOfWeek(d),
      end: endOfWeek(d)
    })
  }

  const data = await Promise.all(weeks.map(async (w) => {
    const financial = await prisma.meetingAttendance.aggregate({
      where: {
        report: {
          date: { gte: w.start, lte: w.end },
          status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
        }
      },
      _sum: {
        offerValue: true,
        titheValue: true,
        missionsValue: true
      }
    })

    return {
      name: w.label,
      Ofertas: (financial._sum.offerValue || 0) + (financial._sum.missionsValue || 0),
      Dizimos: financial._sum.titheValue || 0
    }
  }))

  return data
}

export async function getCellHealthData() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') return []

  const cells = await prisma.cell.findMany({
    include: {
      lider: { select: { nome: true } },
      _count: {
        select: { membros: true }
      }
    }
  })

  const now = new Date()
  const firstDay = subDays(now, 30) // Last 30 days as requested ("Último Mês") or Calendar Month? "Último Mês" usually implies last 30 days or previous calendar month. Let's use last 30 days for rolling window.
  
  const data = await Promise.all(cells.map(async (cell) => {
    // Avg Attendance for this cell
    const reports = await prisma.meetingReport.findMany({
      where: {
        cellId: cell.id,
        date: { gte: firstDay },
        status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
      },
      select: {
        presentMembers: true,
        visitorsCount: true
      }
    })

    const totalAttendance = reports.reduce((acc, r) => acc + r.presentMembers + r.visitorsCount, 0)
    const avgAttendance = reports.length > 0 ? Math.round(totalAttendance / reports.length) : 0
    
    // Ratio (Attendance / Members)
    const membersCount = cell._count.membros || 1 
    const ratio = (avgAttendance / membersCount) * 100

    // Prompt Rules:
    // > 70% -> Healthy
    // 40% - 70% -> Warning
    // < 40% -> Critical
    let status = 'CRITICAL'
    if (ratio > 70) status = 'HEALTHY'
    else if (ratio >= 40) status = 'WARNING'

    return {
      id: cell.id,
      name: cell.nome,
      leader: cell.lider?.nome || 'Sem líder',
      members: cell._count.membros,
      avgAttendance,
      ratio: Math.round(ratio),
      status
    }
  }))

  // Sort by ratio desc (best first)
  return data.sort((a, b) => b.ratio - a.ratio)
}
