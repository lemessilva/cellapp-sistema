'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'

import { uploadFile } from '@/lib/supabase'

export async function updateProfile(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Não autorizado.' }
  
  const userId = formData.get('userId') as string
  if (user.id !== userId && user.role !== 'ADMIN') return { error: 'Não autorizado.' }

  try {
    const photoFile = formData.get('foto_url') as File | null
    let foto_url = undefined

    if (photoFile && photoFile.size > 0) {
      const url = await uploadFile(photoFile, 'uploads')
      if (url) foto_url = url
    }

    const data_nascimento = formData.get('data_nascimento') as string

    await prisma.user.update({
      where: { id: userId },
      data: {
        nome: formData.get('nome') as string,
        telefone: formData.get('telefone') as string,
        endereco: formData.get('endereco') as string,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        ...(foto_url && { foto_url })
      }
    })
    revalidatePath('/app/perfil')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Erro ao atualizar perfil.' }
  }
}

export async function addOikos(name: string) {
  const user = await getUser()
  if (!user) return { error: 'Não autorizado.' }

  try {
    await prisma.oikos.create({
      data: {
        nome: name,
        userId: user.id
      }
    })
    revalidatePath('/app/perfil')
    revalidatePath('/app/oracao')
    return { success: true }
  } catch (e) {
    return { error: 'Erro ao adicionar Oikos.' }
  }
}

export async function removeOikos(id: string) {
  const user = await getUser()
  if (!user) return { error: 'Não autorizado.' }

  try {
    // Garantir que o oikos pertence ao usuário
    const oikos = await prisma.oikos.findUnique({ where: { id } })
    if (!oikos || oikos.userId !== user.id) return { error: 'Não encontrado.' }

    await prisma.oikos.delete({ where: { id } })
    revalidatePath('/app/perfil')
    revalidatePath('/app/oracao')
    return { success: true }
  } catch (e) {
    return { error: 'Erro ao remover Oikos.' }
  }
}
