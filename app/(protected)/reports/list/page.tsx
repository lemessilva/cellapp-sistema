import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getReportsList } from '@/app/actions/report'
import { ReportListTable } from '@/components/reports/ReportListTable'
import { redirect } from 'next/navigation'

export default async function ReportListPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const user = await getUser()
    if (!user) redirect('/login')

    const { status: statusParam, month: monthParam, year: yearParam, cellId: cellIdParam } = await searchParams

    const status = typeof statusParam === 'string' ? statusParam : undefined
    const monthStr = typeof monthParam === 'string' ? monthParam : (new Date().getMonth() + 1).toString()
    const yearStr = typeof yearParam === 'string' ? yearParam : new Date().getFullYear().toString()
    const cellId = typeof cellIdParam === 'string' ? cellIdParam : undefined

    const month = parseInt(monthStr)
    const year = parseInt(yearStr)

    const reports = await getReportsList({
        status,
        month,
        year,
        cellId
    })

    // Fetch cells for filter if admin/supervisor
    let cells: { id: string, nome: string }[] = []
    if (['ADMIN', 'SUPERVISOR', 'COORDENADOR'].includes(user.role)) {
        if (user.role === 'ADMIN') {
             cells = await prisma.cell.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } })
        } else {
             cells = await prisma.cell.findMany({
                 where: { OR: [{ supervisorId: user.id }, { supervisor2Id: user.id }] },
                 select: { id: true, nome: true },
                 orderBy: { nome: 'asc' }
             })
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Relatórios de Célula</h1>
            <ReportListTable 
                reports={reports} 
                userRole={user.role} 
                cells={cells}
            />
        </div>
    )
}
