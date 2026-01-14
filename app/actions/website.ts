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
        // Default values
        heroTitle: "Bem-vindo à Nossa Igreja",
        heroSubtitle: "Um lugar de fé, esperança e amor.",
        heroCtaText: "Visite-nos",
        heroCtaLink: "#schedule",
        weeklySchedule: JSON.stringify([
          { dia: "Domingo", horario: "10:00", titulo: "Culto da Manhã" },
          { dia: "Domingo", horario: "18:00", titulo: "Culto da Noite" },
          { dia: "Quarta-feira", horario: "20:00", titulo: "Culto de Oração" }
        ]),
        contactWhatsapp: "5511999999999",
        socialInstagram: "@igreja",
        footerAddress: "Rua da Igreja, 123 - Centro"
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
      weeklySchedule: data.weeklySchedule,
      contactWhatsapp: data.contactWhatsapp,
      socialInstagram: data.socialInstagram,
      footerAddress: data.footerAddress,
    }
  })

  revalidatePath('/')
  revalidatePath('/admin/website')
  return config
}
