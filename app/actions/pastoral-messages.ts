'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

async function uploadToSupabase(file: File): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing')
      return null
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error } = await supabase.storage
      .from('midia')
      .upload(fileName, file)

    if (error) {
      console.error('Supabase upload error:', error)
      return null
    }

    const { data: publicUrlData } = supabase.storage.from('midia').getPublicUrl(fileName)
    const finalImageUrl = publicUrlData.publicUrl
    
    return finalImageUrl
  } catch (error) {
    console.error('Upload exception:', error)
    return null
  }
}

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
      console.log('Iniciando upload de imagem (Create)...')
      const url = await uploadToSupabase(imageFile)
      
      if (url) {
        imageUrl = url
        console.log('URL da Imagem Gerada (Create):', imageUrl)
      }
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

    const dataToUpdate: any = {
        titulo: title,
        conteudo: content,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        ativo: ativo
    }

    // Lógica Crítica: Só atualiza imageUrl se houver novo arquivo
    if (imageFile && imageFile.size > 0) {
      console.log('Iniciando upload de imagem (Update)...')
      const url = await uploadToSupabase(imageFile)
      
      if (url) {
        dataToUpdate.imageUrl = url
        console.log('URL da Imagem Gerada (Update):', url)
      }
    }

    await prisma.pastoralMessage.update({
      where: { id },
      data: dataToUpdate
    })

    revalidatePath('/admin/pastoral')
    revalidatePath('/')
    revalidatePath('/app')
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

export async function togglePastoralMessageStatus(id: string) {
  try {
    const user = await getUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
      return { error: 'Não autorizado.' }
    }

    const message = await prisma.pastoralMessage.findUnique({ where: { id } })
    if (!message) return { error: 'Mensagem não encontrada.' }

    await prisma.pastoralMessage.update({
      where: { id },
      data: { ativo: !message.ativo }
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
