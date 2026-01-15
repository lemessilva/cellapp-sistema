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
  const data_nascimento = formData.get('data_nascimento') as string // Input type="date"
  const sexo = formData.get('sexo') as string
  const naturalidade = formData.get('naturalidade') as string
  const ufNascimento = formData.get('ufNascimento') as string
  
  const endereco = formData.get('endereco') as string
  const numero = formData.get('numero') as string
  const bairro = formData.get('bairro') as string
  const cep = formData.get('cep') as string
  const pontoReferencia = formData.get('pontoReferencia') as string
  
  const nomePai = formData.get('nomePai') as string
  const nomeMae = formData.get('nomeMae') as string
  const estadoCivil = formData.get('estadoCivil') as string
  const nomeConjuge = formData.get('nomeConjuge') as string
  
  const escolaridade = formData.get('escolaridade') as string
  const profissao = formData.get('profissao') as string
  const dataConversao = formData.get('dataConversao') as string
  const dataBatismo = formData.get('dataBatismo') as string
  const igrejaAnterior = formData.get('igrejaAnterior') as string

  const oikos1 = formData.get('oikos1') as string
  const oikos2 = formData.get('oikos2') as string

  if (!nome || !telefone || !data_nascimento) {
    return { error: 'Preencha os campos obrigatórios básicos.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Update User
      await tx.user.update({
        where: { id: user.id },
        data: {
          nome,
          telefone,
          // Atualiza tanto os campos antigos quanto os novos para compatibilidade
          data_nascimento: new Date(data_nascimento),
          dataNascimento: new Date(data_nascimento),
          
          whatsapp: telefone, // Assumindo mesmo número, ou poderia ter campo separado
          sexo,
          naturalidade,
          ufNascimento,
          
          endereco,
          numero,
          bairro,
          cep,
          pontoReferencia,
          
          nomePai,
          nomeMae,
          estadoCivil,
          estado_civil: estadoCivil, // Compatibilidade
          nomeConjuge,
          conjuge_nome: nomeConjuge, // Compatibilidade
          
          escolaridade,
          profissao,
          
          dataConversao: dataConversao ? new Date(dataConversao) : null,
          data_batismo: dataBatismo ? new Date(dataBatismo) : null,
          igrejaAnterior,
          
          dados_completos: true
        }
      })

      // Create Oikos (apenas se preenchido)
      const oikosData = []
      if (oikos1) oikosData.push({ nome: oikos1, userId: user.id })
      if (oikos2) oikosData.push({ nome: oikos2, userId: user.id })

      if (oikosData.length > 0) {
        await tx.oikos.createMany({
          data: oikosData
        })
      }
    })
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao salvar dados.' }
  }

  redirect('/app')
}
