'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { sendNotification } from './notifications'

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

export async function createGrowthStep(data: { title: string, description?: string, icon?: string }) {
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
        icon: data.icon,
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

export async function updateGrowthStep(id: string, data: { title: string, description?: string, icon?: string }) {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const step = await prisma.growthTrackStep.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon
      }
    })

    revalidatePath('/admin/trilho')
    return { success: true, step }
  } catch (error) {
    console.error('Error updating growth step:', error)
    return { error: 'Failed to update step' }
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
      const step = await prisma.growthTrackStep.findUnique({ where: { id: stepId } })

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

      // Send notification
      if (step) {
        await sendNotification({
          userId,
          title: 'Etapa Concluída! 🎉',
          message: `Parabéns! Você concluiu a etapa ${step.title}. Continue avançando no seu crescimento!`,
          type: 'SUCCESS',
          link: '/perfil'
        })
      }

    } else {
      // Remove o progresso se desmarcar
      await prisma.memberGrowthProgress.deleteMany({
        where: {
          userId,
          stepId
        }
      })
    }

    revalidatePath('/app/lideranca')
    revalidatePath(`/app/lideranca/${userId}`) // If we have individual pages
    return { success: true }
  } catch (error) {
    console.error('Error toggling progress:', error)
    return { error: 'Failed to update progress' }
  }
}
