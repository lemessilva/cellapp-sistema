'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  return 'http://localhost:3000'
}

function generateToken() {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sendResetEmail(to: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    console.log('Configuração de email ausente. Link de recuperação:', link)
    return
  }

  const resend = new Resend(apiKey)

  await resend.emails.send({
    from,
    to,
    subject: 'Recuperação de senha - CellApp',
    html: `<p>Você solicitou a redefinição de senha do CellApp.</p><p>Clique no link abaixo para definir uma nova senha:</p><p><a href="${link}">${link}</a></p><p>Se você não solicitou esta ação, ignore este email.</p>`,
  })
}

export async function solicitarReset(email: string) {
  if (!email) {
    return { error: 'Informe um email válido.' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { success: 'Se o email existir, enviaremos instruções de reset.' }
  }

  const token = generateToken()
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: expiresAt,
    },
  })

  const resetLink = `${getBaseUrl()}/resetar-senha?token=${token}`

  await sendResetEmail(user.email || email, resetLink)

  return {
    success: 'Enviamos um link de recuperação para o seu email, se ele estiver cadastrado.',
  }
}

export async function resetarSenha(token: string, novaSenha: string) {
  if (!token || !novaSenha) {
    return { error: 'Token ou nova senha inválidos.' }
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    return { error: 'Token inválido ou expirado.' }
  }

  const hashedPassword = await bcrypt.hash(novaSenha, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return { success: 'Senha redefinida com sucesso. Você já pode fazer login.' }
}

export async function adminResetPassword(userId: string) {
  try {
    const admin = await getUser()
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Acesso negado.' }
    }

    const temporaryPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
    })

    return { success: true, temporaryPassword }
  } catch (error) {
    console.error('Error in adminResetPassword:', error)
    return { error: 'Erro ao resetar senha.' }
  }
}

export async function changePassword(newPassword: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Não autorizado' }
    }

    if (!newPassword || newPassword.length < 6) {
      return { error: 'A senha deve ter pelo menos 6 caracteres.' }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error in changePassword:', error)
    return { error: 'Erro ao alterar senha.' }
  }
}
