import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ReportForm } from '@/components/reports/ReportForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { ReportActions } from '@/components/reports/ReportActions'

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUser()
    if (!user) redirect('/login')

    const report = await prisma.meetingReport.findUnique({
        where: { id },
        include: {
            attendance: true,
            visitors: true,
            kidsPillars: true,
            corrections: {
                include: { author: { select: { nome: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!report) {
        return <div>Relatório não encontrado.</div>
    }

    const cellId = report.cellId
    const members = await prisma.user.findMany({
        where: { celulaId: cellId, ativo: true },
        orderBy: { nome: 'asc' }
    })

    const adults = members.filter(m => m.categoria === 'ADULTO')
    const kids = members.filter(m => m.categoria === 'CRIANCA')

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Relatório de {new Date(report.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </h1>
                <p className="text-slate-500">
                    Status: <span className="font-medium text-slate-700">{report.status}</span>
                </p>
            </div>

            <Tabs defaultValue="report" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="report">Formulário</TabsTrigger>
                    <TabsTrigger value="corrections" className="relative">
                        Correções
                        {report.corrections.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {report.corrections.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="report">
                    <ReportForm 
                        cellId={cellId}
                        adults={adults}
                        kids={kids}
                        initialDate={new Date(report.date).toISOString().split('T')[0]}
                        initialReport={report}
                        readonly={report.status === 'APROVADO'} 
                    />
                </TabsContent>

                <TabsContent value="corrections">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Correções</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {report.corrections.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-100 mb-2" />
                                    <p>Nenhuma carta de correção para este relatório.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {report.corrections.map((correction) => (
                                        <div key={correction.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-red-900">
                                                    {correction.author?.nome || 'Sistema'}
                                                </div>
                                                <div className="text-xs text-red-700">
                                                    {new Date(correction.createdAt).toLocaleString('pt-BR')}
                                                </div>
                                            </div>
                                            <p className="text-red-800 text-sm whitespace-pre-wrap">
                                                {correction.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {report.returnReason && (
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                        Motivo de Devolução (Anterior)
                                    </h4>
                                    <div className="bg-orange-50 p-3 rounded text-orange-800 text-sm">
                                        {report.returnReason}
                                    </div>
                                    {report.returnImageUrl && (
                                        <div className="mt-2">
                                            <a href={report.returnImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                                                Ver Print Anexado
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
