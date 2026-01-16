'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { hash } from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode('super-secret-key-change-in-prod')

async function hashPassword(password: string) {
    return hash(password, 10)
}

export async function validateInviteToken(token: string) {
    const invite = await prisma.invite.findUnique({
        where: { token },
        include: { cell: true }
    })

    if (!invite) return { error: 'Convite não encontrado.' }
    if (invite.used) return { error: 'Este convite já foi utilizado.' }
    if (invite.expiresAt < new Date()) return { error: 'Este convite expirou.' }

    return { success: true, invite }
}

export async function registerUser(formData: FormData) {
    const token = formData.get('token') as string
    const nome = formData.get('nome') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const telefone = formData.get('telefone') as string

    // Revalidar token para garantir segurança
    const validation = await validateInviteToken(token)
    if (validation.error || !validation.invite) {
        return { error: validation.error || 'Erro na validação do convite.' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Criar Usuário
            const user = await tx.user.create({
                data: {
                    nome,
                    email,
                    password: await hashPassword(password),
                    telefone,
                    role: 'MEMBRO',
                    celula: {
                        connect: { id: validation.invite.cellId }
                    },
                    dados_completos: false // Força onboarding depois
                }
            })

            // 2. Marcar convite como usado
            await tx.invite.update({
                where: { id: validation.invite.id },
                data: { used: true }
            })
        })
    } catch (e) {
        console.error(e)
        return { error: 'Erro ao criar conta. Email pode já estar em uso.' }
    }

    redirect('/login?registered=true')
}
