'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getMyChildren() {
  try {
    const user = await getUser()
    if (!user) return { error: 'Não autorizado' }

    const children = await prisma.user.findMany({
      where: {
        OR: [
          { parentId: user.id },
          { responsavelId: user.id }
        ],
        categoria: 'CRIANCA'
      },
      select: {
        id: true,
        nome: true,
        foto_url: true,
        genero: true,
        data_nascimento: true,
        oikos: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    return { data: children }
  } catch (error) {
    console.error('Error fetching children:', error)
    return { error: 'Erro ao buscar filhos.' }
  }
}

export async function addKidOikos(kidId: string, name: string) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Não autorizado' }

    // Verificar se é pai/responsável da criança
    const kid = await prisma.user.findFirst({
      where: {
        id: kidId,
        OR: [
          { parentId: user.id },
          { responsavelId: user.id }
        ]
      }
    })

    if (!kid) return { error: 'Criança não encontrada ou acesso negado.' }

    await prisma.oikos.create({
      data: {
        userId: kidId,
        nome: name
      }
    })

    revalidatePath('/app/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error adding kid oikos:', error)
    return { error: 'Erro ao adicionar amiguinho.' }
  }
}

export async function removeKidOikos(kidId: string, oikosId: string) {
    try {
      const user = await getUser()
      if (!user) return { error: 'Não autorizado' }
  
      // Verificar se é pai/responsável da criança
      const kid = await prisma.user.findFirst({
        where: {
          id: kidId,
          OR: [
            { parentId: user.id },
            { responsavelId: user.id }
          ]
        }
      })
  
      if (!kid) return { error: 'Acesso negado.' }
  
      await prisma.oikos.delete({
        where: {
          id: oikosId,
          userId: kidId
        }
      })
  
      revalidatePath('/app/dashboard')
      return { success: true }
    } catch (error) {
      console.error('Error removing kid oikos:', error)
      return { error: 'Erro ao remover amiguinho.' }
    }
}

export async function updateKidData(kidId: string, data: { data_nascimento?: string, genero?: string }) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Não autorizado' }

    // Verificar se é pai/responsável da criança
    const kid = await prisma.user.findFirst({
      where: {
        id: kidId,
        OR: [
          { parentId: user.id },
          { responsavelId: user.id }
        ]
      }
    })

    if (!kid) return { error: 'Acesso negado.' }

    await prisma.user.update({
      where: { id: kidId },
      data: {
        data_nascimento: data.data_nascimento ? new Date(data.data_nascimento) : undefined,
        genero: data.genero
      }
    })

    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error updating kid data:', error)
    return { error: 'Erro ao atualizar dados.' }
  }
}
