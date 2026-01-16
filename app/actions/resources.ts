'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { uploadFile } from '@/lib/supabase'

export async function getResources() {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    throw new Error('Unauthorized')
  }

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return resources
}

export async function createResource(formData: FormData) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    return { error: 'Acesso negado.' }
  }

  const titulo = formData.get('titulo') as string
  const tipo = formData.get('tipo') as string
  const publicoAlvo = formData.get('publicoAlvo') as string
  const file = formData.get('file') as File | null

  if (!titulo || !tipo || !publicoAlvo || !file || file.size === 0) {
    return { error: 'Preencha todos os campos e selecione um arquivo.' }
  }

  try {
    const fileUrl = await uploadFile(file, 'resources')

    if (!fileUrl) {
      return { error: 'Falha no upload do arquivo.' }
    }

    await prisma.resource.create({
      data: {
        titulo,
        tipo: tipo as any,
        fileUrl,
        publicoAlvo: publicoAlvo as any
      }
    })

    revalidatePath('/admin/website')
    revalidatePath('/lider/recursos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar recurso:', error)
    return { error: 'Erro ao criar recurso.' }
  }
}

export async function deleteResource(id: string) {
  const user = await getUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    return { error: 'Acesso negado.' }
  }

  try {
    await prisma.resource.delete({
      where: { id }
    })

    revalidatePath('/admin/website')
    revalidatePath('/lider/recursos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar recurso:', error)
    return { error: 'Erro ao deletar recurso.' }
  }
}

