import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'
import { NextResponse } from 'next/server'
import { startOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 1. Buscar todos os líderes ativos
    const leaders = await prisma.user.findMany({
      where: {
        role: 'LIDER',
        ativo: true
      },
      select: { 
        id: true,
        celulaLiderada: {
          select: { id: true }
        }
      }
    })

    const now = new Date()
    const start = startOfWeek(now, { locale: ptBR })
    const end = endOfWeek(now, { locale: ptBR })

    console.log(`[CRON-REPORTS] Verificando relatórios para ${leaders.length} líderes.`)

    let notifiedCount = 0

    // 2. Verificar quem ainda não enviou relatório na semana atual
    for (const leader of leaders) {
      const cellIds = leader.celulaLiderada.map(c => c.id)
      
      if (cellIds.length === 0) continue

      const reportSent = await prisma.meetingReport.findFirst({
        where: {
          cellId: { in: cellIds },
          date: { gte: start, lte: end },
          status: { in: ['ENVIADO_LIDER', 'APROVADO'] }
        }
      })

      if (!reportSent) {
        sendPushToUser(
          leader.id,
          "⏳ Lembrete de Relatório",
          "Domingou! Não esqueça de preencher e enviar o relatório da sua célula de hoje.",
          "/app/celula/relatorios"
        ).catch(err => console.error(`[CRON-REPORTS] Erro ao enviar para ${leader.id}:`, err))
        notifiedCount++
      }
    }

    return NextResponse.json({ 
      success: true, 
      notifiedCount 
    })
  } catch (error) {
    console.error('[CRON-REPORTS] Erro na rota de cron:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
