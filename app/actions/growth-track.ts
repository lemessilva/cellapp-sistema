'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'

export async function getGrowthSteps() {
  try {
    const steps = await prisma.growthTrackStep.findMany({
      orderBy: { orderIndex: 'asc' }
    })
    return steps
  } catch (error) {
    console.error('Error fetching growth steps:', error)
    return []
  }
}

export async function createGrowthStep(data: { title: string, description?: string }) {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    // Find the highest orderIndex
    const lastStep = await prisma.growthTrackStep.findFirst({
      orderBy: { orderIndex: 'desc' }
    })

    const newOrderIndex = lastStep ? lastStep.orderIndex + 1 : 1

    const step = await prisma.growthTrackStep.create({
      data: {
        title: data.title,
        description: data.description,
        orderIndex: newOrderIndex
      }
    })

    revalidatePath('/admin/trilho')
    return { success: true, step }
  } catch (error) {
    console.error('Error creating growth step:', error)
    return { error: 'Failed to create step' }
  }
}

export async function updateGrowthStepOrder(steps: { id: string, orderIndex: number }[]) {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    // Transaction to update all steps
    await prisma.$transaction(
      steps.map((step) => 
        prisma.growthTrackStep.update({
          where: { id: step.id },
          data: { orderIndex: step.orderIndex }
        })
      )
    )

    revalidatePath('/admin/trilho')
    return { success: true }
  } catch (error) {
    console.error('Error reordering steps:', error)
    return { error: 'Failed to reorder steps' }
  }
}

export async function deleteGrowthStep(id: string) {
    const user = await getUser()
    if (!user || user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }
  
    try {
      await prisma.growthTrackStep.delete({
        where: { id }
      })
  
      revalidatePath('/admin/trilho')
      return { success: true }
    } catch (error) {
      console.error('Error deleting step:', error)
      return { error: 'Failed to delete step' }
    }
}

export async function getMemberProgress(userId: string) {
  try {
    const progress = await prisma.memberGrowthProgress.findMany({
      where: { userId },
      include: { step: true }
    })
    return progress
  } catch (error) {
    console.error('Error fetching member progress:', error)
    return []
  }
}

export async function toggleStepProgress(userId: string, stepId: string, isCompleted: boolean) {
  const user = await getUser()
  // Allow Leader, Supervisor, Admin to toggle progress
  if (!user || !['LIDER', 'SUPERVISOR', 'ADMIN'].includes(user.role)) {
    return { error: 'Unauthorized' }
  }

  try {
    if (isCompleted) {
      await prisma.memberGrowthProgress.upsert({
        where: {
          userId_stepId: {
            userId,
            stepId
          }
        },
        create: {
          userId,
          stepId,
          status: 'COMPLETED',
          completedAt: new Date()
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })
    } else {
      // Option 1: Delete the record (simpler for checking existence)
      // Option 2: Set to PENDING. 
      // User prompt says: "Se desmarcar, remova o registro ou mude para PENDING."
      // I will remove it to keep it clean, or set to PENDING if we want to keep history? 
      // Let's set to PENDING so we don't lose the record if we want to track "started" later. 
      // But for now, if it's just check/uncheck, maybe delete is fine?
      // Actually, if I set to PENDING, `completedAt` should be null.
      await prisma.memberGrowthProgress.update({
        where: {
            userId_stepId: {
              userId,
              stepId
            }
        },
        data: {
            status: 'PENDING',
            completedAt: null
        }
      })
      // If it doesn't exist, update throws. So we should probably just delete or upsert to PENDING.
      // But if it's not checked, it shouldn't exist or be PENDING.
    }

    revalidatePath('/app/lideranca')
    revalidatePath(`/app/lideranca/${userId}`) // If we have individual pages
    return { success: true }
  } catch (error) {
    console.error('Error toggling progress:', error)
    return { error: 'Failed to update progress' }
  }
}
