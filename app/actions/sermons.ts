'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/supabase'

// --- SERIES ---

export async function getSermonSeries() {
  return await prisma.sermonSeries.findMany({
    include: {
      sermons: {
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { startDate: 'desc' }
  })
}

export async function getSermonSeriesById(id: string) {
  return await prisma.sermonSeries.findUnique({
    where: { id },
    include: {
      sermons: {
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function createSermonSeries(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : null
    const coverFile = formData.get('coverFile') as File

    if (!coverFile) return { error: 'Capa é obrigatória' }

    const coverUrl = await uploadFile(coverFile, 'midia')

    await prisma.sermonSeries.create({
      data: {
        title,
        description,
        startDate,
        coverUrl: coverUrl || '',
        isActive: true
      }
    })

    revalidatePath('/mensagens')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error creating sermon series:', error)
    return { error: 'Erro ao criar série' }
  }
}

export async function deleteSermonSeries(id: string) {
  try {
    // Primeiro deletar sermões associados? O delete cascade deve cuidar ou precisamos deletar manual se não configurado
    // O Prisma padrão não faz cascade delete no banco a menos que configurado no schema com onDelete: Cascade
    // No schema atual: series SermonSeries @relation(fields: [seriesId], references: [id])
    // Não tem onDelete Cascade. Então preciso deletar sermões antes.
    
    await prisma.sermon.deleteMany({
      where: { seriesId: id }
    })

    await prisma.sermonSeries.delete({
      where: { id }
    })

    revalidatePath('/mensagens')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error deleting sermon series:', error)
    return { error: 'Erro ao deletar série' }
  }
}

// --- SERMONS ---

export async function createSermon(data: { title: string, youtubeUrl: string, date: Date, seriesId: string }) {
  try {
    await prisma.sermon.create({
      data
    })

    revalidatePath('/mensagens')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error creating sermon:', error)
    return { error: 'Erro ao criar sermão' }
  }
}

export async function deleteSermon(id: string) {
  try {
    await prisma.sermon.delete({
      where: { id }
    })

    revalidatePath('/mensagens')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Error deleting sermon:', error)
    return { error: 'Erro ao deletar sermão' }
  }
}
