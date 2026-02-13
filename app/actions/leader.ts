'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function generateInvite() {
  const user = await getUser()
  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { celulaLiderada: true, celulaLiderada2: true }
  })
  
  const targetCell = (dbUser?.celulaLiderada && dbUser.celulaLiderada.length > 0) 
    ? dbUser.celulaLiderada[0] 
    : (dbUser?.celulaLiderada2 && dbUser.celulaLiderada2.length > 0)
      ? dbUser.celulaLiderada2[0]
      : null

  if (!dbUser || !targetCell) return { error: 'Você não lidera uma célula.' }

  try {
    const invite = await prisma.invite.create({
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        createdById: dbUser.id,
        cellId: targetCell.id
      }
    })
    return { success: true, token: invite.token }
  } catch (e) {
    return { error: 'Erro ao gerar convite.' }
  }
}
