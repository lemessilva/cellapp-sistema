'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendNotification } from "./notifications"

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
  financials: { offer: number; missions: number }
) {
  try {
    // Fetch report to get cellId
    const report = await prisma.meetingReport.findUnique({
      where: { id: reportId },
      select: { cellId: true }
    })

    if (!report) return { error: 'Relatório não encontrado' }

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
            if (category === 'ADULTO') presentCount++ // Only adults count for main presence? Or both? Usually both or just adults.
            // Let's count adults for now as per usual metric, or maybe total?
            // MeetingReport.presentMembers usually refers to adults/members.
            // Let's stick to simple count for now.
            
            totalOffer += Number(data.offerValue || 0)
            totalMissions += Number(data.missionsValue || 0)
        }

        if (category === 'CRIANCA') {
            // Save to MeetingKidPillar
            await tx.meetingKidsPillars.upsert({
                where: {
                    reportId_userId: {
                        reportId: reportId,
                        userId: userId
                    }
                },
                create: {
                    reportId: reportId,
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
                        reportId: reportId,
                        userId
                    }
                },
                create: {
                    reportId: reportId,
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

      // 2. Update Report
      await tx.meetingReport.update({
        where: { id: reportId },
        data: {
          status: 'RASCUNHO', // Back to draft for leader
          endedAt: new Date(),
          offerValue: totalOffer,
          missionsValue: totalMissions,
          presentMembers: presentCount
        }
      })
    })

    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error finishing live meeting:', error)
    return { error: 'Erro ao finalizar célula' }
  }
}
