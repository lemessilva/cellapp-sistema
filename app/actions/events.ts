'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

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
        // Traz os inscritos para a tabela de gestão
        registrations: {
          include: { 
            user: true,
            transactions: { orderBy: { date: 'desc' } }
          },
          orderBy: { createdAt: 'desc' } // Changed from date to createdAt as Registration doesn't have date, usually createdAt
        },
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!event) return { error: "Evento não encontrado" }

    return { event }
  } catch (error) {
    console.error("Erro ao buscar detalhes do evento:", error)
    return { error: "Falha ao carregar evento" }
  }
}

import { sendNotification } from './notifications'

export async function registerForEvent(eventId: string, guestData?: { name?: string, phone?: string }) {
  try {
    const user = await getUser()
    
    if (!user && !guestData?.name) return { error: 'Usuário não autenticado e nenhum nome informado.' }

    // Check if already registered (only for logged users)
    if (user) {
      const existing = await prisma.registration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: user.id
          }
        }
      })

      if (existing) {
        return { error: 'Você já está inscrito neste evento.' }
      }
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!event) return { error: 'Evento não encontrado.' }

    if (event.maxCapacity && event._count.registrations >= event.maxCapacity) {
      return { error: 'Vagas esgotadas.' }
    }

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId: user?.id,
        guestName: guestData?.name,
        status: 'CONFIRMED',
        paymentStatus: Number(event.price) > 0 ? 'PENDING' : 'PAID'
      }
    })

    // 1. Notificação para o Inscrito (se for usuário logado)
    if (user) {
      await sendNotification({
        userId: user.id,
        title: 'Inscrição Confirmada',
        message: `Sua inscrição para ${event.title} foi confirmada!`,
        type: 'SUCCESS',
        link: '/app/eventos'
      })
    }

    // 2. Notificação para os Admins (Alerta de Gestão)
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    })

    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        title: 'Nova Inscrição',
        message: `${user ? user.nome : guestData?.name} acabou de se inscrever no evento ${event.title}.`,
        type: 'INFO',
        link: `/admin/eventos/${event.id}`
      })
    }

    revalidatePath('/app/eventos')
    return { success: true, registrationId: registration.id }
  } catch (error) {
    console.error('Erro ao inscrever no evento:', error)
    return { error: 'Erro ao processar inscrição.' }
  }
}

export async function createEvent(formData: FormData) {
  try {
    const bannerFile = formData.get('bannerFile') as File | null
    let bannerUrl = formData.get('bannerUrl') as string | null

    if (bannerFile && bannerFile.size > 0) {
      const url = await uploadFile(bannerFile, 'uploads')
      if (url) bannerUrl = url
    }

    await prisma.event.create({
      data: {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: new Date(formData.get('date') as string),
        location: formData.get('location') as string,
        price: parseFloat((formData.get('price') as string) || '0'),
        maxCapacity: formData.get('maxCapacity') ? parseInt(formData.get('maxCapacity') as string) : null,
        bannerUrl: bannerUrl
      }
    })

    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return { error: 'Erro ao criar evento.' }
  }
}

export async function addPaymentTransaction(
  registrationId: string,
  amount: number,
  notes?: string
) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true }
    })

    if (!registration) {
      return { error: 'Inscrição não encontrada.' }
    }

    await prisma.paymentTransaction.create({
      data: {
        registrationId,
        amount,
        notes: notes || null,
        date: new Date()
      }
    })

    const transactions = await prisma.paymentTransaction.aggregate({
      where: { registrationId },
      _sum: { amount: true }
    })

    const paidAmount = transactions._sum.amount || 0
    const price = registration.event.price
    const remaining = Math.max(0, Number(price) - Number(paidAmount || 0))

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        paidAmount,
        paymentStatus: remaining <= 0 ? 'PAID' : 'PARTIAL'
      }
    })

    revalidatePath(`/admin/eventos/${registration.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Erro ao registrar transação de pagamento:', error)
    return { error: 'Erro ao registrar pagamento.' }
  }
}

export async function getFutureEvents() {
  const user = await getUser()
  if (!user) return []

  const now = new Date()

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: now
      }
    },
    orderBy: {
      date: 'asc'
    },
    include: {
      registrations: {
        where: {
          userId: user.id
        },
        take: 1
      }
    }
  })

  return events.map(event => ({
    ...event,
    isRegistered: event.registrations.length > 0,
    registration: event.registrations[0] || null
  }))
}

export async function getPublicEventDetails(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: true
    }
  })

  if (!event) return null

  const now = new Date()
  const isOpen = event.date > now

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    bannerUrl: event.bannerUrl,
    isOpen,
    totalRegistrations: event.registrations.length,
    price: event.price
  }
}
