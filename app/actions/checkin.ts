'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type TicketDetails = {
  id: string
  guestName: string
  eventName: string
  paymentStatus: string // 'PENDING' | 'PAID' | 'PARTIAL'
  amountPending: number
  checkIn: boolean
  checkInDate?: Date
}

export async function getTicketDetails(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: true
      }
    })

    if (!registration) {
      return { error: 'Ingresso não encontrado.' }
    }

    // Calculate pending amount
    const price = Number(registration.event.price)
    const paid = Number(registration.paidAmount)
    const pending = price - paid

    // Determine name (User or Guest)
    const name = registration.user?.nome || registration.guestName || 'Participante Desconhecido'

    const details: TicketDetails = {
      id: registration.id,
      guestName: name,
      eventName: registration.event.title,
      paymentStatus: registration.paymentStatus,
      amountPending: pending > 0 ? pending : 0,
      checkIn: registration.checkIn,
      // If we tracked checkIn date we would add it here, for now just boolean
    }

    return { success: true, data: details }
  } catch (error) {
    console.error('Erro ao buscar ingresso:', error)
    return { error: 'Erro ao processar leitura.' }
  }
}

export async function confirmCheckIn(registrationId: string) {
  try {
    // Verify if already checked in
    const existing = await prisma.registration.findUnique({
      where: { id: registrationId }
    })

    if (!existing) {
      return { error: 'Ingresso não encontrado.' }
    }

    if (existing.checkIn) {
      return { error: 'Participante já fez check-in anteriormente.' }
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkIn: true
      }
    })

    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao confirmar check-in:', error)
    return { error: 'Erro ao registrar entrada.' }
  }
}
