'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function generateInvite() {
  const user = await getUser()
  if (!user || !user.celulaLiderada) {
    // Tentar buscar se lidera algo, pois getUser pode não trazer relation deep
    // Mas assumindo que a UI só chama isso se for líder
    // Melhor garantir:
    const dbUser = await prisma.user.findUnique({
      where: { id: user?.id },
      include: { celulaLiderada: true }
    })
    
    if (!dbUser?.celulaLiderada) return { error: 'Você não lidera uma célula.' }
  }

  // Buscar cellId real
  const dbUser = await prisma.user.findUnique({
      where: { id: user?.id },
      include: { celulaLiderada: true }
  })
  
  if (!dbUser?.celulaLiderada) return { error: 'Célula não encontrada.' }

  try {
    const invite = await prisma.invite.create({
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        createdById: dbUser.id,
        cellId: dbUser.celulaLiderada.id
      }
    })
    return { success: true, token: invite.token }
  } catch (e) {
    return { error: 'Erro ao gerar convite.' }
  }
}
