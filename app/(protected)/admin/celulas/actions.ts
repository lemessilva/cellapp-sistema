'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '../../../actions/notifications'

export async function saveCell(formData: FormData) {
  const id = formData.get('id') as string | null
  const nome = formData.get('nome') as string
  const dia_reuniao = formData.get('dia_reuniao') as string
  const horario = formData.get('horario') as string
  const endereco = formData.get('endereco') as string
  const liderId = formData.get('liderId') as string
  const lider2Id = formData.get('lider2Id') as string
  const supervisorId = formData.get('supervisorId') as string
  const supervisor2Id = formData.get('supervisor2Id') as string

  // Mapeamento de dias para normalização
  const diaSemanaMap: Record<string, string> = {
    'Domingo': 'DOMINGO',
    'Segunda-feira': 'SEGUNDA',
    'Terça-feira': 'TERCA',
    'Quarta-feira': 'QUARTA',
    'Quinta-feira': 'QUINTA',
    'Sexta-feira': 'SEXTA',
    'Sábado': 'SABADO'
  }
  const diaSemana = diaSemanaMap[dia_reuniao] || null

  // New Role Fields
  const tesoureiroId = formData.get('tesoureiroId') as string
  const intercessorId = formData.get('intercessorId') as string
  const secretarioId = formData.get('secretarioId') as string
  const eventosId = formData.get('eventosId') as string
  const louvorId = formData.get('louvorId') as string

  if (!nome) {
    return { error: 'Nome da célula é obrigatório.' }
  }

  // Regra de Exclusividade de Papéis (Mesma Requisição)
  const proposedLeaders = [liderId, lider2Id].filter(Boolean)
  const proposedSupervisors = [supervisorId, supervisor2Id].filter(Boolean)

  // 1. Check for duplicates within leaders (Leader 1 same as Leader 2)
  if (proposedLeaders.length === 2 && proposedLeaders[0] === proposedLeaders[1]) {
     return { error: 'Você selecionou a mesma pessoa duas vezes como Líder.' }
  }
  // 2. Check for duplicates within supervisors
  if (proposedSupervisors.length === 2 && proposedSupervisors[0] === proposedSupervisors[1]) {
     return { error: 'Você selecionou a mesma pessoa duas vezes como Supervisor.' }
  }

  // 3. Check overlap between Leaders and Supervisors
  const overlap = proposedLeaders.filter(l => proposedSupervisors.includes(l))
  if (overlap.length > 0) {
    return { error: 'O mesmo usuário não pode ser Líder e Supervisor simultaneamente.' }
  }

  try {
    // Validações Globais de Exclusividade
    
    // Validate ALL proposed leaders
    for (const lId of proposedLeaders) {
        // Is this person a Supervisor elsewhere?
        const isSupervisor = await prisma.cell.findFirst({
            where: { 
                OR: [
                    { supervisorId: lId },
                    { supervisor2Id: lId }
                ]
            },
            select: { id: true }
        })
        if (isSupervisor) {
            return { error: 'Um dos líderes selecionados já é Supervisor em outra célula.' }
        }
        
        // Is this person already a Leader elsewhere? (Except for THIS cell if updating)
        const existingLeaderCell = await prisma.cell.findFirst({
            where: {
                OR: [
                    { liderId: lId },
                    { lider2Id: lId }
                ]
            },
            select: { id: true }
        })
        
        if (existingLeaderCell) {
             if (!id || existingLeaderCell.id !== id) {
                 return { error: 'Um dos líderes selecionados já lidera outra célula.' }
             }
        }
    }

    // Validate ALL proposed supervisors
    for (const sId of proposedSupervisors) {
        // Is this person a Leader elsewhere?
        const isLeader = await prisma.cell.findFirst({
            where: {
                OR: [
                    { liderId: sId },
                    { lider2Id: sId }
                ]
            },
            select: { id: true }
        })
        if (isLeader) {
            return { error: 'Um dos supervisores selecionados é Líder de uma célula.' }
        }
    }

    if (id) {
      // Update
      // Buscar estado atual para comparação de notificações
      const currentCell = await prisma.cell.findUnique({
        where: { id },
        select: {
          nome: true,
          tesoureiroId: true,
          secretarioId: true,
          louvorId: true,
          eventosId: true,
          intercessorId: true,
          liderId: true,
          lider2Id: true,
          supervisorId: true,
          supervisor2Id: true
        }
      })

      await prisma.cell.update({
        where: { id },
        data: {
          nome,
          dia_reuniao,
          diaSemana,
          horario,
          endereco,
          liderId: liderId || null,
          lider2Id: lider2Id || null,
          supervisorId: supervisorId || null,
          supervisor2Id: supervisor2Id || null,
          tesoureiroId: tesoureiroId || null,
          intercessorId: intercessorId || null,
          secretarioId: secretarioId || null,
          eventosId: eventosId || null,
          louvorId: louvorId || null
        }
      })

      // Verificar mudanças e notificar
      if (currentCell) {
        const rolesToCheck = [
          { key: 'tesoureiroId', label: 'Tesoureiro', newVal: tesoureiroId },
          { key: 'secretarioId', label: 'Secretário', newVal: secretarioId },
          { key: 'louvorId', label: 'Líder de Louvor', newVal: louvorId },
          { key: 'eventosId', label: 'Líder de Eventos', newVal: eventosId },
          { key: 'intercessorId', label: 'Intercessor', newVal: intercessorId },
          { key: 'liderId', label: 'Líder', newVal: liderId },
          { key: 'lider2Id', label: 'Co-Líder', newVal: lider2Id },
          { key: 'supervisorId', label: 'Supervisor', newVal: supervisorId },
          { key: 'supervisor2Id', label: 'Co-Supervisor', newVal: supervisor2Id }
        ]

        for (const role of rolesToCheck) {
            const oldVal = currentCell[role.key as keyof typeof currentCell]
            const newVal = role.newVal || null

            if (newVal && newVal !== oldVal) {
                const memberUser = await prisma.user.findUnique({
                    where: { id: newVal },
                    select: { id: true }
                })

                if (memberUser) {
                    await sendNotification({
                        userId: memberUser.id,
                        title: 'Nova Responsabilidade',
                        message: `Você foi definido como ${role.label} da célula ${currentCell.nome}.`,
                        type: 'SUCCESS',
                        link: '/app/celula'
                    })
                }
            }
        }
      }

    } else {
      // Create
      await prisma.cell.create({
        data: {
          nome,
          dia_reuniao,
          diaSemana,
          horario,
          endereco,
          liderId: liderId || null,
          lider2Id: lider2Id || null,
          supervisorId: supervisorId || null,
          supervisor2Id: supervisor2Id || null,
          tesoureiroId: tesoureiroId || null,
          intercessorId: intercessorId || null,
          secretarioId: secretarioId || null,
          eventosId: eventosId || null,
          louvorId: louvorId || null
        }
      })

      // Notificar todos os cargos definidos na criação
      const rolesToNotify = [
          { id: tesoureiroId, label: 'Tesoureiro' },
          { id: secretarioId, label: 'Secretário' },
          { id: louvorId, label: 'Líder de Louvor' },
          { id: eventosId, label: 'Líder de Eventos' },
          { id: intercessorId, label: 'Intercessor' },
          { id: liderId, label: 'Líder' },
          { id: lider2Id, label: 'Co-Líder' },
          { id: supervisorId, label: 'Supervisor' },
          { id: supervisor2Id, label: 'Co-Supervisor' }
      ]

      for (const role of rolesToNotify) {
          if (role.id) {
              await sendNotification({
                  userId: role.id,
                  title: 'Nova Responsabilidade',
                  message: `Você foi definido como ${role.label} da célula ${nome}.`,
                  type: 'SUCCESS',
                  link: '/app/celula'
              })
          }
      }
    }

    revalidatePath('/admin/celulas')
    return { success: true }
  } catch (error) {
    console.error('Erro ao salvar célula:', error)
    return { error: 'Erro ao salvar célula.' }
  }
}

export async function deleteCell(id: string) {
  try {
    // Verificar se tem membros ou lideres antes?
    // O Prisma pode lançar erro se tiver restrições, mas aqui vamos tentar deletar direto
    // Se tiver relacionamentos obrigatórios que impedem, vai dar erro.
    // LiderId é opcional no User (relation), mas User tem celulaId.
    // Se deletar a celula, os users ficam com celulaId null (se onDelete: SetNull) ou dá erro.
    // No schema atual:
    // celula          Cell?     @relation("MembrosCelula", fields: [celulaId], references: [id])
    // Não tem onDelete especificado, padrão do prisma costuma ser restrict em alguns DBs ou SetNull se opcional?
    // Vamos assumir que precisamos limpar os membros antes ou o banco trata.
    // Para segurança, vamos desconectar membros primeiro.
    
    await prisma.$transaction(async (tx) => {
        // Desconectar membros
        await tx.user.updateMany({
            where: { celulaId: id },
            data: { celulaId: null }
        })
        
        // Desconectar lider (se houver liderança apontando pra essa celula na tabela User, 
        // mas a relação LiderCelula é definida na Cell com liderId, e no User com celulaLiderada.
        // Se deletar Cell, o User.celulaLiderada some.
        // Mas precisamos ver se o User tem algum campo apontando pra Cell que precise ser limpo.
        // User.celulaLiderada é virtual (relação inversa).
        
        // Agora deleta a célula
        await tx.cell.delete({
            where: { id }
        })
    })

    revalidatePath('/admin/celulas')
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar célula:', error)
    return { error: 'Não foi possível excluir a célula. Verifique se há pendências.' }
  }
}

export async function getUsersForSelection() {
  return await prisma.user.findMany({
    where: {
      ativo: true
    },
    select: {
      id: true,
      nome: true,
      role: true,
      foto_url: true,
      celulaId: true
    },
    orderBy: {
      nome: 'asc'
    }
  })
}

export async function getSupervisorStats(userId: string) {
  const supervisedCells = await prisma.cell.findMany({
    where: {
      OR: [
          { supervisorId: userId },
          { supervisor2Id: userId }
      ]
    },
    select: {
      id: true,
      nome: true
    }
  })
  
  return { supervisedCells }
}
