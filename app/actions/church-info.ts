'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/supabase'

export async function getChurchInfo() {
  const info = await prisma.churchInfo.findUnique({
    where: { id: 'main' }
  })
  
  if (!info) {
    // Return default if not exists
    return {
      id: 'main',
      name: 'Minha Igreja',
      logoUrl: null,
      whatsapp: null,
      address: null,
      instagram: null,
      youtube: null
    }
  }
  
  return info
}

export async function updateGlobalAlert(data: {
  title: string
  message: string
  isActive: boolean
}) {
  return { error: 'Funcionalidade temporariamente indisponível (Erro de Migração de Banco)' }
}

export async function updateChurchInfo(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const whatsapp = formData.get('whatsapp') as string
    const address = formData.get('address') as string
    const instagram = formData.get('instagram') as string
    const youtube = formData.get('youtube') as string
    const themeColor = formData.get('themeColor') as string
    const heroVideoUrl = formData.get('heroVideoUrl') as string
    const logoFile = formData.get('logoFile') as File | null

    let logoUrl = undefined
    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadFile(logoFile, 'midia')
    }

    const data: any = {
      name,
      whatsapp,
      address,
      instagram,
      youtube,
      themeColor,
      heroVideoUrl
    }

    if (logoUrl) {
      data.logoUrl = logoUrl
    }

    await prisma.churchInfo.upsert({
      where: { id: 'main' },
      update: data,
      create: {
        id: 'main',
        ...data
      }
    })
    
    revalidatePath('/')
    revalidatePath('/admin/website')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar informações da igreja:', error)
    return { error: 'Erro ao atualizar informações' }
  }
}
