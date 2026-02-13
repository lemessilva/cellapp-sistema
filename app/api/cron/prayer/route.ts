import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Buscar todos os usuários que possuem ao menos uma PushSubscription ativa
    const usersWithSub = await prisma.user.findMany({
      where: {
        ativo: true,
        pushSubscriptions: {
          some: {}
        }
      },
      select: { id: true }
    })

    console.log(`[CRON-PRAYER] Iniciando envio para ${usersWithSub.length} usuários.`)

    // Disparo não bloqueante
    usersWithSub.forEach(user => {
      sendPushToUser(
        user.id,
        "🙏 Já orou hoje?",
        "Tire 5 minutinhos para orar pelo seu Oikós e pelos motivos da nossa rede!",
        "/app/oracao"
      ).catch(err => console.error(`[CRON-PRAYER] Erro ao enviar para ${user.id}:`, err))
    })

    return NextResponse.json({ 
      success: true, 
      notifiedCount: usersWithSub.length 
    })
  } catch (error) {
    console.error('[CRON-PRAYER] Erro na rota de cron:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
