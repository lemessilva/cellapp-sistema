'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/app/actions/notifications'

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
        direction: { select: { nome: true } },
        worship: { select: { nome: true } },
        evangelism: { select: { nome: true } },
        host: { select: { nome: true } }
      },
      orderBy: { date: 'asc' }
    })

    // Map Prisma fields (directionId) to Frontend fields (directionMemberId)
    const mappedRosters = rosters.map(r => ({
      ...r,
      directionMemberId: r.directionId,
      worshipMemberId: r.worshipId,
      evangelismMemberId: r.evangelismId,
      hostMemberId: r.hostId,
    }))

    return { rosters: mappedRosters }
  } catch (error) {
    console.error('Erro ao buscar escala:', error)
    return { error: 'Erro ao carregar escala.' }
  }
}

export async function geocodeAddress(address: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'CellApp/1.0',
          'Accept-Language': 'pt-BR'
        }
      }
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
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
  latitude?: number | null
  longitude?: number | null
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

    const rosterData = {
      directionId: data.directionMemberId || null,
      worshipId: data.worshipMemberId || null,
      evangelismId: data.evangelismMemberId || null,
      hostId: data.hostMemberId || null,
      customAddress: data.customAddress || null,
      latitude: data.latitude,
      longitude: data.longitude
    }

    if (existing) {
      await prisma.meetingRoster.update({
        where: { id: existing.id },
        data: rosterData
      })
    } else {
      await prisma.meetingRoster.create({
        data: {
          cellId: data.cellId,
          date: data.date,
          ...rosterData
        }
      })
    }

    // Send notifications to assigned members
    const roles = [
        { id: data.directionMemberId, roleName: 'Direção' },
        { id: data.worshipMemberId, roleName: 'Louvor' },
        { id: data.evangelismMemberId, roleName: 'Palavra/Oferta' },
        { id: data.hostMemberId, roleName: 'Anfitrião' }
    ]

    const formattedDate = new Date(data.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

    for (const role of roles) {
        if (role.id) {
            // Check if this is a new assignment or just an update
            // Ideally we check against 'existing', but simplistic approach is fine: just notify.
            // To avoid spam, maybe we can check if it changed.
            // However, simplicity is key now.
            await sendNotification({
                userId: role.id,
                title: "Você foi Escalado! 🎸",
                message: `Você servirá no dia ${formattedDate} como ${role.roleName}.`,
                type: 'ROSTER',
                link: '/app/lideranca', // Or a specific roster view
                metaData: { date: data.date, role: role.roleName }
            })
        }
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
        
        if (!roster) return null

        // Map for compatibility
        return {
          ...roster,
          directionMemberId: roster.directionId,
          worshipMemberId: roster.worshipId,
          evangelismMemberId: roster.evangelismId,
          hostMemberId: roster.hostId
        }
    } catch (error) {
        return null
    }
}
