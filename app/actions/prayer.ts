'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { sendNotification } from '@/app/actions/notifications'

export async function savePrayer(userId: string) {
  try {
    const user = await getUser()
    if (!user || user.id !== userId) {
      return { error: 'Não autorizado.' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Verificar se já orou hoje
    const existing = await prisma.prayerLog.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existing) {
      return { error: 'Você já registrou sua oração hoje!' }
    }

    await prisma.prayerLog.create({
      data: {
        userId,
        date: today
      }
    })

    revalidatePath('/app/oracao')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao salvar oração.' }
  }
}

export async function submitPrayerRequest(data: { name: string; phone?: string; content: string }) {
  try {
    const { name, phone, content } = data

    if (!name || !content) {
      return { error: 'Nome e pedido de oração são obrigatórios.' }
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        name,
        phone,
        content,
        status: 'PENDING'
      }
    })

    // Notify Admins and Leaders
    const recipients = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'LIDER', 'SUPERVISOR'] },
        ativo: true
      },
      select: { id: true }
    })

    if (recipients.length > 0) {
      await Promise.all(recipients.map(recipient => 
        sendNotification({
          userId: recipient.id,
          title: "Novo Pedido de Oração 🙏",
          message: `${name} pediu oração: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          type: 'ALERT',
          link: '/admin/prayers',
          metaData: { prayerId: prayer.id }
        })
      ))
    }

    revalidatePath('/admin/prayers')
    return { success: true }
  } catch (error) {
    console.error('Error submitting prayer request:', error)
    return { error: 'Erro ao enviar pedido de oração.' }
  }
}

export async function getPrayerRequests() {
  try {
    const user = await getUser()
    if (!user || !['ADMIN', 'LIDER', 'SUPERVISOR'].includes(user.role)) {
       return []
    }

    return await prisma.prayerRequest.findMany({
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  } catch (error) {
    console.error('Error fetching prayer requests:', error)
    return []
  }
}

export async function markPrayerAsPrayed(id: string) {
  try {
    const user = await getUser()
    if (!user || !['ADMIN', 'LIDER', 'SUPERVISOR'].includes(user.role)) {
      return { error: 'Não autorizado.' }
    }

    await prisma.prayerRequest.update({
      where: { id },
      data: { status: 'PRAYED' }
    })

    revalidatePath('/admin/prayers')
    return { success: true }
  } catch (error) {
    console.error('Error updating prayer request:', error)
    return { error: 'Erro ao atualizar status.' }
  }
}
