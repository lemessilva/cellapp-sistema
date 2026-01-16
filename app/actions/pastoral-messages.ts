'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

export async function getPastoralMessages() {
  const messages = await prisma.pastoralMessage.findMany({
    orderBy: { publishedAt: 'desc' }
  })
  return messages
}

export async function getActivePastoralMessage() {
  const message = await prisma.pastoralMessage.findFirst({
    where: { ativo: true },
    orderBy: { publishedAt: 'desc' }
  })
  return message
}

export async function getPastoralMessageById(id: string) {
  const message = await prisma.pastoralMessage.findUnique({
    where: { id }
  })
  return message
}

export async function createPastoralMessage(formData: FormData) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Não autorizado.' }
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const imageFile = formData.get('imageFile') as File | null
    const publishedAt = formData.get('publishedAt') as string
    
    let imageUrl = null

    if (imageFile && imageFile.size > 0) {
      const url = await uploadFile(imageFile, 'midia')
      if (url) imageUrl = url
    }

    await prisma.pastoralMessage.create({
      data: {
        titulo: title,
        conteudo: content,
        imageUrl: imageUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        ativo: true
      }
    })

    revalidatePath('/admin/pastoral')
    revalidatePath('/')
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar mensagem pastoral:', error)
    return { error: 'Erro ao criar mensagem.' }
  }
}

export async function updatePastoralMessage(id: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Não autorizado.' }
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const imageFile = formData.get('imageFile') as File | null
    const publishedAt = formData.get('publishedAt') as string
    const ativo = formData.get('ativo') === 'true'

    let imageUrl = formData.get('imageUrl') as string | null

    if (imageFile && imageFile.size > 0) {
      const url = await uploadFile(imageFile, 'midia')
      if (url) imageUrl = url
    }

    await prisma.pastoralMessage.update({
      where: { id },
      data: {
        titulo: title,
        conteudo: content,
        imageUrl: imageUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        ativo: ativo
      }
    })

    revalidatePath('/admin/pastoral')
    revalidatePath('/')
    revalidatePath('/app')
    revalidatePath(`/mensagem/${id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar mensagem pastoral:', error)
    return { error: 'Erro ao atualizar mensagem.' }
  }
}

export async function deletePastoralMessage(id: string) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Não autorizado.' }
    }

    await prisma.pastoralMessage.delete({
      where: { id }
    })

    revalidatePath('/admin/pastoral')
    revalidatePath('/')
    revalidatePath('/app')
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir mensagem pastoral:', error)
    return { error: 'Erro ao excluir mensagem.' }
  }
}

export async function togglePastoralMessageStatus(id: string, status: boolean) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Não autorizado.' }
    }

    await prisma.pastoralMessage.update({
      where: { id },
      data: { ativo: status }
    })

    revalidatePath('/admin/pastoral')
    revalidatePath('/')
    revalidatePath('/app')
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao alterar status:', error)
    return { error: 'Erro ao alterar status.' }
  }
}
