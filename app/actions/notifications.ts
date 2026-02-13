'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { sendPushToUser } from '@/lib/push'

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'REPORT' | 'ROLE' | 'CELL' | 'EVENT' | 'ROSTER' | 'BIRTHDAY'

export async function subscribeUser(subscription: any) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Usuário não autenticado' }

    // Verifica se já existe uma subscrição com esse endpoint para o usuário
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    })

    if (existing) {
      if (existing.userId === user.id) {
        return { success: true, message: 'Já inscrito' }
      } else {
        // Se pertencer a outro usuário (raro), atualiza
        await prisma.pushSubscription.update({
          where: { endpoint: subscription.endpoint },
          data: { userId: user.id }
        })
        return { success: true, message: 'Inscrição transferida' }
      }
    }

    const newSub = await prisma.pushSubscription.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: user.id
      }
    })

    return { success: true, subscription: newSub }
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return { error: 'Falha ao salvar inscrição' }
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await prisma.pushSubscription.delete({
      where: { endpoint }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting push subscription:', error)
    return { error: 'Falha ao remover inscrição' }
  }
}

interface SendNotificationParams {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string
  metaData?: any
}

export async function sendNotification({
  userId,
  title,
  message,
  type = 'INFO',
  link,
  metaData
}: SendNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        metaData: metaData ? metaData : undefined
      }
    })
    
    // We might want to revalidate paths, but notifications are usually global.
    // Revalidating the layout might be expensive or unnecessary if we use client-side polling or just refresh on navigation.
    // For now, no specific revalidate needed unless we display them in a static page.

    // Enviar Push Notification (Sem bloquear a resposta principal)
    sendPushToUser(userId, title, message, link || '/app').catch(err => {
      console.error('[PUSH] Erro ao enviar notificação em background:', err);
    });

    return { success: true, notification }
  } catch (error) {
    console.error('Error sending notification:', error)
    return { error: 'Failed to send notification' }
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    return notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { error: 'Failed to mark as read' }
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { read: true }
    })
    return { success: true }
  } catch (error) {
    console.error('Error marking all as read:', error)
    return { error: 'Failed to mark all as read' }
  }
}

export async function getUnreadCount(userId: string) {
    try {
        const count = await prisma.notification.count({
            where: {
                userId,
                read: false
            }
        })
        return count
    } catch (error) {
        return 0
    }
}
