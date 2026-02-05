'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { startOfMonth, endOfMonth, format, parseISO, startOfDay, endOfDay, getDay, addDays, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// --- Interfaces ---

interface SubmitReportParams {
  cellId: string
  date: Date
  startTime: string
  endTime: string
  studyTheme: string
  visitors: any[]
  offerValue: number
  missionsValue: number
  attendance: any[]
  kidsPillars: any[]
  status: 'RASCUNHO' | 'ENVIADO_LIDER'
  observations?: string
  offerDetails?: string
  // Roster Fields
  hostId?: string
  directionId?: string
  worshipId?: string
  evangelismId?: string
}

// --- Actions ---

export async function submitMeetingReport(data: SubmitReportParams) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Não autorizado' }

    // Check permissions (Lider, Secretary, Admin)
    // For now, assuming middleware or UI handles basic checks, but good to check relation.
    // Simplifying for brevity as per instructions to "fix" not "overengineer security" right now.

    const reportDate = new Date(data.date)
    
    // Bloqueio de Duplicidade
    const start = startOfWeek(reportDate, { locale: ptBR })
    const end = endOfWeek(reportDate, { locale: ptBR })

    // Find existing report to get ID or create new ID
    const existingReport = await prisma.meetingReport.findFirst({
        where: {
            cellId: data.cellId,
            date: {
                gte: startOfDay(reportDate),
                lte: endOfDay(reportDate)
            }
        }
    })

    const duplicate = await prisma.meetingReport.findFirst({
        where: {
            cellId: data.cellId,
            date: { gte: start, lte: end },
            status: { in: ['ENVIADO_LIDER', 'APROVADO', 'NAO_HOUVE', 'DEVOLVIDO'] },
            id: existingReport ? { not: existingReport.id } : undefined
        }
    })

    if (duplicate) {
        return { error: 'Já existe um relatório enviado/finalizado para esta semana.' }
    }

    // Upsert Report
    // We use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
        let reportId = existingReport?.id

        // 1. Upsert Report Header
        const reportData = {
            date: reportDate,
            startTime: data.startTime,
            endTime: data.endTime,
            realStartTime: data.realStartTime,
            realEndTime: data.realEndTime,
            studyTheme: data.studyTheme,
            observations: data.observations,
            offerDetails: data.offerDetails,
            offerValue: data.offerValue,
            missionsValue: data.missionsValue,
            status: data.status,
            hostId: data.hostId || null,
            directionId: data.directionId || null,
            worshipId: data.worshipId || null,
            evangelismId: data.evangelismId || null,
            // Update caches
            presentMembers: data.attendance.filter((a: any) => a.status === 'P').length,
            visitorsCount: data.visitors.length
        }

        if (existingReport) {
            await tx.meetingReport.update({
                where: { id: existingReport.id },
                data: reportData
            })
        } else {
            const newReport = await tx.meetingReport.create({
                data: {
                    ...reportData,
                    cellId: data.cellId
                }
            })
            reportId = newReport.id
        }

        if (!reportId) throw new Error("Failed to get report ID")

        // 2. Handle Attendance (Adults)
        // Upsert each attendance record
        for (const att of data.attendance) {
            // Regra de Integridade: Se não for 'P' (Presente), zera valores monetários
            const isPresent = att.status === 'P'
            const sanitizedOffer = isPresent ? att.offerValue : 0
            const sanitizedTithe = isPresent ? att.titheValue : 0
            const sanitizedMissions = isPresent ? att.missionsValue : 0
            const sanitizedOther = isPresent ? att.otherValue : 0

            await tx.meetingAttendance.upsert({
                where: {
                    reportId_userId: {
                        reportId: reportId,
                        userId: att.userId
                    }
                },
                update: {
                    status: att.status,
                    absenceReason: att.absenceReason,
                    offerValue: sanitizedOffer,
                    titheValue: sanitizedTithe,
                    missionsValue: sanitizedMissions,
                    otherValue: sanitizedOther
                },
                create: {
                    reportId: reportId,
                    userId: att.userId,
                    status: att.status,
                    absenceReason: att.absenceReason,
                    offerValue: sanitizedOffer,
                    titheValue: sanitizedTithe,
                    missionsValue: sanitizedMissions,
                    otherValue: sanitizedOther
                }
            })
        }

        // 3. Handle Kids
        for (const kid of data.kidsPillars) {
            await tx.meetingKidsPillars.upsert({
                where: {
                    reportId_userId: {
                        reportId: reportId,
                        userId: kid.userId
                    }
                },
                update: {
                    church: kid.church,
                    cell: kid.cell,
                    homeWorship: kid.homeWorship,
                    devotional: kid.devotional,
                    challenge: kid.challenge,
                    offerValue: kid.offerValue,
                    titheValue: kid.titheValue,
                    missionsValue: kid.missionsValue,
                    otherValue: kid.otherValue
                },
                create: {
                    reportId: reportId,
                    userId: kid.userId,
                    church: kid.church,
                    cell: kid.cell,
                    homeWorship: kid.homeWorship,
                    devotional: kid.devotional,
                    challenge: kid.challenge,
                    offerValue: kid.offerValue,
                    titheValue: kid.titheValue,
                    missionsValue: kid.missionsValue,
                    otherValue: kid.otherValue
                }
            })
        }

        // 4. Handle Visitors
        // First delete existing visitors for this report to handle removals/updates easily
        await tx.meetingVisitor.deleteMany({
            where: { reportId: reportId }
        })

        if (data.visitors.length > 0) {
            await tx.meetingVisitor.createMany({
                data: data.visitors.map(v => ({
                    reportId: reportId!,
                    name: v.name,
                    phone: v.phone,
                    type: v.type
                }))
            })
        }

        return reportId
    })

    revalidatePath(`/app/celula/reuniao`)
    revalidatePath(`/app/lideranca`)
    return { success: true, reportId: result }

  } catch (error) {
    console.error('Error submitting report:', error)
    return { error: 'Erro ao salvar relatório.' }
  }
}

export async function getMeetingReport(cellId: string, dateStr: string) {
    // Alias for getReportByDate if needed, or similar logic
    return getReportByDate(cellId, dateStr)
}

export async function getMonthlyHubData(cellId: string, month: number, year: number) {
    try {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        // 1. Fetch Cell to get Meeting Day
        const cell = await prisma.cell.findUnique({
            where: { id: cellId },
            select: { diaSemana: true, dia_reuniao: true }
        })

        // Determine meeting day index (0-6)
        let meetingDayIndex = 3 // Default to Wednesday if not found
        
        const weekDayMap: Record<string, number> = {
            'DOMINGO': 0,
            'SEGUNDA': 1, 'SEGUNDA-FEIRA': 1,
            'TERCA': 2, 'TERÇA': 2, 'TERÇA-FEIRA': 2, 'TERCA-FEIRA': 2,
            'QUARTA': 3, 'QUARTA-FEIRA': 3,
            'QUINTA': 4, 'QUINTA-FEIRA': 4,
            'SEXTA': 5, 'SEXTA-FEIRA': 5,
            'SABADO': 6, 'SÁBADO': 6
        }

        if (cell?.diaSemana) {
            const day = weekDayMap[cell.diaSemana.toUpperCase()]
            if (day !== undefined) meetingDayIndex = day
        } else if (cell?.dia_reuniao) {
             const day = weekDayMap[cell.dia_reuniao.toUpperCase()]
             if (day !== undefined) meetingDayIndex = day
        }

        // 2. Generate all meeting dates for the month
        const meetingDates: Date[] = []
        let currentDate = startDate
        
        // Find first occurrence
        while (getDay(currentDate) !== meetingDayIndex) {
            currentDate = addDays(currentDate, 1)
        }

        // Collect all occurrences in the month
        while (isSameMonth(currentDate, startDate)) {
            meetingDates.push(new Date(currentDate))
            currentDate = addDays(currentDate, 7)
        }

        // 3. Find existing reports for this month
        const reports = await prisma.meetingReport.findMany({
            where: {
                cellId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        })

        // 4. Merge generated dates with existing reports
        const weeks = meetingDates.map((date, index) => {
            // Check if there is a report for this date (ignoring time)
            const report = reports.find(r => 
                r.date.getDate() === date.getDate() && 
                r.date.getMonth() === date.getMonth()
            )

            const formattedDate = format(date, "dd 'de' MMMM", { locale: ptBR })

            if (report) {
                return {
                    id: report.id,
                    weekIndex: index + 1,
                    date: format(report.date, 'dd/MM/yyyy'),
                    formattedDate,
                    status: report.status === 'RASCUNHO' ? 'RASCUNHO' : 'CONCLUIDO',
                    saved: true,
                    theme: report.studyTheme
                }
            } else {
                return {
                    id: `new-${date.getTime()}`, // Temporary ID for frontend key
                    weekIndex: index + 1,
                    date: format(date, 'dd/MM/yyyy'),
                    formattedDate,
                    status: 'PENDENTE',
                    saved: false,
                    theme: ''
                }
            }
        })

        // Find Closure status
        const closure = await prisma.monthlyClosure.findUnique({
            where: {
                cellId_month_year: {
                    cellId,
                    month,
                    year
                }
            }
        })

        // Stats
        const progressPercentage = weeks.length > 0 
            ? Math.round((weeks.filter(w => w.status === 'CONCLUIDO' || w.status === 'RASCUNHO').length / weeks.length) * 100)
            : 0

        return {
            weeks,
            stats: { progressPercentage },
            closure
        }
    } catch (error) {
        console.error('Error fetching hub data:', error)
        return { weeks: [], stats: null, closure: null }
    }
}

export async function getMonthlyReportData(cellId: string, month: number, year: number) {
    try {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        // Fetch Cell Info
        const cell = await prisma.cell.findUnique({
            where: { id: cellId },
            include: {
                lider: { select: { nome: true } },
                lider2: { select: { nome: true } },
                supervisor: { select: { nome: true } },
                supervisor2: { select: { nome: true } },
            }
        })

        // Fetch Reports
        const reports = await prisma.meetingReport.findMany({
            where: {
                cellId,
                date: { gte: startDate, lte: endDate }
            },
            include: {
                attendance: true,
                visitors: true,
                kidsPillars: true,
                corrections: { 
                    orderBy: { createdAt: 'desc' },
                    include: { author: { select: { nome: true } } }
                }
            },
            orderBy: { date: 'asc' }
        })

        // Fetch Members (Adults and Kids)
        const members = await prisma.user.findMany({
            where: {
                celulaId: cellId,
                ativo: true
            },
            orderBy: { nome: 'asc' }
        })

        const adults = members.filter(m => m.categoria === 'ADULTO')
        const kids = members.filter(m => m.categoria === 'CRIANCA')

        // Fetch Closure
        const closure = await prisma.monthlyClosure.findUnique({
            where: {
                cellId_month_year: { cellId, month, year }
            },
            include: {
                lider: { select: { nome: true } },
                supervisor: { select: { nome: true } },
                coord: { select: { nome: true } }
            }
        })

        // --- Build Summaries ---
        const reportSummaries = reports.map(r => {
            const dateStr = format(r.date, 'dd/MM')
            
            // Format Real Times
            const realStart = r.realStartTime ? format(r.realStartTime, 'HH:mm') : null
            const realEnd = r.realEndTime ? format(r.realEndTime, 'HH:mm') : null
            
            // Financials
            const tithe = r.attendance.reduce((acc, a) => acc + a.titheValue, 0) + 
                          r.kidsPillars.reduce((acc, k) => acc + k.titheValue, 0)
            
            const offer = r.offerValue // Use total cached/saved in report
            const missions = r.missionsValue // Use total cached/saved in report
            const other = r.attendance.reduce((acc, a) => acc + a.otherValue, 0) +
                          r.kidsPillars.reduce((acc, k) => acc + k.otherValue, 0)

            return {
                date: dateStr,
                realStart,
                realEnd,
                corrections: r.corrections || [],
                theme: r.studyTheme || '',
                observations: r.observations || '',
                offerDetails: r.offerDetails || '',
                present: r.presentMembers,
                visitors: r.visitorsCount,
                financials: {
                    tithe,
                    offer,
                    missions,
                    other,
                    total: tithe + offer + missions + other
                },
                // Add role data for signature preview
                host: r.hostId ? adults.find(a => a.id === r.hostId)?.nome || '' : '',
                direction: r.directionId ? adults.find(a => a.id === r.directionId)?.nome || '' : '',
                worship: r.worshipId ? adults.find(a => a.id === r.worshipId)?.nome || '' : '',
                evangelism: r.evangelismId ? adults.find(a => a.id === r.evangelismId)?.nome || '' : '',
            }
        })

        // --- Build Members Stats (Pro Rata Logic) ---
        const adultsData = adults.map(a => {
            // Filter reports relevant to this member based on joinedAt
            // A member is eligible if the meeting date >= joinedAt
            // joinedAt is nullable in schema, if null assume always member? Or use createdAt? 
            // Assuming joinedAt is reliable if present. If not present, assume eligible for all (old members).
            
            const memberJoinDate = a.joinedAt ? new Date(a.joinedAt) : new Date(0) // Epoch if no join date
            
            const eligibleReports = reports.filter(r => r.date >= memberJoinDate)
            
            const stats = {
                present: 0,
                absent: 0,
                justified: 0,
                eligible: eligibleReports.length // Total meetings they COULD attend
            }

            const attendanceMap: Record<string, string> = {}

            // Calculate attendance only from eligible reports
            reports.forEach(r => {
                const dateStr = format(r.date, 'dd/MM')
                const att = r.attendance.find(at => at.userId === a.id)
                
                // If report is before join date, mark as N/A
                if (r.date < memberJoinDate) {
                    attendanceMap[dateStr] = 'N/A'
                } else {
                    if (att) {
                        attendanceMap[dateStr] = att.status
                        if (att.status === 'P') stats.present++
                        else if (att.status === 'F') stats.absent++
                        else if (att.status === 'FJ') stats.justified++
                    } else {
                        attendanceMap[dateStr] = 'F' // Absent if eligible but no record
                        stats.absent++
                    }
                }
            })

            return {
                id: a.id,
                name: a.nome,
                attendance: attendanceMap,
                stats
            }
        })

        const kidsData = kids.map(k => {
            // Kids usually don't have joinedAt strict logic yet, but same principle applies if needed.
            // For now simplified.
            const stats = {
                present: 0,
                eligible: reports.length
            }
            
            const pillarsMap: Record<string, any> = {}

            reports.forEach(r => {
                const dateStr = format(r.date, 'dd/MM')
                const att = r.kidsPillars.find(kp => kp.userId === k.id)
                // If kid has any pillar checked, consider present? Or specific logic?
                // Usually check 'cell' or 'church' or just existence of record
                if (att) {
                    pillarsMap[dateStr] = {
                        church: att.church,
                        cell: att.cell,
                        homeWorship: att.homeWorship,
                        devotional: att.devotional,
                        challenge: att.challenge
                    }

                    if (att.cell || att.church || att.homeWorship || att.devotional || att.challenge) {
                        stats.present++
                    }
                } else {
                    pillarsMap[dateStr] = null
                }
            })

            return {
                id: k.id,
                name: k.nome,
                pillars: pillarsMap,
                stats
            }
        })

        const monthStr = format(startDate, 'MMMM', { locale: ptBR })
        const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1)

        return {
            cell,
            cellName: cell?.nome || 'Célula sem nome',
            leadership: {
                leader: cell?.lider?.nome || '',
                leader2: cell?.lider2?.nome || '',
                supervisor: cell?.supervisor?.nome || '',
                supervisor2: cell?.supervisor2?.nome || ''
            },
            month: capitalizedMonth,
            monthStr: capitalizedMonth,
            year,
            reportSummaries,
            adults: adultsData,
            kids: kidsData,
            closure: closure ? {
                dataAssinaturaLider: closure.liderSignedAt,
                lider: closure.lider,
                dataAssinaturaSupervisor: closure.supervisorSignedAt,
                supervisor: closure.supervisor,
                dataAssinaturaCoord: closure.coordSignedAt,
                coord: closure.coord
            } : null
        }

    } catch (error) {
        console.error('Error getting monthly report data:', error)
        return null
    }
}

export async function getMeetingData(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) return { error: 'Usuário não encontrado' }

        // Busca robusta: Lider OU Lider2 OU Membro
        let targetCell = await prisma.cell.findFirst({
            where: {
                OR: [
                    { liderId: userId },
                    { lider2Id: userId },
                    { membros: { some: { id: userId } } }
                ]
            },
            include: {
                membros: {
                    where: { ativo: true },
                    orderBy: { nome: 'asc' }
                }
            }
        })

        // Fallback para ADMIN: Se não tiver célula, pega a primeira disponível
        if (!targetCell && user.role === 'ADMIN') {
            targetCell = await prisma.cell.findFirst({
                orderBy: { nome: 'asc' },
                include: {
                    membros: {
                        where: { ativo: true },
                        orderBy: { nome: 'asc' }
                    }
                }
            })
        }

        if (targetCell) {
            const adults = targetCell.membros.filter(m => m.categoria === 'ADULTO')
            const kids = targetCell.membros.filter(m => m.categoria === 'CRIANCA')
            return { cell: targetCell, adults, kids }
        }

        return { error: 'Nenhuma célula vinculada encontrada.' }
    } catch (error) {
        console.error('Error getting meeting data:', error)
        return { error: 'Erro ao buscar dados da reunião.' }
    }
}

export async function getReportByDate(cellId: string, dateStr: string) {
    try {
        let y, m, d;

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            // YYYY-MM-DD
            [y, m, d] = dateStr.split('-').map(Number)
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            // DD/MM/YYYY
            [d, m, y] = dateStr.split('/').map(Number)
        } else {
             // Invalid date format, return null or error without crashing
             console.warn('Invalid date string provided to getReportByDate:', dateStr)
             return { report: null }
        }

        // Check for valid numbers
        if (isNaN(y) || isNaN(m) || isNaN(d)) {
             return { report: null }
        }

        const start = new Date(y, m - 1, d, 0, 0, 0)
        const end = new Date(y, m - 1, d, 23, 59, 59)
        
        // Double check validity
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { report: null }
        }

        const report = await prisma.meetingReport.findFirst({
            where: {
                cellId,
                date: {
                    gte: start,
                    lte: end
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
        console.error('Error getting report by date:', error)
        return { error: 'Failed to fetch report' }
    }
}

export async function approveReport(reportId: string) {
    // This action is likely deprecated in favor of Monthly Closure,
    // but kept for backward compatibility or individual approvals if needed.
    try {
        await prisma.meetingReport.update({
            where: { id: reportId },
            data: { status: 'APROVADO' } 
        })
        revalidatePath('/app/lideranca')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to approve report' }
    }
}
