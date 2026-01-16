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

    const tipoRaw = (formData.get('tipo') as string) || 'BUG'
    const titulo = (formData.get('titulo') as string || '').trim()
    const descricao = (formData.get('descricao') as string || '').trim()

    const allowedTipos = ['BUG', 'SUGESTAO']
    const tipo = allowedTipos.includes(tipoRaw) ? tipoRaw : 'BUG'

    if (!titulo || !descricao) {
      return { error: 'Preencha o título e a descrição do feedback.' }
    }

    await prisma.systemFeedback.create({
      data: {
        tipo,
        titulo,
        descricao,
        status: 'PENDENTE',
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
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          nome: true,
          foto_url: true,
        },
      },
    },
  })

  return feedbacks
}

export async function updateFeedbackStatus(formData: FormData): Promise<void> {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    return
  }

  const id = formData.get('id') as string
  const statusRaw = (formData.get('status') as string) || 'PENDENTE'
  const allowedStatus = ['PENDENTE', 'EM_ANALISE', 'RESOLVIDO']
  const status = allowedStatus.includes(statusRaw) ? statusRaw : 'PENDENTE'

  if (!id) {
    return
  }

  await prisma.systemFeedback.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/admin/feedbacks')
}
