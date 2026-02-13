'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendPushToUser } from '@/lib/push'

async function uploadToSupabase(file: File): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Usar Service Role Key para ignorar RLS (Admin Client)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing (Service Role Key)')
      throw new Error('Supabase credentials missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // 1. Conversão para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 2. Upload com Buffer
    const { data, error: uploadError } = await supabase.storage
      .from('midia')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    // 3. Tratamento de Erro Explícito
    if (uploadError) {
      console.error('ERRO SUPABASE:', uploadError)
      throw new Error('Falha no upload para o Supabase')
    }

    // 4. Verificação da URL
    const { data: publicUrlData } = supabase.storage.from('midia').getPublicUrl(fileName)
    const finalImageUrl = publicUrlData.publicUrl
    
    if (!finalImageUrl) {
        throw new Error('URL pública gerada é vazia')
    }

    return finalImageUrl
  } catch (error) {
    console.error('Upload exception:', error)
    throw error // Re-throw para parar o processo
  }
}

export async function getPastoralMessages() {
  const messages = await prisma.pastoralMessage.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return messages
}

export async function getActivePastoralMessage() {
  const message = await prisma.pastoralMessage.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
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
    const createdAt = formData.get('createdAt') as string
    
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
        title: title,
        content: content,
        imageUrl: imageUrl,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        isActive: true
      }
    })

    revalidatePath('/admin/pastoral')
    revalidatePath('/')
    revalidatePath('/app')

    // Notificar todos os usuários sobre a nova mensagem pastoral
    const users = await prisma.user.findMany({
      where: { ativo: true },
      select: { id: true }
    })

    // Enviar notificações push para todos os usuários ativos
    await Promise.allSettled(
      users.map(u => 
        sendPushToUser(
          u.id,
          "📢 Recado da Liderança",
          `Nova mensagem: ${title}`,
          "/app"
        )
      )
    )

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
    const createdAt = formData.get('createdAt') as string
    const isActive = formData.get('isActive') === 'true'

    const dataToUpdate: any = {
        title: title,
        content: content,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        isActive: isActive
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
      data: { isActive: !message.isActive }
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
