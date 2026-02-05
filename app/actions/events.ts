'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadFile, uploadToMidiaBucket } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
import { validateCPF } from '@/lib/utils'
import { sendNotification } from './notifications'

// Get ticket details for check-in
export async function getTicketDetails(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            foto_url: true,
            role: true,
            categoria: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true
          }
        }
      }
    })

    if (!registration) {
      return { error: 'Inscrição não encontrada.' }
    }

    return { success: true, registration }
  } catch (error) {
    console.error('Erro ao buscar detalhes do ingresso:', error)
    return { error: 'Erro ao buscar detalhes do ingresso.' }
  }
}

// Confirm check-in
export async function confirmCheckIn(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId }
    })

    if (!registration) {
      return { error: 'Inscrição não encontrada.' }
    }

    if (registration.checkIn) {
      return { error: 'Check-in já realizado anteriormente.' }
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkIn: true,
        checkInAt: new Date()
      }
    })

    revalidatePath('/admin/checkin')
    return { success: true }
  } catch (error) {
    console.error('Erro ao confirmar check-in:', error)
    return { error: 'Erro ao confirmar check-in.' }
  }
}

export async function getAdminEvents() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: {
      _count: {
        select: { registrations: true }
      },
      registrations: {
        select: { paidAmount: true }
      }
    }
  })
  return events
}

export async function getEventDetails(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: { 
            user: true,
            transactions: {
              orderBy: { date: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!event) {
      return { error: 'Evento não encontrado.' }
    }

    return { event }
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return { error: 'Erro ao buscar evento.' }
  }
}

export async function getPublicEventDetails(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })
    return event
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return null
  }
}

export async function registerForEvent(data: {
  eventId: string
  userId?: string
  guestName?: string
  cpf?: string
  answers?: any
}) {
  try {
    const { eventId, userId, guestName, cpf, answers } = data

    // Check event existence and capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!event) {
      return { error: 'Evento não encontrado.' }
    }

    if (!event.isOpen) {
        return { error: 'As inscrições para este evento estão encerradas.' }
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        return { error: 'O prazo de inscrição para este evento já encerrou.' }
    }

    if (event.maxCapacity && event._count.registrations >= event.maxCapacity) {
      return { error: 'Vagas esgotadas.' }
    }

    // CPF Validation
    if (event.requiresCpf) {
      if (!cpf) return { error: 'CPF é obrigatório.' }
      
      if (!validateCPF(cpf)) {
        return { error: 'CPF inválido.' }
      }

      // Check uniqueness
      const existingRegistration = await prisma.registration.findFirst({
        where: {
          eventId,
          cpf: cpf.replace(/\D/g, '')
        }
      })

      if (existingRegistration) {
        return { error: 'Este CPF já está inscrito neste evento.' }
      }
    }

    const cleanCPF = cpf ? cpf.replace(/\D/g, '') : undefined

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId: userId,
        guestName: guestName,
        cpf: cleanCPF,
        answers: answers,
        status: 'CONFIRMED',
        paymentStatus: Number(event.price) > 0 ? 'PENDING' : 'PAID'
      }
    })

    // Notifications
    if (userId) {
      await sendNotification({
        userId: userId,
        title: 'Inscrição Confirmada',
        message: `Sua inscrição para ${event.title} foi confirmada!`,
        type: 'SUCCESS',
        link: '/app/eventos'
      })
    }

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    })

    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        title: 'Nova Inscrição',
        message: `${userId ? 'Usuário' : guestName} se inscreveu no evento ${event.title}.`,
        type: 'INFO',
        link: `/admin/eventos/${event.id}`
      })
    }

    revalidatePath('/app/eventos')
    revalidatePath(`/eventos/${eventId}`)
    
    return { success: true, registrationId: registration.id }
  } catch (error) {
    console.error('Erro ao inscrever no evento:', error)
    return { error: 'Erro ao processar inscrição.' }
  }
}

export async function addPaymentTransaction(
  registrationId: string,
  amount: number,
  notes?: string
) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Permissão negada.' }
    }

    // Buscar inscrição atual
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true }
    })

    if (!registration) {
      return { error: 'Inscrição não encontrada.' }
    }

    const price = Number(registration.event.price)
    const currentPaid = Number(registration.paidAmount)
    const newTotal = currentPaid + amount

    if (newTotal > price) {
      return { error: 'Valor excede o total do evento.' }
    }

    // Registrar transação
    await prisma.paymentTransaction.create({
      data: {
        registrationId,
        amount,
        notes
      }
    })

    // Atualizar inscrição
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        paidAmount: newTotal,
        paymentStatus: newTotal >= price ? 'PAID' : 'PARTIAL'
      }
    })

    revalidatePath(`/admin/eventos/${registration.eventId}`)
    return { success: true, paidAmount: Number(updatedRegistration.paidAmount) }
  } catch (error) {
    console.error('Erro ao adicionar transação:', error)
    return { error: 'Erro ao registrar pagamento.' }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Permissão negada.' }
    }
    
    // Delete notifications related to the event
    await prisma.notification.deleteMany({
      where: {
        metaData: {
          path: ['eventId'],
          equals: eventId
        }
      }
    })
    
    await prisma.event.delete({
      where: { id: eventId }
    })

    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir evento:', error)
    return { error: 'Erro ao excluir evento. Verifique se existem inscrições vinculadas.' }
  }
}

export async function createEvent(formData: FormData) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
        return { error: 'Permissão negada.' }
    }

    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const location = formData.get('location') as string
    const price = Number(formData.get('price'))
    const maxCapacity = formData.get('maxCapacity') ? Number(formData.get('maxCapacity')) : null
    const registrationDeadline = formData.get('registrationDeadline') ? new Date(formData.get('registrationDeadline') as string) : null
    const description = formData.get('description') as string
    const requiresCpf = formData.get('requiresCpf') === 'true'
    const formConfig = formData.get('formConfig') ? JSON.parse(formData.get('formConfig') as string) : undefined

    const bannerFile = formData.get('bannerFile') as File | null
    const coverFile = formData.get('coverFile') as File | null
    let bannerUrl = formData.get('bannerUrl') as string | null
    let coverUrl = null

    if (bannerFile && bannerFile.size > 0) {
      const url = await uploadFile(bannerFile, 'uploads')
      if (url) bannerUrl = url
    }

    if (coverFile && coverFile.size > 0) {
      const url = await uploadToMidiaBucket(coverFile)
      if (url) coverUrl = url
    }

    await prisma.event.create({
        data: {
            title,
            date: new Date(date),
            location,
            price,
            maxCapacity,
            registrationDeadline,
            description,
            bannerUrl,
            coverUrl,
            requiresCpf,
            formConfig,
            isOpen: true
        }
    })

    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return { error: 'Erro ao criar evento.' }
  }
}

export async function toggleEventStatus(eventId: string, isOpen: boolean) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Permissão negada.' }
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { isOpen }
    })

    revalidatePath('/admin/eventos')
    revalidatePath(`/eventos/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Erro ao alterar status do evento:', error)
    return { error: 'Erro ao alterar status do evento.' }
  }
}

export async function getFutureEvents() {
  const user = await getUser()
  
  const events = await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      isOpen: true
    },
    orderBy: { date: 'asc' },
    include: {
      registrations: {
        where: {
          userId: user?.id
        },
        take: 1
      }
    }
  })

  return events.map(event => ({
    ...event,
    price: Number(event.price),
    isRegistered: event.registrations.length > 0,
    registration: event.registrations[0] || null
  }))
}
