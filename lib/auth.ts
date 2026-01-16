import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode('super-secret-key-change-in-prod')

export async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) return null

    try {
        const { payload } = await jwtVerify(token.value, JWT_SECRET)
        
        if (!payload.sub) return null

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            include: { 
                oikos: true, 
                celulaLiderada: { 
                    include: { 
                        membros: { where: { ativo: true } } 
                    } 
                },
                celula: { 
                    include: { 
                        membros: { where: { ativo: true } },
                        lider: true 
                    } 
                }
            }
        })
        
        if (!user || !user.ativo) {
            return null
        }

        return user
    } catch (error) {
        console.error('Auth error:', error)
        return null
    }
}
