'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'
import { getUser } from '@/lib/auth'

export async function updateCellSettings(cellId: string, data: {
  dia_reuniao: string
  horario: string
  endereco: string
  tesoureiroId: string
  secretarioId: string
  louvorId: string
  eventosId: string
  mcpId: string
  intercessaoId: string
}) {
  try {
    const user = await getUser()
    if (!user) throw new Error('Não autorizado')

    // Buscar estado atual para comparação e verificação de permissão
    const currentCell = await prisma.cell.findUnique({
      where: { id: cellId },
      select: {
        id: true,
        nome: true,
        liderId: true,
        lider2Id: true,
        tesoureiroId: true,
        secretarioId: true,
        louvorId: true,
        eventosId: true,
        mcpId: true,
        intercessorId: true
      }
    })

    if (!currentCell) throw new Error('Célula não encontrada')

    // Verificação de Segurança: Admin, Supervisor ou o Líder daquela célula específica
    const isLiderDaCelula = currentCell.liderId === user.id || currentCell.lider2Id === user.id
    const hasPermission = user.role === 'ADMIN' || user.role === 'SUPERVISOR' || isLiderDaCelula

    if (!hasPermission) {
      throw new Error('Você não tem permissão para editar as configurações desta célula.')
    }

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

    await prisma.cell.update({
      where: { id: cellId },
      data: {
        dia_reuniao: data.dia_reuniao,
        diaSemana: diaSemanaMap[data.dia_reuniao] || null,
        horario: data.horario,
        endereco: data.endereco,
        tesoureiroId: data.tesoureiroId || null,
        secretarioId: data.secretarioId || null,
        louvorId: data.louvorId || null,
        eventosId: data.eventosId || null,
        mcpId: data.mcpId || null,
        intercessorId: data.intercessaoId || null
      }
    })

    // Verificar mudanças e notificar
    if (currentCell) {
      const rolesToCheck = [
        { key: 'tesoureiroId', label: 'Tesoureiro', newVal: data.tesoureiroId },
        { key: 'secretarioId', label: 'Secretário', newVal: data.secretarioId },
        { key: 'louvorId', label: 'Líder de Louvor', newVal: data.louvorId },
        { key: 'eventosId', label: 'Líder de Eventos', newVal: data.eventosId },
        { key: 'mcpId', label: 'Líder do MCP', newVal: data.mcpId },
        { key: 'intercessorId', label: 'Intercessor', newVal: data.intercessaoId } // Note: data key is intercessaoId
      ]

      for (const role of rolesToCheck) {
        // Se há um novo valor, e ele é diferente do antigo (ou antigo era null)
        const oldVal = currentCell[role.key as keyof typeof currentCell]
        const newVal = role.newVal || null

        // Se newVal existe (tem um usuário definido) E é diferente do anterior
        if (newVal && newVal !== oldVal) {
          // Busca o usuário (Member) para garantir que existe e obter dados atualizados se necessário
          // Isso atende ao requisito de verificar o membro antes de notificar
          const memberUser = await prisma.user.findUnique({
             where: { id: newVal },
             select: { id: true, nome: true }
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

    revalidatePath('/app/lideranca')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar configurações da célula:', error)
    return { error: 'Erro ao salvar configurações.' }
  }
}

export async function getCellSettings(cellId: string) {
    try {
        const cell = await prisma.cell.findUnique({
            where: { id: cellId },
            include: {
                membros: {
                    orderBy: { nome: 'asc' }
                },
                lider: {
                    select: { nome: true }
                },
                supervisor: {
                    select: { nome: true }
                }
            }
        })

        if (!cell) return { error: 'Célula não encontrada' }

        return {
            settings: {
                dia_reuniao: cell.dia_reuniao,
                horario: cell.horario,
                endereco: cell.endereco,
                tesoureiroId: cell.tesoureiroId,
                secretarioId: cell.secretarioId,
                louvorId: cell.louvorId,
                eventosId: cell.eventosId,
                mcpId: cell.mcpId,
                intercessaoId: cell.intercessorId
            },
            members: cell.membros.map(m => ({ id: m.id, nome: m.nome })),
            liderNome: cell.lider?.nome || 'Não definido',
            supervisorNome: cell.supervisor?.nome || 'Não definido'
        }
    } catch (error) {
        console.error('Erro ao buscar configurações da célula:', error)
        return { error: 'Erro ao carregar configurações.' }
    }
}
