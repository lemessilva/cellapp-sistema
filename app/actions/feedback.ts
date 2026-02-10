'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Usuário não autenticado.' }
    }

    const typeRaw = (formData.get('type') as string) || (formData.get('tipo') as string) || 'BUG'
    const messageRaw = (formData.get('message') as string) || (formData.get('descricao') as string) || ''
    const titleRaw = (formData.get('title') as string) || (formData.get('titulo') as string) || ''
    
    // Combine title and message if title exists (since schema only has message)
    const message = titleRaw ? `${titleRaw}\n\n${messageRaw}`.trim() : messageRaw.trim()

    // Map Portuguese types to English
    let type = 'BUG'
    if (typeRaw === 'SUGESTAO' || typeRaw === 'SUGGESTION') type = 'SUGGESTION'
    else if (typeRaw === 'ELOGIO' || typeRaw === 'PRAISE') type = 'PRAISE'
    else if (typeRaw === 'BUG') type = 'BUG'
    else type = 'GERAL'

    if (!message) {
      return { error: 'Preencha a mensagem do feedback.' }
    }

    await prisma.systemFeedback.create({
      data: {
        type,
        message,
        status: 'PENDING',
        userId: user.id,
      },
    })

    revalidatePath('/admin/feedbacks')

    return { success: 'Obrigado! Nossa equipe técnica vai analisar.' }
  } catch (error) {
    console.error('Erro ao enviar feedback:', error)
    return { error: 'Erro ao enviar feedback. Tente novamente.' }
  }
}

export async function getSystemFeedbacks() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const feedbacks = await prisma.systemFeedback.findMany({
    include: {
      user: true, // Necessário para mostrar foto e nome de quem enviou
    },
    orderBy: {
      createdAt: 'desc', // Mais recentes primeiro
    },
  })

  return feedbacks
}

export async function getSystemFeedbackById(id: string) {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const feedback = await prisma.systemFeedback.findUnique({
    where: { id },
    include: {
      user: true,
    },
  })

  return feedback
}

export async function updateFeedbackStatus(formData: FormData): Promise<void> {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    return
  }

  const id = formData.get('id') as string
  const statusRaw = (formData.get('status') as string) || 'PENDING'
  
  // Update to English status values based on schema
  const allowedStatus = ['PENDING', 'REVIEWED', 'RESOLVED']
  // Map old Portuguese values just in case
  let status = statusRaw
  if (statusRaw === 'PENDENTE') status = 'PENDING'
  if (statusRaw === 'EM_ANALISE') status = 'REVIEWED'
  if (statusRaw === 'RESOLVIDO') status = 'RESOLVED'

  if (!allowedStatus.includes(status)) {
    status = 'PENDING'
  }

  if (!id) {
    return
  }

  await prisma.systemFeedback.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/admin/feedbacks')
  revalidatePath(`/admin/feedbacks/${id}`)
}
