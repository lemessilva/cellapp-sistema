'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'

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
