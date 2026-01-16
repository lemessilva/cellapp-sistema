'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { compare } from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode('super-secret-key-change-in-prod')

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Preencha todos os campos.' }
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { email } 
        })

        if (!user || !user.password) {
            return { error: 'Credenciais inválidas.' }
        }

        if (!user.ativo) {
            return { error: 'Sua conta está inativa. Procure a administração.' }
        }

        const isValid = await compare(password, user.password)
        if (!isValid) {
            return { error: 'Credenciais inválidas.' }
        }

        // Gerar JWT
        const token = await new SignJWT({ sub: user.id, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(JWT_SECRET)

        // Definir Cookie
        const cookieStore = await cookies()
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
        })

        redirect('/app') // Redirecionar para área logada
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error(error)
        return { error: 'Erro ao fazer login.' }
    }
}
