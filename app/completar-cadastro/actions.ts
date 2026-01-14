'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'

export async function completeRegistration(formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string
  const data_nascimento = formData.get('data_nascimento') as string
  const oikos1 = formData.get('oikos1') as string
  const oikos2 = formData.get('oikos2') as string

  if (!nome || !telefone || !data_nascimento || !oikos1 || !oikos2) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Update User
      await tx.user.update({
        where: { id: user.id },
        data: {
          nome,
          telefone,
          data_nascimento: new Date(data_nascimento),
          dados_completos: true
        }
      })

      // Create Oikos
      await tx.oikos.createMany({
        data: [
          { nome: oikos1, userId: user.id },
          { nome: oikos2, userId: user.id }
        ]
      })
    })
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao salvar dados.' }
  }

  redirect('/app')
}
