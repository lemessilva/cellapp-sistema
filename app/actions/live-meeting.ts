'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendNotification } from "./notifications"
import { startOfWeek, endOfWeek, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function getWeeklyScheduledMeetings(cellId: string, currentReportId: string) {
    try {
        const today = new Date()
        const start = startOfWeek(today, { locale: ptBR }) // Sunday
        const end = endOfWeek(today, { locale: ptBR })     // Saturday

        const meetings = await prisma.meetingReport.findMany({
            where: {
                cellId,
                status: 'RASCUNHO',
                date: {
                    gte: start,
                    lte: end
                },
                id: {
                    not: currentReportId // Exclude current live one if it's somehow draft (though live is EM_ANDAMENTO)
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        return meetings.map(m => ({
            id: m.id,
            date: m.date,
            formattedDate: format(m.date, "EEEE, dd/MM", { locale: ptBR }),
            studyTheme: m.studyTheme
        }))
    } catch (error) {
        console.error('Error fetching scheduled meetings:', error)
        return []
    }
}

export async function startLiveMeeting(cellId: string, date: string) {
  try {
    const meetingDate = new Date(date)
    let reportId = ''
    let startedAt = new Date()
    let isNewStart = false
    
    // Check if report exists
    const existing = await prisma.meetingReport.findFirst({
      where: {
        cellId,
        date: meetingDate
      }
    })

    if (existing) {
      if (existing.status === 'EM_ANDAMENTO') {
        return { success: true, reportId: existing.id, startedAt: existing.startedAt || new Date() }
      }
      
      // Update to in progress
      const updated = await prisma.meetingReport.update({
        where: { id: existing.id },
        data: {
          status: 'EM_ANDAMENTO',
          startedAt: existing.startedAt || new Date()
        }
      })
      reportId = updated.id
      startedAt = updated.startedAt || new Date()
      isNewStart = true
    } else {
      // Create new
      const created = await prisma.meetingReport.create({
        data: {
          cellId,
          date: meetingDate,
          status: 'EM_ANDAMENTO',
          startedAt: new Date()
        }
      })
      reportId = created.id
      startedAt = created.startedAt || new Date()
      isNewStart = true
    }

    if (isNewStart) {
        // Notify members
        const members = await prisma.user.findMany({
            where: { celulaId: cellId, ativo: true },
            select: { id: true }
        })

        // Fire and forget notifications to avoid delay
        Promise.all(members.map(member => 
            sendNotification({
                userId: member.id,
                title: 'Célula Iniciada! 🚀',
                message: 'A célula começou! O modo ao vivo foi ativado.',
                type: 'INFO',
                link: '/app/celula'
            })
        )).catch(err => console.error('Failed to send start notifications', err))
    }
    
    return { success: true, reportId, startedAt }
  } catch (error) {
    console.error('Error starting live meeting:', error)
    return { error: 'Falha ao iniciar célula' }
  }
}

export async function getLiveMeetingData(cellId: string) {
  try {
    const report = await prisma.meetingReport.findFirst({
      where: {
        cellId,
        status: 'EM_ANDAMENTO'
      },
      include: {
        attendance: true,
        kidsPillars: true
      }
    })

    if (!report) return { active: false }

    const members = await prisma.user.findMany({
      where: {
        celulaId: cellId,
        ativo: true
      },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        foto_url: true,
        role: true,
        categoria: true
      }
    })

    return { 
      active: true, 
      report, 
      members 
    }
  } catch (error) {
    console.error('Error fetching live meeting data:', error)
    return { error: 'Erro ao carregar dados da célula ao vivo' }
  }
}

export async function checkLiveStatus(cellId: string) {
  try {
    const count = await prisma.meetingReport.count({
      where: {
        cellId,
        status: 'EM_ANDAMENTO'
      }
    })
    return { active: count > 0 }
  } catch (error) {
    return { active: false }
  }
}

export async function finishLiveMeeting(
  reportId: string, 
  attendanceData: Record<string, any>, 
  financials: { offer: number; missions: number },
  targetReportId?: string
) {
  try {
    // Fetch report to get cellId
    const report = await prisma.meetingReport.findUnique({
      where: { id: reportId },
      select: { cellId: true, startedAt: true }
    })

    if (!report) return { error: 'Relatório não encontrado' }

    // If target provided, use that ID, otherwise use current
    const finalReportId = targetReportId || reportId

    // Fetch all active members to determine category (Adult vs Kid)
    const members = await prisma.user.findMany({
      where: {
        celulaId: report.cellId,
        ativo: true
      },
      select: {
        id: true,
        categoria: true
      }
    })

    const memberMap = new Map(members.map(m => [m.id, m.categoria]))

    await prisma.$transaction(async (tx) => {
      let totalOffer = 0
      let totalMissions = 0
      let presentCount = 0

      // Process Attendance
      for (const [userId, data] of Object.entries(attendanceData)) {
        const category = memberMap.get(userId) || 'ADULTO'
        const status = data.status || 'P'
        const isPresent = status === 'P'
        
        // Accumulate totals for header
        if (isPresent) {
            if (category === 'ADULTO') presentCount++ 
            
            totalOffer += Number(data.offerValue || 0)
            totalMissions += Number(data.missionsValue || 0)
        }

        if (category === 'CRIANCA') {
            // Save to MeetingKidPillar
            await tx.meetingKidsPillars.upsert({
                where: {
                    reportId_userId: {
                        reportId: finalReportId,
                        userId: userId
                    }
                },
                create: {
                    reportId: finalReportId,
                    userId,
                    cell: isPresent, 
                    church: data.church || false,
                    homeWorship: data.homeWorship || false,
                    devotional: data.devotional || false,
                    challenge: data.challenge || false,
                    offerValue: Number(data.offerValue || 0),
                    titheValue: Number(data.titheValue || 0),
                    missionsValue: Number(data.missionsValue || 0),
                    otherValue: Number(data.otherValue || 0)
                },
                update: {
                    cell: isPresent,
                    church: data.church || false,
                    homeWorship: data.homeWorship || false,
                    devotional: data.devotional || false,
                    challenge: data.challenge || false,
                    offerValue: Number(data.offerValue || 0),
                    titheValue: Number(data.titheValue || 0),
                    missionsValue: Number(data.missionsValue || 0),
                    otherValue: Number(data.otherValue || 0)
                }
            })
        } else {
            // Save to MeetingAttendance (Adults)
            await tx.meetingAttendance.upsert({
                where: {
                    reportId_userId: {
                        reportId: finalReportId,
                        userId
                    }
                },
                create: {
                    reportId: finalReportId,
                    userId,
                    status,
                    offerValue: Number(data.offerValue || 0),
                    titheValue: Number(data.titheValue || 0),
                    missionsValue: Number(data.missionsValue || 0),
                    otherValue: Number(data.otherValue || 0)
                },
                update: {
                    status,
                    offerValue: Number(data.offerValue || 0),
                    titheValue: Number(data.titheValue || 0),
                    missionsValue: Number(data.missionsValue || 0),
                    otherValue: Number(data.otherValue || 0)
                }
            })
        }
      }

      // 2. Update Final Report
      await tx.meetingReport.update({
        where: { id: finalReportId },
        data: {
          status: 'RASCUNHO', // Back to draft for leader
          startedAt: report.startedAt || new Date(), // Keep original start time if moving
          endedAt: new Date(),
          offerValue: totalOffer,
          missionsValue: totalMissions,
          presentMembers: presentCount
        }
      })

      // 3. Delete temporary report if target was used
      if (targetReportId && targetReportId !== reportId) {
          await tx.meetingReport.delete({
              where: { id: reportId }
          })
      }
    })

    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error finishing live meeting:', error)
    return { error: 'Erro ao finalizar célula' }
  }
}
