'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function createMember(formData: FormData) {
  const user = await getUser()
  if (!user || !['LIDER', 'SUPERVISOR', 'ADMIN'].includes(user.role)) {
    return { error: 'Acesso negado.' }
  }

  // Determine cell ID
  let cellId = user.celulaLiderada?.id
  if (!cellId) {
     const dbUser = await prisma.user.findUnique({
         where: { id: user.id },
         include: { celulaLiderada: true }
     })
     cellId = dbUser?.celulaLiderada?.id
  }

  if (!cellId) {
      return { error: 'Você não lidera uma célula ativa.' }
  }

  const isChild = formData.get('isChild') === 'true'
  const nome = formData.get('nome') as string
  const dataNascimentoStr = formData.get('dataNascimento') as string
  const genero = formData.get('genero') as string
  const dataBatismoStr = formData.get('dataBatismo') as string
  
  const responsavelId = formData.get('responsavelId') as string || undefined
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string

  if (!nome) return { error: 'Nome é obrigatório.' }

  if (!isChild) {
      if (!email) return { error: 'Email é obrigatório para adultos.' }
      if (!telefone) return { error: 'Telefone é obrigatório para adultos.' }
  }

  try {
    await prisma.user.create({
      data: {
        nome,
        categoria: isChild ? 'CRIANCA' : 'ADULTO',
        celulaId: cellId,
        role: 'MEMBRO',
        
        // Parsing dates ensuring they are valid objects or null
        data_nascimento: dataNascimentoStr ? new Date(dataNascimentoStr) : null,
        genero: genero || null,
        data_batismo: dataBatismoStr ? new Date(dataBatismoStr) : null,
        
        responsavelId: isChild ? responsavelId : null,
        
        // Email must be unique. If empty string (from form), treat as null to avoid uniqueness violation?
        // But for adults we require it.
        email: !isChild && email ? email : null, 
        telefone: !isChild && telefone ? telefone : null,
        
        // Password is null by default, so they can't login until they recover password or we set one.
        // Assuming this is acceptable for "Manual Registration".
      }
    })

    revalidatePath('/app/lideranca')
    return { success: true }
  } catch (e: any) {
    console.error(e)
    if (e.code === 'P2002') {
        return { error: 'Este email já está cadastrado.' }
    }
    return { error: 'Erro ao cadastrar membro.' }
  }
}

export async function updateMemberCell(userId: string, newCellId: string) {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    return { error: 'Acesso negado.' }
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return { error: 'Usuário não encontrado.' }

    let cellName = 'Sem Célula'
    if (newCellId !== 'none') {
        const cell = await prisma.cell.findUnique({ where: { id: newCellId } })
        if (cell) cellName = cell.nome
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        celulaId: newCellId === 'none' ? null : newCellId
      }
    })

    // Notification
    if (newCellId !== 'none') {
        await sendNotification({
            userId: userId,
            title: "Casa Nova! 🏡",
            message: `Você foi adicionado à Célula ${cellName}. Seja bem-vindo à família!`,
            type: "CELL",
            link: "/app/celula",
            metaData: { cellId: newCellId }
        })
    }

    revalidatePath('/admin/membros')
    return { success: true }
  } catch (error) {
    console.error('Error updating member cell:', error)
    return { error: 'Erro ao atualizar célula do membro.' }
  }
}

export async function getMemberAttendanceHistory(memberId: string) {
  const user = await getUser()
  if (!user) return { error: 'Não autorizado' }
  
  try {
    const attendance = await prisma.meetingAttendance.findMany({
      where: { userId: memberId },
      include: {
        report: {
          select: {
            date: true,
            studyTheme: true
          }
        }
      },
      orderBy: {
        report: {
          date: 'desc'
        }
      }
    })
    
    return { data: attendance }
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return { error: 'Erro ao buscar histórico.' }
  }
}
