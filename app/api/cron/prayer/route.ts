import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

export async function GET(request: Request) {
  try {
    // Verificar autorização do Cron da Vercel (opcional mas recomendado)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Buscar usuários ativos
    const users = await prisma.user.findMany({
      where: { ativo: true },
      select: { id: true }
    })

    console.log(`Enviando push de oração para ${users.length} usuários.`)

    // Enviar notificações push
    const results = await Promise.allSettled(
      users.map(u => 
        sendPushToUser(
          u.id,
          "🙏 Momento de Oração",
          "Já tirou um tempo para orar hoje? Veja os motivos da semana!",
          "/app/oracao"
        )
      )
    )

    const sentCount = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({ 
      success: true, 
      sent: sentCount,
      total: users.length 
    })
  } catch (error) {
    console.error('Erro no Cron de Oração:', error)
    return NextResponse.json({ error: 'Falha ao processar cron de oração' }, { status: 500 })
  }
}
