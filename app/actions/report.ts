'use server'

import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { ReportStatus } from '@prisma/client'
import { sendNotification } from './notifications'
import { revalidatePath } from 'next/cache'
import { uploadToMidiaBucket } from '@/lib/supabase'

// --- Correction Flow Actions ---

export async function handleReturnReport(formData: FormData) {
    const reportId = formData.get('reportId') as string
    const reason = formData.get('reason') as string
    const file = formData.get('file') as File | null

    if (!reportId || !reason) {
        return { error: 'ID e Motivo são obrigatórios.' }
    }

    let imageUrl = undefined
    if (file && file.size > 0) {
        try {
            const uploadedUrl = await uploadToMidiaBucket(file)
            if (!uploadedUrl) return { error: 'Falha no upload da imagem.' }
            imageUrl = uploadedUrl
        } catch (error) {
            console.error('Upload error:', error)
            return { error: 'Erro ao fazer upload da imagem.' }
        }
    }

    return await returnReport(reportId, reason, imageUrl)
}

export async function returnReport(reportId: string, reason: string, imageUrl?: string) {
    try {
        const user = await getUser()
        // Allow LIDER, SUPERVISOR, COORDENADOR, ADMIN
        if (!user || !['LIDER', 'SUPERVISOR', 'COORDENADOR', 'ADMIN'].includes(user.role)) {
            return { error: 'Sem permissão para devolver relatórios.' }
        }

        const report = await prisma.meetingReport.findUnique({
            where: { id: reportId },
            include: { cell: true }
        })

        if (!report) return { error: 'Relatório não encontrado.' }

        // Update Report
        await prisma.meetingReport.update({
            where: { id: reportId },
            data: {
                status: ReportStatus.DEVOLVIDO,
                returnReason: reason,
                returnImageUrl: imageUrl
            }
        })

        // Notify Secretary or Leader
        const targetUserId = report.cell.secretarioId || report.cell.liderId
        if (targetUserId) {
            await sendNotification({
                userId: targetUserId,
                title: 'Relatório Devolvido',
                message: `O relatório de ${report.date.toLocaleDateString('pt-BR')} foi devolvido para correção. Motivo: ${reason}`,
                type: 'ALERT',
                link: `/app/celula/relatorios/${report.id}/editar` // Adjust link as needed
            })
        }

        revalidatePath('/app/celula/relatorios')
        return { success: true }
    } catch (error) {
        console.error('Error returning report:', error)
        return { error: 'Erro ao devolver relatório.' }
    }
}

export async function createReportCorrection(reportId: string, content: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Não autorizado.' }

        await prisma.reportCorrection.create({
            data: {
                reportId,
                authorId: user.id,
                content
            }
        })

        revalidatePath(`/app/celula/relatorios/${reportId}`)
        return { success: true }
    } catch (error) {
        console.error('Error creating correction letter:', error)
        return { error: 'Erro ao criar carta de correção.' }
    }
}

export async function getReportsList(
    filters: {
        status?: string,
        month?: number,
        year?: number,
        cellId?: string
    }
) {
    const user = await getUser()
    if (!user) return []

    const where: any = {}

    // Role Filter
    if (user.role === 'ADMIN') {
        if (filters.cellId && filters.cellId !== 'all') where.cellId = filters.cellId
    } else if (user.role === 'SUPERVISOR') {
        // Find cells supervised
        const cells = await prisma.cell.findMany({
            where: { OR: [{ supervisorId: user.id }, { supervisor2Id: user.id }] },
            select: { id: true }
        })
        const cellIds = cells.map(c => c.id)
        if (filters.cellId && filters.cellId !== 'all') {
            if (cellIds.includes(filters.cellId)) where.cellId = filters.cellId
            else where.cellId = 'none' // Security check
        } else {
            where.cellId = { in: cellIds }
        }
    } else {
        // Lider/Member/Secretary
        // Check if user is Lider, Lider2 or Secretary of the cell
        // Simplest: use user.celulaId. But leaders might have cellId set.
        // Or query cell where liderId = user.id
        
        // Robust check:
        const myCells = await prisma.cell.findMany({
            where: {
                OR: [
                    { liderId: user.id },
                    { lider2Id: user.id },
                    { secretarioId: user.id },
                    { membros: { some: { id: user.id } } }
                ]
            },
            select: { id: true }
        })
        const myCellIds = myCells.map(c => c.id)
        
        if (myCellIds.length === 0) return []
        
        if (filters.cellId && filters.cellId !== 'all') {
             if (myCellIds.includes(filters.cellId)) where.cellId = filters.cellId
             else where.cellId = 'none'
        } else {
            where.cellId = { in: myCellIds }
        }
    }

    // Status Filter (Tabs)
    if (filters.status === 'PENDING') {
        where.status = { in: ['RASCUNHO', 'EM_ANDAMENTO'] }
    } else if (filters.status === 'CORRECTION') {
        where.status = 'DEVOLVIDO'
    } else if (filters.status && filters.status !== 'ALL') {
        where.status = filters.status
    }

    // Date Filter
    if (filters.month && filters.year) {
        const start = new Date(filters.year, filters.month - 1, 1)
        const end = new Date(filters.year, filters.month, 0, 23, 59, 59)
        where.date = { gte: start, lte: end }
    }

    try {
        const reports = await prisma.meetingReport.findMany({
            where,
            include: {
                cell: { select: { nome: true, lider: { select: { nome: true } } } },
                corrections: { orderBy: { createdAt: 'desc' }, take: 1 }
            },
            orderBy: { date: 'desc' }
        })

        return reports.map(r => ({
            id: r.id,
            date: r.date,
            cellName: r.cell?.nome,
            leaderName: r.cell?.lider?.nome,
            status: r.status,
            presentMembers: r.presentMembers,
            visitorsCount: r.visitorsCount,
            hasCorrectionLetter: r.corrections.length > 0
        }))
    } catch (error) {
        console.error('Error fetching reports list:', error)
        return []
    }
}

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
