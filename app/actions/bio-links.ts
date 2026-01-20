'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getBioLinks() {
  return await prisma.bioLink.findMany({
    orderBy: { order: 'asc' }
  })
}

export async function createBioLink(data: { title: string, url: string, icon?: string, isHighlight?: boolean }) {
  try {
    const count = await prisma.bioLink.count()
    
    await prisma.bioLink.create({
      data: {
        ...data,
        order: count
      }
    })
    
    revalidatePath('/links')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error creating bio link:', error)
    return { error: 'Erro ao criar link' }
  }
}

export async function updateBioLink(id: string, data: { title?: string, url?: string, icon?: string, isActive?: boolean, isHighlight?: boolean }) {
  try {
    await prisma.bioLink.update({
      where: { id },
      data
    })
    
    revalidatePath('/links')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error updating bio link:', error)
    return { error: 'Erro ao atualizar link' }
  }
}

export async function deleteBioLink(id: string) {
  try {
    await prisma.bioLink.delete({
      where: { id }
    })
    
    revalidatePath('/links')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error deleting bio link:', error)
    return { error: 'Erro ao deletar link' }
  }
}

export async function reorderBioLinks(items: { id: string, order: number }[]) {
  try {
    for (const item of items) {
      await prisma.bioLink.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    }
    
    revalidatePath('/links')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error reordering bio links:', error)
    return { error: 'Erro ao reordenar links' }
  }
}
