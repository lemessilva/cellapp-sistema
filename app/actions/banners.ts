'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadToMidiaBucket } from '@/lib/supabase'

export async function getBanners() {
  const banners = await prisma.siteBanner.findMany({
    orderBy: { ordem: 'asc' }
  })
  return banners
}

export async function createBanner(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const file = formData.get('file') as File
    const linkBotao = formData.get('linkBotao') as string
    const textoBotao = formData.get('textoBotao') as string
    
    if (!file || file.size === 0) {
      return { error: 'Imagem obrigatória' }
    }

    const imageUrl = await uploadToMidiaBucket(file)

    if (!imageUrl) {
      return { error: 'Falha no upload da imagem' }
    }

    // Get max order to append
    const lastBanner = await prisma.siteBanner.findFirst({
      orderBy: { ordem: 'desc' }
    })
    const newOrder = (lastBanner?.ordem ?? -1) + 1

    await prisma.siteBanner.create({
      data: {
        titulo: title,
        subtitulo: subtitle,
        imageUrl,
        linkBotao,
        textoBotao,
        ordem: newOrder,
        ativo: true
      }
    })

    revalidatePath('/')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar banner:', error)
    return { error: 'Erro ao criar banner' }
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.siteBanner.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar banner:', error)
    return { error: 'Erro ao deletar banner' }
  }
}

export async function toggleBannerStatus(id: string) {
  try {
    const banner = await prisma.siteBanner.findUnique({ where: { id } })
    if (!banner) return { error: 'Banner não encontrado' }

    await prisma.siteBanner.update({
      where: { id },
      data: { ativo: !banner.ativo }
    })

    revalidatePath('/')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Erro ao alterar status do banner:', error)
    return { error: 'Erro ao alterar status' }
  }
}
