'use server'

import { prisma } from '@/lib/prisma'
import { uploadToMidiaBucket } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'

// --- Brand Assets ---

export async function getBrandAssets() {
  return await prisma.brandAsset.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function uploadBrandAsset(formData: FormData) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const type = formData.get('type') as string // 'LOGO', 'FONT', 'PALETTE', 'OTHER'
  const file = formData.get('file') as File | null
  const colorHex = formData.get('colorHex') as string | null

  if (!title || !type) {
    return { error: 'Título e Tipo são obrigatórios.' }
  }

  let fileUrl = null

  if (file && file.size > 0) {
    try {
      // Use midia bucket/folder convention if needed, uploadToMidiaBucket puts in 'midia' root usually
      // Ideally we would organize in folders but uploadToMidiaBucket handles it.
      fileUrl = await uploadToMidiaBucket(file)
    } catch (error) {
      console.error('Erro upload brand asset:', error)
      return { error: 'Falha no upload do arquivo.' }
    }
  }

  try {
    await prisma.brandAsset.create({
      data: {
        title,
        type,
        fileUrl,
        colorHex
      }
    })
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Erro db brand asset:', error)
    return { error: 'Erro ao salvar no banco.' }
  }
}

// --- Gallery Images ---

export async function getGalleryImages() {
  return await prisma.galleryImage.findMany({
    orderBy: { order: 'asc' }
  })
}

export async function uploadGalleryImage(formData: FormData) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    return { error: 'Unauthorized' }
  }

  const files = formData.getAll('files') as File[]
  
  if (!files || files.length === 0) {
    return { error: 'Nenhum arquivo enviado.' }
  }

  let successCount = 0
  let failCount = 0

  // Get current max order
  const lastImg = await prisma.galleryImage.findFirst({
    orderBy: { order: 'desc' }
  })
  let nextOrder = (lastImg?.order ?? -1) + 1

  for (const file of files) {
    try {
      const url = await uploadToMidiaBucket(file)
      if (url) {
        await prisma.galleryImage.create({
          data: {
            url,
            order: nextOrder++
          }
        })
        successCount++
      } else {
        failCount++
      }
    } catch (error) {
      console.error(`Erro upload gallery image ${file.name}:`, error)
      failCount++
    }
  }

  revalidatePath('/admin/website')
  revalidatePath('/') // Revalidate home page too
  
  return { success: true, count: successCount, failed: failCount }
}

export async function deleteAsset(id: string, model: 'BrandAsset' | 'GalleryImage') {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    return { error: 'Unauthorized' }
  }

  try {
    if (model === 'BrandAsset') {
      await prisma.brandAsset.delete({ where: { id } })
    } else {
      await prisma.galleryImage.delete({ where: { id } })
    }
    revalidatePath('/admin/website')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error(`Erro delete ${model}:`, error)
    return { error: 'Erro ao excluir.' }
  }
}

// --- Notification Blaster ---

export async function getNotificationHistory() {
  return await prisma.notificationBlast.findMany({
    orderBy: { sentAt: 'desc' },
    take: 20
  })
}

export async function sendPushNotification(data: {
  title: string
  message: string
  link?: string
  target: string // 'ALL', 'LEADERS', 'MEMBERS', 'WORSHIP'
}) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    return { error: 'Unauthorized' }
  }

  const { title, message, link, target } = data

  if (!title || !message) {
    return { error: 'Título e Mensagem são obrigatórios.' }
  }

  try {
    // 1. Filter Users
    let whereClause: any = { ativo: true }

    if (target === 'LEADERS') {
      whereClause.role = { in: ['LIDER', 'SUPERVISOR', 'COORDENADOR', 'PASTOR', 'ADMIN'] }
    } else if (target === 'MEMBERS') {
       whereClause.role = 'MEMBRO'
    } else if (target === 'WORSHIP') {
       // Users who are assigned as Worship leader/person in any cell
       whereClause.celulaLouvor = { some: {} }
    }

    const targetUsers = await prisma.user.findMany({
      where: whereClause,
      select: { id: true }
    })

    if (targetUsers.length === 0) {
      return { error: 'Nenhum usuário encontrado para este público.' }
    }

    // 2. Create Notifications
    await prisma.notification.createMany({
      data: targetUsers.map(u => ({
        userId: u.id,
        title,
        message,
        type: 'INFO', // or ALERT
        link: link || null,
        read: false
      }))
    })

    // 3. Log to History
    await prisma.notificationBlast.create({
      data: {
        title,
        message,
        target,
        sentCount: targetUsers.length
      }
    })

    revalidatePath('/admin/website')
    return { success: true, count: targetUsers.length }

  } catch (error) {
    console.error('Erro sendPushNotification:', error)
    return { error: 'Erro ao enviar notificações.' }
  }
}
