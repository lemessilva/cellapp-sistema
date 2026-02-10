'use server'

import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function uploadCellPhoto(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const cellId = formData.get('cellId') as string
  const caption = formData.get('caption') as string
  const file = formData.get('photo') as File

  if (!cellId || !file) return { error: 'Dados incompletos' }

  // Check Permissions
  const isGlobalAdmin = ['ADMIN', 'MIDIA', 'SUPERVISOR'].includes(user.role)
  
  if (!isGlobalAdmin) {
    // Check if user leads THIS cell
    const cell = await prisma.cell.findUnique({
      where: { id: cellId },
      select: { liderId: true, lider2Id: true }
    })
    
    if (!cell) return { error: 'Célula não encontrada' }
    
    const isLeader = cell.liderId === user.id || cell.lider2Id === user.id
    if (!isLeader) return { error: 'Apenas líderes podem postar fotos desta célula' }
  }

  try {
    const url = await uploadFile(file, 'cell-photos')
    
    await prisma.cellPhoto.create({
      data: {
        url,
        caption,
        cellId
      }
    })

    revalidatePath('/app')
    revalidatePath('/app/celula')
    return { success: true }
  } catch (error) {
    console.error('Error uploading cell photo:', error)
    return { error: 'Erro ao fazer upload da foto' }
  }
}

export async function getCommunityFeed() {
  try {
    const photos = await prisma.cellPhoto.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        cell: {
          select: { nome: true }
        }
      }
    })
    return photos
  } catch (error) {
    console.error('Error fetching community feed:', error)
    return []
  }
}

export async function updatePhotoCaption(photoId: string, newCaption: string) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const photo = await prisma.cellPhoto.findUnique({
      where: { id: photoId },
      include: { cell: true }
    })

    if (!photo) return { error: 'Foto não encontrada' }

    // Check Permissions
    const isGlobalAdmin = ['ADMIN', 'MIDIA', 'SUPERVISOR'].includes(user.role)
    const isLeader = photo.cell.liderId === user.id || photo.cell.lider2Id === user.id

    if (!isGlobalAdmin && !isLeader) {
      return { error: 'Você não tem permissão para editar esta foto' }
    }

    await prisma.cellPhoto.update({
      where: { id: photoId },
      data: { caption: newCaption }
    })

    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error updating photo caption:', error)
    return { error: 'Erro ao atualizar legenda' }
  }
}
