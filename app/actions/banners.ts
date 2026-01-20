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
    const linkBotao = formData.get('linkBotao') as string
    const textoBotao = formData.get('textoBotao') as string
    
    const desktopFile = formData.get('desktopFile') as File | null
    const mobileFile = formData.get('mobileFile') as File | null
    const desktopUrlExisting = formData.get('desktopUrlExisting') as string | null
    const mobileUrlExisting = formData.get('mobileUrlExisting') as string | null
    
    let desktopUrl = ''
    
    // 1. Handle Desktop Image (Priority: File > Existing URL)
    if (desktopFile && desktopFile.size > 0) {
      const uploadedUrl = await uploadToMidiaBucket(desktopFile)
      if (!uploadedUrl) return { error: 'Falha no upload da imagem Desktop' }
      desktopUrl = uploadedUrl
    } else if (desktopUrlExisting) {
      desktopUrl = desktopUrlExisting
    } else {
      return { error: 'Imagem Desktop obrigatória (Upload ou Biblioteca)' }
    }

    // 2. Handle Mobile Image
    let mobileUrl = null
    if (mobileFile && mobileFile.size > 0) {
      mobileUrl = await uploadToMidiaBucket(mobileFile)
    } else if (mobileUrlExisting) {
      mobileUrl = mobileUrlExisting
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
        desktopUrl,
        mobileUrl,
        linkBotao,
        textoBotao,
        ordem: newOrder,
        ativo: true
      }
    })

    revalidatePath('/')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao criar banner:', error)
    // Return specific error message if available
    return { error: error.message || 'Erro ao criar banner' }
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
