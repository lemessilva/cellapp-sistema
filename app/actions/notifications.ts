'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'REPORT' | 'ROLE' | 'CELL' | 'EVENT' | 'ROSTER' | 'BIRTHDAY'

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
