'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createReportCorrection, handleReturnReport } from '@/app/actions/report'
import { toast } from 'sonner'
import { FileText, Edit, MessageSquare, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Report {
    id: string
    date: Date
    cellName: string | undefined
    leaderName: string | undefined
    status: string
    presentMembers: number
    visitorsCount: number
    hasCorrectionLetter: boolean
}

interface ReportListTableProps {
    reports: Report[]
    userRole: string
    cells?: { id: string, nome: string }[] // For filter
}

export function ReportListTable({ reports, userRole, cells = [] }: ReportListTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const currentTab = searchParams.get('status') || 'ALL'
    const currentMonth = searchParams.get('month') || (new Date().getMonth() + 1).toString()
    const currentYear = searchParams.get('year') || new Date().getFullYear().toString()
    const currentCell = searchParams.get('cellId') || 'all'

    const [correctionOpen, setCorrectionOpen] = useState(false)
    const [returnOpen, setReturnOpen] = useState(false)
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
    const [correctionContent, setCorrectionContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`)
    }

    const handleCorrection = async () => {
        if (!selectedReportId || !correctionContent) return
        setLoading(true)
        const result = await createReportCorrection(selectedReportId, correctionContent)
        setLoading(false)
        
        if (result.success) {
            toast.success('Carta de correção criada com sucesso!')
            setCorrectionOpen(false)
            setCorrectionContent('')
            setSelectedReportId(null)
            router.refresh()
        } else {
            toast.error(result.error || 'Erro ao criar carta.')
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'RASCUNHO': 'bg-gray-100 text-gray-800',
            'ENVIADO_LIDER': 'bg-blue-100 text-blue-800',
            'APROVADO': 'bg-green-100 text-green-800',
            'NAO_HOUVE': 'bg-red-100 text-red-800',
            'EM_ANDAMENTO': 'bg-yellow-100 text-yellow-800',
            'DEVOLVIDO': 'bg-orange-100 text-orange-800'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {status.replace('_', ' ')}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg shadow-sm border">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mês</label>
                    <Select value={currentMonth} onValueChange={(v) => handleFilterChange('month', v)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Ano</label>
                    <Select value={currentYear} onValueChange={(v) => handleFilterChange('year', v)}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {['ADMIN', 'SUPERVISOR', 'COORDENADOR'].includes(userRole) && cells.length > 0 && (
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium text-slate-700">Célula</label>
                        <Select value={currentCell} onValueChange={(v) => handleFilterChange('cellId', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todas as Células" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Células</SelectItem>
                                {cells.map(cell => (
                                    <SelectItem key={cell.id} value={cell.id}>
                                        {cell.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={currentTab} onValueChange={(v) => handleFilterChange('status', v)} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="ALL">Todos</TabsTrigger>
                    <TabsTrigger value="PENDING">Pendentes (Rascunho/Andamento)</TabsTrigger>
                    <TabsTrigger value="ENVIADO_LIDER">Enviados</TabsTrigger>
                    <TabsTrigger value="CORRECTION">Devolvidos</TabsTrigger>
                    <TabsTrigger value="APROVADO">Aprovados</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Célula / Líder</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Presença</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Nenhum relatório encontrado.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {format(new Date(report.date), "dd/MM/yyyy", { locale: ptBR })}
                                            <div className="text-xs text-gray-500 capitalize">
                                                {format(new Date(report.date), "EEEE", { locale: ptBR })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold">{report.cellName || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{report.leaderName || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(report.status)}
                                            {report.hasCorrectionLetter && (
                                                <div className="mt-1 inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">
                                                    <FileText className="w-3 h-3" />
                                                    Carta Anexada
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold">{report.presentMembers}</span>
                                                <span className="text-xs text-gray-500">{report.visitorsCount} visit.</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => router.push(`/app/celula/relatorios/${report.id}/editar`)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Ver/Editar
                                                </Button>

                                                {['ADMIN', 'SUPERVISOR', 'COORDENADOR'].includes(userRole) && 
                                                 ['ENVIADO_LIDER', 'APROVADO'].includes(report.status) && (
                                                    <>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                            onClick={() => {
                                                                setSelectedReportId(report.id)
                                                                setCorrectionOpen(true)
                                                            }}
                                                        >
                                                            <MessageSquare className="w-4 h-4 mr-1" />
                                                            Carta
                                                        </Button>

                                                        {report.status === 'ENVIADO_LIDER' && (
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedReportId(report.id)
                                                                    setReturnOpen(true)
                                                                }}
                                                            >
                                                                Devolver
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Correction Letter Dialog */}
            <Dialog open={correctionOpen} onOpenChange={setCorrectionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Carta de Correção</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm text-gray-500 mb-2 block">
                            Descreva as correções necessárias ou observações para este relatório já enviado.
                            Esta carta ficará anexada ao histórico do relatório.
                        </label>
                        <Textarea 
                            value={correctionContent}
                            onChange={(e) => setCorrectionContent(e.target.value)}
                            placeholder="Ex: O valor da oferta declarado não confere com o comprovante..."
                            className="h-32"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCorrectionOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCorrection} disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Carta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Report Dialog */}
            <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Devolver Relatório</DialogTitle>
                    </DialogHeader>
                    <form 
                        action={async (formData) => {
                            setLoading(true)
                            const res = await handleReturnReport(formData)
                            setLoading(false)
                            if(res?.error) toast.error(res.error)
                            else { 
                                toast.success('Relatório devolvido!')
                                setReturnOpen(false)
                                router.refresh()
                            }
                        }}
                        className="space-y-4 py-4"
                    >
                        <input type="hidden" name="reportId" value={selectedReportId || ''} />
                        <div>
                            <label className="text-sm font-medium mb-1 block">Motivo da Devolução</label>
                            <Textarea name="reason" placeholder="Ex: Valor incorreto..." required />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Print/Imagem (Opcional)</label>
                            <Input type="file" name="file" accept="image/*" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setReturnOpen(false)}>Cancelar</Button>
                            <Button type="submit" variant="destructive" disabled={loading}>
                                {loading ? 'Enviando...' : 'Confirmar Devolução'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
