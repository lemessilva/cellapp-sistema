'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'

export async function getSiteConfiguration() {
  let config = await prisma.siteConfiguration.findUnique({
    where: { id: 1 }
  })

  if (!config) {
    config = await prisma.siteConfiguration.create({
      data: {
        id: 1,
        heroTitle: "Bem-vindo à Nossa Igreja",
        heroSubtitle: "Um lugar de fé, esperança e amor.",
        heroCtaText: "Visite-nos",
        heroCtaLink: "#schedule",
        // Barra de Avisos (Default)
        alertActive: false,
        alertTitle: "Aviso Importante",
        alertText: "",
        alertColor: "bg-blue-600",
        alertLink: "",
        weeklySchedule: JSON.stringify([
          { dia: "Domingo", horario: "10:00", titulo: "Culto da Manhã" },
          { dia: "Domingo", horario: "18:00", titulo: "Culto da Noite" },
          { dia: "Quarta-feira", horario: "20:00", titulo: "Culto de Oração" }
        ]),
        contactWhatsapp: "5511999999999",
        socialInstagram: "@igreja",
        footerAddress: "Rua da Igreja, 123 - Centro",
        isLive: false
      }
    })
  }

  return config
}

export async function updateSiteConfiguration(data: any) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    throw new Error('Unauthorized')
  }

  const config = await prisma.siteConfiguration.update({
    where: { id: 1 },
    data: {
      heroTitle: data.heroTitle,
      heroSubtitle: data.heroSubtitle,
      heroBgImage: data.heroBgImage,
      heroCtaText: data.heroCtaText,
      heroCtaLink: data.heroCtaLink,
      
      // Alert Fields
      alertActive: data.alertActive,
      alertTitle: data.alertTitle,
      alertText: data.alertText,
      alertColor: data.alertColor,
      alertLink: data.alertLink,

      weeklySchedule: data.weeklySchedule,
      contactWhatsapp: data.contactWhatsapp,
      socialInstagram: data.socialInstagram,
      footerAddress: data.footerAddress,
      isLive: data.isLive,
    }
  })

  revalidatePath('/')
  revalidatePath('/admin/website')
  return config
}

export async function toggleLiveStatus() {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    throw new Error('Unauthorized')
  }

  const current = await prisma.siteConfiguration.findUnique({
    where: { id: 1 },
    select: { isLive: true }
  })

  if (!current) throw new Error('Config not found')

  const updated = await prisma.siteConfiguration.update({
    where: { id: 1 },
    data: { isLive: !current.isLive }
  })

  revalidatePath('/')
  revalidatePath('/admin/website')
  revalidatePath('/media')
  return updated
}

export async function updateAlertSettings(data: {
  active: boolean
  title: string
  message: string
}) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    throw new Error('Unauthorized')
  }

  const updated = await prisma.siteConfiguration.update({
    where: { id: 1 },
    data: {
      alertActive: data.active,
      alertTitle: data.title,
      alertText: data.message,
    }
  })

  revalidatePath('/')
  revalidatePath('/media')
  return updated
}


