'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/app/actions/notifications'

type DecisionInput = {
  name: string
  phone: string
  email?: string | null
  decisionType: string
  prayerRequest?: string | null
}

export async function submitDecision(data: DecisionInput) {
  try {
    const { name, phone, email, decisionType, prayerRequest } = data

    if (!name || !phone || !decisionType) {
      return { error: 'Nome, WhatsApp e Tipo de Decisão são obrigatórios.' }
    }

    const card = await prisma.decisionCard.create({
      data: {
        name,
        phone,
        email: email || null,
        decisionType,
        prayerRequest: prayerRequest || null,
        status: 'PENDING'
      }
    })

    const recipients = await prisma.user.findMany({
      where: {
        ativo: true,
        OR: [
          { role: 'ADMIN' },
          // Não há enum PASTOR no Role; cobrir via string em funcoes
          { funcoes: { contains: 'Pastor', mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    })

    if (recipients.length > 0) {
      const title = '🙌 Nova Vida!'
      const msg = `${name} acabou de tomar uma decisão no culto. Toque para ver!`
      await Promise.all(
        recipients.map(r =>
          sendNotification({
            userId: r.id,
            title,
            message: msg,
            type: 'ALERT',
            link: '/admin/decisoes',
            metaData: { decisionId: card.id }
          })
        )
      )
    }

    revalidatePath('/admin/decisoes')
    return { success: true, id: card.id }
  } catch (error) {
    console.error('Erro ao registrar decisão:', error)
    return { error: 'Falha ao registrar decisão.' }
  }
}
