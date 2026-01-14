'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getRoster(cellId: string, month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const rosters = await prisma.meetingRoster.findMany({
      where: {
        cellId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        directionMember: { select: { nome: true } },
        worshipMember: { select: { nome: true } },
        evangelismMember: { select: { nome: true } },
        hostMember: { select: { nome: true } }
      },
      orderBy: { date: 'asc' }
    })

    return { rosters }
  } catch (error) {
    console.error('Erro ao buscar escala:', error)
    return { error: 'Erro ao carregar escala.' }
  }
}

export async function upsertRoster(data: {
  id?: string
  cellId: string
  date: Date
  directionMemberId?: string
  worshipMemberId?: string
  evangelismMemberId?: string
  hostMemberId?: string
  customAddress?: string
}) {
  try {
    // Check if roster exists for this date/cell
    const existing = await prisma.meetingRoster.findUnique({
        where: {
            cellId_date: {
                cellId: data.cellId,
                date: data.date
            }
        }
    })

    if (existing) {
        await prisma.meetingRoster.update({
            where: { id: existing.id },
            data: {
                directionMemberId: data.directionMemberId || null,
                worshipMemberId: data.worshipMemberId || null,
                evangelismMemberId: data.evangelismMemberId || null,
                hostMemberId: data.hostMemberId || null,
                customAddress: data.customAddress || null
            }
        })
    } else {
        await prisma.meetingRoster.create({
            data: {
                cellId: data.cellId,
                date: data.date,
                directionMemberId: data.directionMemberId || null,
                worshipMemberId: data.worshipMemberId || null,
                evangelismMemberId: data.evangelismMemberId || null,
                hostMemberId: data.hostMemberId || null,
                customAddress: data.customAddress || null
            }
        })
    }

    revalidatePath('/app/lideranca')
    return { success: true }
  } catch (error) {
    console.error('Erro ao salvar escala:', error)
    return { error: 'Erro ao salvar escala.' }
  }
}

// Helper to get roster for a specific date (used for Report pre-fill)
export async function getRosterForDate(cellId: string, date: Date) {
    try {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const roster = await prisma.meetingRoster.findFirst({
            where: {
                cellId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        })
        
        return roster
    } catch (error) {
        return null
    }
}
