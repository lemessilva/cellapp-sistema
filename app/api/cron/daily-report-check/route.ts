import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/app/actions/notifications'

export async function GET(request: Request) {
  try {
    // Basic security check (if using Vercel Cron, check CRON_SECRET)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // getDay() returns 0 (Sunday) to 6 (Saturday)
    const yesterdayIndex = yesterday.getDay()
    
    const daysMap = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']
    const yesterdayString = daysMap[yesterdayIndex]

    // Find cells that met yesterday
    const cells = await prisma.cell.findMany({
      where: {
        diaSemana: yesterdayString,
        liderId: { not: null }
      },
      select: {
        id: true,
        nome: true,
        liderId: true
      }
    })

    console.log(`Checking reports for ${cells.length} cells that met on ${yesterdayString}`)

    let notificationsSent = 0

    for (const cell of cells) {
      if (!cell.liderId) continue

      // Check if report already exists for that date (optional, but good to avoid spam if already filled)
      // Assuming we want to remind them regardless, or only if missing.
      // User request: "Verifique se hoje é o dia seguinte a uma reunião de célula. Msg: O relatório ... já está liberado"
      // It implies just notifying availability.

      await sendNotification({
        userId: cell.liderId,
        title: "Hora do Relatório! 📝",
        message: "O relatório da célula de ontem já está liberado para preenchimento.",
        type: 'REPORT',
        link: `/relatorios/novo?date=${yesterday.toISOString().split('T')[0]}`,
        metaData: { cellId: cell.id, date: yesterday }
      })
      notificationsSent++
    }

    return NextResponse.json({ success: true, notificationsSent })
  } catch (error) {
    console.error('Cron job error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
