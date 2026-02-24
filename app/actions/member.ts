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
  let cellId = (user.celulaLiderada && user.celulaLiderada.length > 0) 
    ? user.celulaLiderada[0].id 
    : (user.celulaLiderada2 && user.celulaLiderada2.length > 0)
      ? user.celulaLiderada2[0].id
      : undefined

  if (!cellId) {
     const dbUser = await prisma.user.findUnique({
         where: { id: user.id },
         include: { celulaLiderada: true, celulaLiderada2: true }
     })
     cellId = (dbUser?.celulaLiderada && dbUser.celulaLiderada.length > 0)
        ? dbUser.celulaLiderada[0].id
        : (dbUser?.celulaLiderada2 && dbUser.celulaLiderada2.length > 0)
            ? dbUser.celulaLiderada2[0].id
            : undefined
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
  const motherId = (formData.get('motherId') as string) || undefined
  const fatherId = (formData.get('fatherId') as string) || undefined
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const funcoes = formData.get('funcoes') as string

  if (!nome) return { error: 'Nome é obrigatório.' }

  if (!isChild) {
      if (!email) return { error: 'Email é obrigatório para adultos.' }
      if (!telefone) return { error: 'Telefone é obrigatório para adultos.' }
  }

  try {
    // Herança de endereço dos pais
    let inheritedAddress: any = {}
    try {
      const parentSourceId = motherId || fatherId || responsavelId
      if (parentSourceId) {
        const parent = await prisma.user.findUnique({ where: { id: parentSourceId } })
        if (parent) {
          inheritedAddress = {
            endereco: parent.endereco || null,
            numero: parent.numero || null,
            bairro: parent.bairro || null,
            cidade: parent.cidade || null,
            estado: parent.estado || null,
            cep: parent.cep || null,
          }
        }
      }
    } catch {}

    await prisma.user.create({
      data: {
        nome,
        categoria: isChild ? 'CRIANCA' : 'ADULTO',
        celulaId: cellId,
        role: 'MEMBRO',
        funcoes: funcoes || null,
        
        // Parsing dates ensuring they are valid objects or null
        data_nascimento: dataNascimentoStr ? new Date(dataNascimentoStr) : null,
        genero: genero || null,
        data_batismo: dataBatismoStr ? new Date(dataBatismoStr) : null,
        
        parentId: isChild ? (motherId || fatherId || responsavelId) : null,
        responsavelId: isChild ? (responsavelId || motherId || fatherId) : null,
        motherId: isChild ? motherId || null : null,
        fatherId: isChild ? fatherId || null : null,
        
        // Email must be unique. If empty string (from form), treat as null to avoid uniqueness violation?
        // But for adults we require it.
        email: !isChild && email ? email : null, 
        telefone: !isChild && telefone ? telefone : null,

        // Endereço herdado dos pais
        ...inheritedAddress,
        
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

export async function getMemberForPdf(memberId: string) {
  const user = await getUser()
  if (!user || !['ADMIN', 'SUPERVISOR', 'LIDER'].includes(user.role)) {
    return { error: 'Acesso negado.' }
  }

  try {
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      include: {
        celula: {
          include: {
            lider: true,
          }
        },
        parent: true,
        responsavel: true,
        children: true,
      }
    })

    if (!member) return { error: 'Membro não encontrado.' }
    return { data: member }
  } catch (error) {
    console.error('Erro ao buscar dados completos do membro:', error)
    return { error: 'Erro ao buscar dados do membro.' }
  }
}
