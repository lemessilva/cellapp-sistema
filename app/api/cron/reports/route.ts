import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    const now = new Date()
    const start = startOfWeek(now)
    const end = endOfWeek(now)

    // Buscar líderes cujas células não enviaram o relatório da semana
    // Ou o relatório está em RASCUNHO/ABERTO
    const cellsWithPendingReports = await prisma.cell.findMany({
      where: {
        ativo: true,
        OR: [
          // Não tem relatório para esta semana
          {
            reports: {
              none: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            }
          },
          // Tem relatório mas está em rascunho
          {
            reports: {
              some: {
                createdAt: {
                  gte: start,
                  lte: end
                },
                status: 'RASCUNHO'
              }
            }
          }
        ]
      },
      select: {
        id: true,
        nome: true,
        liderId: true,
        lider2Id: true
      }
    })

    const leadersToNotify = new Set<string>()
    cellsWithPendingReports.forEach(cell => {
      if (cell.liderId) leadersToNotify.add(cell.liderId)
      if (cell.lider2Id) leadersToNotify.add(cell.lider2Id)
    })

    const leadersArray = Array.from(leadersToNotify)
    console.log(`Enviando push de relatório pendente para ${leadersArray.length} líderes.`)

    // Enviar notificações push
    const results = await Promise.allSettled(
      leadersArray.map(leaderId => 
        sendPushToUser(
          leaderId,
          "⏳ Relatório Pendente",
          "Não deixe para a última hora! Feche o relatório da célula desta semana.",
          "/app/celula"
        )
      )
    )

    const sentCount = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({ 
      success: true, 
      sent: sentCount,
      total: leadersArray.length 
    })
  } catch (error) {
    console.error('Erro no Cron de Relatórios:', error)
    return NextResponse.json({ error: 'Falha ao processar cron de relatórios' }, { status: 500 })
  }
}
