'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ReportStatus } from '@prisma/client'
import { getUser } from '@/lib/auth'

export async function getMonthlyHubData(cellId: string, month: number, year: number) {
  try {
    const cell = await prisma.cell.findUnique({
      where: { id: cellId },
      select: { dia_reuniao: true }
    })

    if (!cell || !cell.dia_reuniao) return { error: 'Célula sem dia de reunião definido.' }

    // Parse weekday
    const weekDays: Record<string, number> = {
      'Domingo': 0, 'Segunda-feira': 1, 'Terça-feira': 2, 'Quarta-feira': 3,
      'Quinta-feira': 4, 'Sexta-feira': 5, 'Sábado': 6
    }
    const targetDay = weekDays[cell.dia_reuniao]
    if (targetDay === undefined) return { error: 'Dia de reunião inválido.' }

    // Generate dates
    const dates: Date[] = []
    const date = new Date(year, month - 1, 1)
    while (date.getMonth() === month - 1) {
      if (date.getDay() === targetDay) {
        dates.push(new Date(date))
      }
      date.setDate(date.getDate() + 1)
    }

    // Fetch reports
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    
    const reports = await prisma.meetingReport.findMany({
      where: {
        cellId,
        date: { gte: startDate, lte: endDate }
      }
    })

    // Map slots
    const weeks = dates.map((d, index) => {
      // Find report for this day (ignoring time)
      const report = reports.find(r => 
        r.date.getDate() === d.getDate() && 
        r.date.getMonth() === d.getMonth() &&
        r.date.getFullYear() === d.getFullYear()
      )

      let status = 'PENDENTE' // Gray
      if (report) {
        if (report.status === 'NAO_HOUVE') status = 'NAO_HOUVE' // Yellow
        else status = 'PREENCHIDO' // Green
        // Refine:
        if (report.status === 'RASCUNHO') status = 'RASCUNHO'
        if (report.status === 'ENVIADO_LIDER' || report.status === 'APROVADO') status = 'CONCLUIDO'
      }

      return {
        weekIndex: index + 1,
        date: d.toISOString(),
        formattedDate: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        status,
        reportId: report?.id
      }
    })

    // Calculate Progress
    const totalWeeks = weeks.length
    const filledWeeks = weeks.filter(w => w.status !== 'PENDENTE' && w.status !== 'RASCUNHO').length
    const progressPercentage = totalWeeks > 0 ? Math.round((filledWeeks / totalWeeks) * 100) : 0

    // Fetch Monthly Closure Status
    let closure = null
    try {
      // Safety check to avoid runtime crash if model is not yet available in client
      if ((prisma as any).monthlyClosure) {
        closure = await prisma.monthlyClosure.findUnique({
          where: {
            cellId_month_year: {
              cellId,
              month,
              year
            }
          },
          include: {
            lider: { select: { nome: true } },
            supervisor: { select: { nome: true } },
            coord: { select: { nome: true } }
          }
        })
      }
    } catch (e) {
      console.warn("Failed to fetch monthly closure, defaulting to ABERTO:", e)
    }

    // Default to 'ABERTO' if no record found (user requirement)
    const safeClosure = closure || { status: 'ABERTO' }

    return { 
      weeks,
      stats: {
        totalWeeks,
        filledWeeks,
        progressPercentage
      },
      closure: safeClosure
    }
  } catch (error) {
    console.error('Erro ao buscar hub mensal:', error)
    return { error: 'Erro ao carregar hub: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function getMeetingData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        celulaLiderada: {
          include: {
            membros: true,
            supervisor: true
          }
        },
        celula: {
          include: {
            membros: true,
            lider: true,
            supervisor: true
          }
        }
      }
    })

    if (!user) return { error: 'Usuário não encontrado' }

    // Determinar qual célula usar (Líder vê sua célula liderada, ou sua célula de membro se não for líder)
    const cell = user.celulaLiderada || user.celula

    if (!cell) return { error: 'Você não está vinculado a nenhuma célula.' }

    // Separar Adultos de Crianças (Baseado na categoria)
    const members = cell.membros

    const adults = members.filter(m => m.categoria !== 'CRIANCA').map(m => ({
      id: m.id,
      nome: m.nome,
      role: m.role,
      foto_url: m.foto_url
    }))

    const kids = members.filter(m => m.categoria === 'CRIANCA').map(m => ({
      id: m.id,
      nome: m.nome,
      foto_url: m.foto_url
    }))

    return { 
      cell: {
        id: cell.id,
        nome: cell.nome,
        dia_reuniao: cell.dia_reuniao,
        leaderId: cell.liderId,
        leader2Id: cell.lider2Id,
        secretaryId: cell.secretarioId
      },
      adults,
      kids
    }
  } catch (error) {
    console.error('Erro ao buscar dados da reunião:', error)
    return { error: 'Erro ao carregar dados.' }
  }
}

type AttendeeInput = {
  userId: string
  status: string // 'P', 'F', 'FJ'
  absenceReason?: string
  offerValue: number
  titheValue: number
  missionsValue: number
  otherValue: number
}

interface KidInput {
    userId: string
    church: boolean
    cell: boolean
    homeWorship: boolean
    devotional: boolean
    challenge: boolean
    offerValue?: number
    titheValue?: number
    missionsValue?: number
    otherValue?: number
}

type VisitorInput = {
  name: string
  phone: string
  type: string
}

export async function submitMeetingReport(data: {
  cellId: string
  date: Date
  startTime: string
  endTime: string
  studyTheme: string
  visitors: VisitorInput[]
  offerValue: number // Total Cache
  missionsValue: number // Total Cache
  attendance: AttendeeInput[]
  kidsPillars: KidInput[]
  status: 'RASCUNHO' | 'ENVIADO_LIDER' | 'NAO_HOUVE'
  cancelReason?: string
  // New Roster Fields
  hostId?: string
  directionId?: string
  worshipId?: string
  evangelismId?: string
}) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    // Security Check: Only Leader/Secretary can edit
    const cell = await prisma.cell.findUnique({
      where: { id: data.cellId },
      select: { liderId: true, lider2Id: true, secretarioId: true }
    })

    if (!cell) return { error: 'Célula não encontrada.' }

    const isAuthorized = 
      user.id === cell.liderId || 
      user.id === cell.lider2Id || 
      user.id === cell.secretarioId

    if (!isAuthorized) {
      return { error: 'Permissão negada: Apenas a liderança da célula pode editar este relatório.' }
    }

    // 1. Check for existing report on same day (UPDATE IF EXISTS logic needed for Edit Mode?)
    // Currently we only check if exists to block. For Edit Mode we need to UPDATE.
    // Let's modify this to UPSERT logic or separate Update function.
    // For now, let's keep it simple: If ID is not provided, we try to create. 
    // BUT wait, submitMeetingReport is currently used for CREATION.
    // I should probably make it an UPSERT based on Date + CellId.
    
    const startOfDay = new Date(data.date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(data.date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingReport = await prisma.meetingReport.findFirst({
      where: {
        cellId: data.cellId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    if (existingReport) {
        // UPDATE MODE
        await prisma.$transaction(async (tx) => {
            // Delete old details
            await tx.meetingAttendance.deleteMany({ where: { reportId: existingReport.id } })
            await tx.meetingKidsPillars.deleteMany({ where: { reportId: existingReport.id } })
            await tx.meetingVisitor.deleteMany({ where: { reportId: existingReport.id } })
            
            // Update Report Header
            await tx.meetingReport.update({
                where: { id: existingReport.id },
                data: {
                    startTime: data.startTime,
                    endTime: data.endTime,
                    studyTheme: data.studyTheme,
                    status: data.status as ReportStatus,
                    offerValue: data.offerValue,
                    missionsValue: data.missionsValue,
                    cancelReason: data.cancelReason,
                    visitorsCount: data.visitors.length,
                    presentMembers: data.attendance.filter(a => a.status === 'P').length,
                    // Roster fields
                    hostId: data.hostId || null,
                    directionId: data.directionId || null,
                    worshipId: data.worshipId || null,
                    evangelismId: data.evangelismId || null
                }
            })

            // Skip details if NAO_HOUVE
            if (data.status === 'NAO_HOUVE') return

            // Create new details
            if (data.attendance.length > 0) {
                await tx.meetingAttendance.createMany({
                    data: data.attendance.map(a => ({
                        reportId: existingReport.id,
                        userId: a.userId,
                        status: a.status,
                        absenceReason: a.absenceReason,
                        offerValue: a.offerValue,
                        titheValue: a.titheValue,
                        missionsValue: a.missionsValue,
                        otherValue: a.otherValue
                    }))
                })
            }
            if (data.kidsPillars.length > 0) {
                await tx.meetingKidsPillars.createMany({
                    data: data.kidsPillars.map(k => ({
                        reportId: existingReport.id,
                        userId: k.userId,
                        church: k.church,
                        cell: k.cell,
                        homeWorship: k.homeWorship,
                        devotional: k.devotional,
                        challenge: k.challenge,
                        offerValue: k.offerValue || 0,
                        titheValue: k.titheValue || 0,
                        missionsValue: k.missionsValue || 0,
                        otherValue: k.otherValue || 0
                    }))
                })
            }
            if (data.visitors.length > 0) {
                await tx.meetingVisitor.createMany({
                    data: data.visitors.map(v => ({
                        reportId: existingReport.id,
                        name: v.name,
                        phone: v.phone,
                        type: v.type
                    }))
                })
            }
        })
    } else {
        // CREATE MODE
        await prisma.$transaction(async (tx) => {
            const report = await tx.meetingReport.create({
                data: {
                cellId: data.cellId,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                studyTheme: data.studyTheme,
                status: data.status as ReportStatus,
                offerValue: data.offerValue,
                missionsValue: data.missionsValue,
                cancelReason: data.cancelReason,
                visitorsCount: data.visitors.length,
                presentMembers: data.attendance.filter(a => a.status === 'P').length,
                // Roster fields
                hostId: data.hostId || null,
                directionId: data.directionId || null,
                worshipId: data.worshipId || null,
                evangelismId: data.evangelismId || null
                }
            })

            if (data.status === 'NAO_HOUVE') return

            if (data.attendance.length > 0) {
                await tx.meetingAttendance.createMany({
                data: data.attendance.map(a => ({
                    reportId: report.id,
                    userId: a.userId,
                    status: a.status,
                    absenceReason: a.absenceReason,
                    offerValue: a.offerValue,
                    titheValue: a.titheValue,
                    missionsValue: a.missionsValue,
                    otherValue: a.otherValue
                }))
                })
            }

            if (data.kidsPillars.length > 0) {
                await tx.meetingKidsPillars.createMany({
                    data: data.kidsPillars.map(k => ({
                        reportId: report.id,
                        userId: k.userId,
                        church: k.church,
                        cell: k.cell,
                        homeWorship: k.homeWorship,
                        devotional: k.devotional,
                        challenge: k.challenge,
                        offerValue: k.offerValue || 0,
                        titheValue: k.titheValue || 0,
                        missionsValue: k.missionsValue || 0,
                        otherValue: k.otherValue || 0
                    }))
                })
            }

            if (data.visitors.length > 0) {
                await tx.meetingVisitor.createMany({
                data: data.visitors.map(v => ({
                    reportId: report.id,
                    name: v.name,
                    phone: v.phone,
                    type: v.type
                }))
                })
            }
        })
    }

    revalidatePath('/app/celula/reuniao')
    revalidatePath('/app/lideranca')
    return { success: true }
  } catch (error) {
    console.error('Erro ao salvar relatório:', error)
    return { error: 'Erro ao salvar relatório.' }
  }
}

export async function approveReport(reportId: string) {
  try {
    await prisma.meetingReport.update({
      where: { id: reportId },
      data: { status: 'APROVADO' }
    })
    revalidatePath('/app/lideranca')
    return { success: true }
  } catch (error) {
    console.error('Erro ao aprovar relatório:', error)
    return { error: 'Erro ao aprovar relatório.' }
  }
}

export async function getMonthlyReportData(cellId: string, month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const cell = await prisma.cell.findUnique({
      where: { id: cellId },
      include: {
        membros: {
          orderBy: { nome: 'asc' }
        },
        lider: { select: { nome: true } },
        lider2: { select: { nome: true } },
        supervisor: { select: { nome: true } },
        supervisor2: { select: { nome: true } }
      }
    })

    if (!cell) return { error: 'Célula não encontrada' }

    const reports = await prisma.meetingReport.findMany({
      where: {
        cellId,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
      },
      include: {
        attendance: true,
        kidsPillars: true
      },
      orderBy: { date: 'asc' }
    })

    // Dates for columns
    const dates = reports.map(r => r.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    const reportIds = reports.map(r => r.id)

    // Report Summaries (Header of the dynamic columns)
    const reportSummaries = reports.map(r => {
        // Calculate detailed totals from attendance
        // We sum up from attendance to ensure detailed breakdown if report header is not granular enough
        // Or if report header has total, we trust it for total but for breakdown we might need attendance.
        // Actually, report header has offerValue and missionsValue.
        // But we want "Tithe", "Offer", "Missions", "Other".
        
        let titheSum = 0
        let offerSum = 0
        let missionsSum = 0
        let otherSum = 0

        r.attendance.forEach(a => {
            titheSum += Number(a.titheValue) || 0
            offerSum += Number(a.offerValue) || 0
            missionsSum += Number(a.missionsValue) || 0
            otherSum += Number(a.otherValue) || 0
        })

        r.kidsPillars.forEach(k => {
            titheSum += Number(k.titheValue) || 0
            offerSum += Number(k.offerValue) || 0
            missionsSum += Number(k.missionsValue) || 0
            otherSum += Number(k.otherValue) || 0
        })

        // NOTE: The report header (r.offerValue) might be the official cache count which could differ from sum of members if there was loose cash.
        // Usually, for reports, we want the official cache count.
        // If the system enforces match, good. If not, we should probably display the sum of members or the report header?
        // Let's use the sum of members for "detailed" breakdown.
        // BUT if report.offerValue is > 0 and members sum is 0 (maybe anonymous offers?), we should consider that.
        // For now, sticking to Member Sums as the request asks for "Dizimos", "Ofertas" rows which implies breakdown.
        
        const totalGeneral = titheSum + offerSum + missionsSum + otherSum
        const presentCount = r.attendance.filter(a => a.status === 'P').length

        return {
            date: r.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            theme: r.studyTheme || '',
            present: presentCount,
            visitors: r.visitorsCount || 0,
            financials: {
                tithe: titheSum,
                offer: offerSum,
                missions: missionsSum,
                other: otherSum,
                total: totalGeneral
            }
        }
    })

    // Build Matrix
    const adults = cell.membros.filter(m => m.categoria !== 'CRIANCA').map(member => {
      const attendanceMap: Record<string, string> = {}
      const financialMap: Record<string, number> = {} // Changed to number for simpler sum

      let totalPresence = 0
      let totalFinancial = 0

      reports.forEach((report, index) => {
        const record = report.attendance.find(a => a.userId === member.id)
        const dateKey = dates[index]
        
        attendanceMap[dateKey] = record ? record.status : '-'
        
        if (record && record.status === 'P') {
            totalPresence++
        }

        if (record) {
           const val = (Number(record.offerValue) || 0) + 
                       (Number(record.titheValue) || 0) + 
                       (Number(record.missionsValue) || 0) + 
                       (Number(record.otherValue) || 0)
           
           if (val > 0) {
             financialMap[dateKey] = val
             totalFinancial += val
           }
        }
      })
      
      return {
        id: member.id,
        name: member.nome,
        attendance: attendanceMap,
        financials: financialMap,
        stats: {
            present: totalPresence,
            financial: totalFinancial
        }
      }
    })

    const kids = cell.membros.filter(m => m.categoria === 'CRIANCA').map(member => {
        const pillarsMap: Record<string, any> = {}
  
        reports.forEach((report, index) => {
          const record = report.kidsPillars.find(k => k.userId === member.id)
          const dateKey = dates[index]
          
          if (record) {
             pillarsMap[dateKey] = {
               church: record.church,
               cell: record.cell,
               homeWorship: record.homeWorship,
               devotional: record.devotional,
               challenge: record.challenge
             }
          }
        })
        
        return {
          id: member.id,
          name: member.nome,
          pillars: pillarsMap
        }
      })

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    // Fetch Closure Data for Signatures
    const closure = await prisma.monthlyClosure.findUnique({
      where: {
        cellId_month_year: {
          cellId,
          month,
          year
        }
      },
      include: {
        lider: { select: { nome: true } },
        supervisor: { select: { nome: true } },
        coord: { select: { nome: true } }
      }
    })

    return { 
        cellName: cell.nome,
        leadership: {
            leader: cell.lider?.nome || '',
            leader2: cell.lider2?.nome || '',
            supervisor: cell.supervisor?.nome || '',
            supervisor2: cell.supervisor2?.nome || ''
        },
        time: cell.horario || '',
        month: months[month - 1],
        year: year,
        dates, 
        reportSummaries,
        reportIds,
        adults,
        kids,
        closure
    }

  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error)
    return { error: 'Erro ao gerar relatório.' }
  }
}

export async function getReportByDate(cellId: string, dateStr: string) {
    try {
      const date = new Date(dateStr)
      // Ajuste para evitar problemas de timezone na busca
      // Buscamos o dia inteiro no banco (00:00 - 23:59 UTC do dia informado)
      // Porém, como salvamos com 12:00, qualquer range que cubra o dia deve funcionar
      
      // Assumindo que dateStr vem YYYY-MM-DD
      const [y, m, d] = dateStr.split('-').map(Number)
      const startOfDay = new Date(y, m - 1, d, 0, 0, 0)
      const endOfDay = new Date(y, m - 1, d, 23, 59, 59)
  
      const report = await prisma.meetingReport.findFirst({
        where: {
          cellId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          attendance: true,
          kidsPillars: true,
          visitors: true
        }
      })
  
      return { report }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
      return { error: 'Erro ao buscar relatório.' }
    }
  }