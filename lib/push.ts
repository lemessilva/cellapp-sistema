import webpush from 'web-push'
import { prisma } from './prisma'

// Configuração do VAPID
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:suporte@cellapp.com', // Substitua pelo seu email de suporte
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

/**
 * Envia uma notificação push para todas as inscrições de um usuário
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url: string = '/app'
) {
  try {
    // Buscar todas as inscrições do usuário
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    })

    if (subscriptions.length === 0) return { success: true, sent: 0 }

    const notificationPayload = JSON.stringify({
      title,
      body,
      url
    })

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }

          await webpush.sendNotification(pushSubscription, notificationPayload)
          return sub.id
        } catch (error: any) {
          // Se o erro for 410 (Gone) ou 404 (Not Found), a inscrição não é mais válida
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Deletando inscrição inválida: ${sub.id}`)
            await prisma.pushSubscription.delete({
              where: { id: sub.id }
            })
          }
          throw error
        }
      })
    )

    const sentCount = results.filter((r) => r.status === 'fulfilled').length
    return { success: true, sent: sentCount }
  } catch (error) {
    console.error('Erro ao enviar push:', error)
    return { success: false, error: 'Falha ao enviar notificações' }
  }
}
