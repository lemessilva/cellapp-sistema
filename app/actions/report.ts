'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function getPrayerReportData(targetUserId?: string) {
  try {
    const currentUser = await getUser()
    if (!currentUser) {
        console.error('[PDF Report] Unauthorized access attempt')
        return { error: 'Unauthorized' }
    }

    let userIdToFetch = currentUser.id
    let userNameToFetch = currentUser.nome
    let cellIdToFetch = currentUser.celulaId

    // If Admin requests another user
    if (targetUserId && targetUserId !== currentUser.id) {
        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERVISOR' && currentUser.role !== 'LIDER') {
            console.error('[PDF Report] Forbidden access to target user', targetUserId)
            return { error: 'Forbidden' }
        }
        // Fetch target user details
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, nome: true, celulaId: true }
        })
        
        if (!targetUser) {
            console.error('[PDF Report] Target user not found', targetUserId)
            return { error: 'User not found' }
        }
        
        userIdToFetch = targetUser.id
        userNameToFetch = targetUser.nome
        cellIdToFetch = targetUser.celulaId
    }

    console.log(`[PDF Report] Generating for User: ${userNameToFetch} (${userIdToFetch})`)

    const year = new Date().getFullYear()
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59)

    // Fetch Prayer Logs
    const logs = await prisma.prayerLog.findMany({
        where: {
        userId: userIdToFetch,
        createdAt: {
            gte: startOfYear,
            lte: endOfYear
        }
        },
        select: {
        createdAt: true
        }
    })

    console.log(`[PDF Report] Logs found: ${logs.length}`)

    // Fetch Cell Details with all leaders/supervisors
    let cellData = null
    let leaders = 'N/A'
    let supervisors = 'N/A'

    if (cellIdToFetch) {
        console.log(`[PDF Report] Fetching Cell Data: ${cellIdToFetch}`)
        cellData = await prisma.cell.findUnique({
            where: { id: cellIdToFetch },
            include: {
                lider: { select: { nome: true } },
                lider2: { select: { nome: true } },
                supervisor: { select: { nome: true } },
                supervisor2: { select: { nome: true } },
            }
        })

        if (cellData) {
            const l1 = cellData.lider?.nome
            const l2 = cellData.lider2?.nome
            leaders = [l1, l2].filter(Boolean).join(' & ') || 'N/A'

            const s1 = cellData.supervisor?.nome
            const s2 = cellData.supervisor2?.nome
            supervisors = [s1, s2].filter(Boolean).join(' & ') || 'N/A'
        }
    } else {
        console.log('[PDF Report] User has no cell assigned')
    }

    return {
        data: {
        memberName: userNameToFetch || 'Membro',
        year,
        cellName: cellData?.nome || 'Sem Célula',
        leaders,
        supervisors,
        prayedDates: logs.map(l => l.createdAt.toISOString())
        }
    }
  } catch (error) {
    console.error('CRITICAL ERROR generating PDF Report:', error)
    // Ensure we return a serializable error object, not the raw error
    return { error: 'Erro interno ao gerar relatório. Consulte o log do servidor.' }
  }
}
