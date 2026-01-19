'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { geocodeAddress } from './roster'

import { uploadFile } from '@/lib/supabase'

function safeDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
}

export async function updateProfile(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Não autorizado.' }
    
    const userId = formData.get('userId') as string
    
    // Fallback: se não vier no form, usa o da sessão (segurança)
    const targetId = userId || user.id

    // Se tentar editar outro user e não for ADMIN, bloqueia
    if (user.id !== targetId && user.role !== 'ADMIN') {
        return { error: 'Não autorizado.' }
    }

    const photoFile = formData.get('foto_url') as File | null
    let foto_url = undefined

    if (photoFile && photoFile.size > 0) {
      const url = await uploadFile(photoFile, 'uploads')
      if (url) foto_url = url
    }

    const data_nascimento = formData.get('data_nascimento') as string
    const whatsapp = formData.get('whatsapp') as string
    const sexo = formData.get('sexo') as string
    const naturalidade = formData.get('naturalidade') as string
    const ufNascimento = formData.get('ufNascimento') as string
    const escolaridade = formData.get('escolaridade') as string
    const profissao = formData.get('profissao') as string
    const cep = formData.get('cep') as string
    const endereco = formData.get('endereco') as string
    const numero = formData.get('numero') as string
    const bairro = formData.get('bairro') as string
    const cidade = formData.get('cidade') as string
    const estado = formData.get('estado') as string
    const pontoReferencia = formData.get('pontoReferencia') as string
    const nomePai = formData.get('nomePai') as string
    const nomeMae = formData.get('nomeMae') as string
    const estadoCivil = formData.get('estadoCivil') as string
    const nomeConjuge = formData.get('nomeConjuge') as string
    const dataConversao = formData.get('dataConversao') as string
    const igrejaAnterior = formData.get('igrejaAnterior') as string

    // Parse Dates Safely
    const dateNasc = safeDate(data_nascimento)
    const dateConv = safeDate(dataConversao)

    // Geocoding Logic
    let latitude = null
    let longitude = null

    if (endereco && numero && bairro) {
        const fullAddress = `${endereco}, ${numero} - ${bairro}, ${cidade || ''}`
        const geo = await geocodeAddress(fullAddress)
        if (geo) {
            latitude = geo.lat
            longitude = geo.lon
        }
    }

    await prisma.user.update({
      where: { id: targetId },
      data: {
        nome: formData.get('nome') as string,
        telefone: formData.get('telefone') as string,
        endereco: endereco,
        
        data_nascimento: dateNasc,
        dataNascimento: dateNasc,
        
        whatsapp: whatsapp || null,
        sexo: sexo || null,
        genero: sexo || null,
        naturalidade: naturalidade || null,
        ufNascimento: ufNascimento || null,
        escolaridade: escolaridade || null,
        profissao: profissao || null,
        
        cep: cep || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        pontoReferencia: pontoReferencia || null,
        
        latitude: latitude,
        longitude: longitude,
        
        nomePai: nomePai || null,
        nomeMae: nomeMae || null,
        estadoCivil: estadoCivil || null,
        estado_civil: estadoCivil || null,
        nomeConjuge: nomeConjuge || null,
        conjuge_nome: nomeConjuge || null,
        
        dataConversao: dateConv,
        igrejaAnterior: igrejaAnterior || null,
        
        ...(foto_url && { foto_url })
      }
    })
    
    revalidatePath('/app/perfil')
    return { success: true }
  } catch (e) {
    console.error('Update Profile Error:', e)
    return { error: 'Erro ao atualizar perfil. Verifique os dados.' }
  }
}

export async function addOikos(name: string) {
  const user = await getUser()
  if (!user) return { error: 'Não autorizado.' }

  try {
    await prisma.oikos.create({
      data: {
        nome: name,
        userId: user.id
      }
    })
    revalidatePath('/app/perfil')
    revalidatePath('/app/oracao')
    return { success: true }
  } catch (e) {
    return { error: 'Erro ao adicionar Oikos.' }
  }
}

export async function removeOikos(id: string) {
  const user = await getUser()
  if (!user) return { error: 'Não autorizado.' }

  try {
    // Garantir que o oikos pertence ao usuário
    const oikos = await prisma.oikos.findUnique({ where: { id } })
    if (!oikos || oikos.userId !== user.id) return { error: 'Não encontrado.' }

    await prisma.oikos.delete({ where: { id } })
    revalidatePath('/app/perfil')
    revalidatePath('/app/oracao')
    return { success: true }
  } catch (e) {
    return { error: 'Erro ao remover Oikos.' }
  }
}
