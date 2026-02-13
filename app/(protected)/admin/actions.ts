'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import { sendNotification } from '@/app/actions/notifications'

// Buscar todas as células para os selects
export async function getCells() {
  const cells = await prisma.cell.findMany({
    select: {
      id: true,
      nome: true,
      liderId: true,
      lider2Id: true,
      supervisorId: true
    },
    orderBy: {
      nome: 'asc'
    }
  })
  return cells
}

// Buscar detalhes do usuário para edição
export async function getUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      celulaId: true,
      celulaLiderada: {
        select: { id: true }
      },
      celulaLiderada2: {
        select: { id: true }
      },
      celulasSupervisionadas: {
        select: { id: true }
      }
    }
  })
  return user
}

type UpdateUserRoleParams = {
  userId: string
  role: Role
  celulaId: string // Célula onde ele é membro (base)
  funcoes?: string | null // Funções extras (comma separated)
  liderancaCellId?: string // Se for LIDER, qual célula lidera
  lideranca2CellId?: string // Se for LIDER, qual a segunda opção de liderança
  supervisaoCellIds?: string[] // Se for SUPERVISOR, quais supervisiona
}

export async function updateUserRoleAndCells({
  userId,
  role,
  celulaId,
  funcoes,
  liderancaCellId,
  lideranca2CellId,
  supervisaoCellIds
}: UpdateUserRoleParams) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Limpar responsabilidades antigas
      
      // Se ele era líder de alguma célula, remover a liderança
      await tx.cell.updateMany({
        where: { liderId: userId },
        data: { liderId: null }
      })

      await tx.cell.updateMany({
        where: { lider2Id: userId },
        data: { lider2Id: null }
      })

      // Se ele era supervisor de células, remover a supervisão
      await tx.cell.updateMany({
        where: { supervisorId: userId },
        data: { supervisorId: null }
      })

      // 2. Atualizar o Usuário e suas novas responsabilidades
      
      // Atualização base do usuário (Role e Célula de Membresia)
      await tx.user.update({
        where: { id: userId },
        data: {
          role: role,
          celulaId: celulaId,
          funcoes: funcoes
        }
      })

      // Lógica específica por cargo
      if (role === 'LIDER') {
        if (liderancaCellId) {
          await tx.cell.update({
            where: { id: liderancaCellId },
            data: { liderId: userId }
          })
        }
        if (lideranca2CellId) {
          await tx.cell.update({
            where: { id: lideranca2CellId },
            data: { lider2Id: userId }
          })
        }
      } else if (role === 'SUPERVISOR' && supervisaoCellIds && supervisaoCellIds.length > 0) {
        // Atualizar todas as células selecionadas para terem este usuário como supervisor
        await tx.cell.updateMany({
          where: { id: { in: supervisaoCellIds } },
          data: { supervisorId: userId }
        })
      }
    })

    // Send Notification
    let message = `Seu nível de acesso foi atualizado para ${role}.`
    if (role === 'LIDER') {
      if (liderancaCellId || lideranca2CellId) {
        const cells = await prisma.cell.findMany({
          where: { id: { in: [liderancaCellId, lideranca2CellId].filter(Boolean) as string[] } },
          select: { nome: true }
        })
        if (cells.length > 0) {
          message = `Você agora é LIDER ${cells.length > 1 ? 'das células' : 'da célula'} ${cells.map(c => c.nome).join(' e ')}.`
        }
      }
    } else if (role === 'SUPERVISOR') {
       message = `Você agora é SUPERVISOR.`
    }

    await sendNotification({
      userId: userId,
      title: "Novos Horizontes! 🚀",
      message: message,
      type: "ROLE",
      link: "/perfil",
      metaData: { role }
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return { error: 'Falha ao atualizar permissões do usuário.' }
  }
}

export async function toggleUserActiveStatus(userId: string, ativo: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { ativo }
    })

    revalidatePath('/admin/membros')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error)
    return { error: 'Erro ao atualizar status do usuário.' }
  }
}
