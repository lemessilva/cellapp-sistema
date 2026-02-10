'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCalendarEvent(title: string, date: Date) {
  try {
    await prisma.calendarEvent.create({
      data: {
        title,
        date,
      },
    })
    revalidatePath('/admin/calendar')
    revalidatePath('/agenda')
    revalidatePath('/app') // Refresh dashboard widget
    return { success: true }
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return { success: false, error: 'Failed to create event' }
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    await prisma.calendarEvent.delete({
      where: { id },
    })
    revalidatePath('/admin/calendar')
    revalidatePath('/agenda')
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return { success: false, error: 'Failed to delete event' }
  }
}

export async function getCalendarEvents() {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: {
        date: 'asc',
      },
    })
    return events
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

export async function getNextCalendarEvent() {
  try {
    const now = new Date()
    // Reset time to start of day for comparison if needed, but strict comparison is usually fine
    // Let's use gte: now to find upcoming events including today
    const event = await prisma.calendarEvent.findFirst({
      where: {
        date: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
        },
      },
      orderBy: {
        date: 'asc',
      },
    })
    return event
  } catch (error) {
    console.error('Error fetching next calendar event:', error)
    return null
  }
}
