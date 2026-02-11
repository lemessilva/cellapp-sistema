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
import { FileText, Edit, MessageSquare, Filter, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format as formatDate, isSameDay } from 'date-fns'

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
            'RASCUNHO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'ENVIADO_LIDER': 'bg-blue-100 text-blue-800 border-blue-200',
            'APROVADO': 'bg-green-100 text-green-800 border-green-200',
            'NAO_HOUVE': 'bg-red-100 text-red-800 border-red-200',
            'EM_ANDAMENTO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'DEVOLVIDO': 'bg-orange-100 text-orange-800 border-orange-200'
        }
        
        const labels: Record<string, string> = {
            'RASCUNHO': 'Rascunho',
            'ENVIADO_LIDER': 'Enviado',
            'APROVADO': 'Aprovado',
            'NAO_HOUVE': 'Não Houve',
            'EM_ANDAMENTO': 'Em Andamento',
            'DEVOLVIDO': 'Devolvido'
        }

        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[status] || 'bg-gray-100 border-gray-200 text-gray-800'}`}>
                {labels[status] || status.replace('_', ' ')}
            </span>
        )
    }

    // Logic to generate weeks for the selected month/year
    const generateWeeks = () => {
        const monthIdx = parseInt(currentMonth) - 1
        const yearNum = parseInt(currentYear)
        const start = startOfMonth(new Date(yearNum, monthIdx))
        const end = endOfMonth(start)
        
        // Let's assume meetings are on Wednesdays if we don't have cell info here.
        // Actually, we can just show all reports found, and if a cell is selected, 
        // we could potentially show empty weeks. 
        // But the requirement says: "Se não houver relatório para uma semana específica do mês selecionado, mostre o card 'Vazio'"
        
        // To do this accurately, we'd need to know the meeting day of the cell.
        // Since this is a list of ALL reports (possibly multiple cells), 
        // showing empty weeks only makes sense when a single cell is filtered.
        
        if (currentCell === 'all' || reports.length === 0) {
            return reports.map(r => ({ ...r, type: 'report' }))
        }

        // When a specific cell is filtered, we can try to find its meeting day.
        // For now, let's use a simple approach: find the meeting days from existing reports or default to Wednesday.
        let meetingDay = 3 // Wednesday
        if (reports.length > 0) {
            meetingDay = getDay(new Date(reports[0].date))
        }

        const days = eachDayOfInterval({ start, end })
        const meetingDates = days.filter(d => getDay(d) === meetingDay)

        return meetingDates.map((date, index) => {
            const report = reports.find(r => isSameDay(new Date(r.date), date))
            if (report) {
                return { ...report, type: 'report', weekIndex: index + 1 }
            } else {
                return { 
                    type: 'empty', 
                    date, 
                    weekIndex: index + 1,
                    status: 'PENDENTE'
                }
            }
        })
    }

    const weeksData = generateWeeks()

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Mês</label>
                    <Select value={currentMonth} onValueChange={(v) => handleFilterChange('month', v)}>
                        <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
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
                    <label className="text-sm font-semibold text-slate-700">Ano</label>
                    <Select value={currentYear} onValueChange={(v) => handleFilterChange('year', v)}>
                        <SelectTrigger className="w-[110px] bg-slate-50 border-slate-200">
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
                        <label className="text-sm font-semibold text-slate-700">Célula</label>
                        <Select value={currentCell} onValueChange={(v) => handleFilterChange('cellId', v)}>
                            <SelectTrigger className="w-full bg-slate-50 border-slate-200">
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
                <TabsList className="w-full justify-start h-auto p-1 bg-slate-100/50 border border-slate-200 rounded-xl overflow-x-auto flex-nowrap">
                    <TabsTrigger value="ALL" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Todos</TabsTrigger>
                    <TabsTrigger value="PENDING" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">Pendentes</TabsTrigger>
                    <TabsTrigger value="ENVIADO_LIDER" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">Enviados</TabsTrigger>
                    <TabsTrigger value="CORRECTION" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">Devolvidos</TabsTrigger>
                    <TabsTrigger value="APROVADO" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">Aprovados</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeksData.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">Nenhum relatório encontrado para os filtros selecionados.</p>
                    </div>
                ) : (
                    weeksData.map((item, index) => {
                        if (item.type === 'report') {
                            const report = item as Report & { weekIndex?: number }
                            return (
                                <div key={report.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                {report.weekIndex ? `Semana ${report.weekIndex}` : formatDate(new Date(report.date), "EEEE", { locale: ptBR })}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800">
                                                {formatDate(new Date(report.date), "dd 'de' MMMM", { locale: ptBR })}
                                            </h3>
                                        </div>
                                        {report.status === 'APROVADO' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        {(report.status === 'RASCUNHO' || report.status === 'EM_ANDAMENTO') && <Clock className="w-5 h-5 text-yellow-500" />}
                                        {report.status === 'DEVOLVIDO' && <AlertCircle className="w-5 h-5 text-orange-500" />}
                                        {report.status === 'ENVIADO_LIDER' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                                    </div>
                                    
                                    <div className="p-4 flex-1 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Status</span>
                                            {getStatusBadge(report.status)}
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Célula</span>
                                            <span className="text-xs font-semibold text-slate-700">{report.cellName}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Presença</span>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-slate-800">{report.presentMembers} membros</span>
                                                <span className="text-[10px] text-slate-400 block">{report.visitorsCount} visitantes</span>
                                            </div>
                                        </div>

                                        {report.hasCorrectionLetter && (
                                            <div className="mt-2 flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 font-medium">
                                                <MessageSquare className="w-3 h-3" />
                                                Carta de Correção Anexada
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                                        <Button 
                                            variant={['RASCUNHO', 'EM_ANDAMENTO', 'DEVOLVIDO'].includes(report.status) ? 'default' : 'outline'}
                                            size="sm" 
                                            className={`w-full font-bold ${['RASCUNHO', 'EM_ANDAMENTO', 'DEVOLVIDO'].includes(report.status) ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                                            onClick={() => router.push(`/app/celula/relatorios/${report.id}/editar`)}
                                        >
                                            {['RASCUNHO', 'EM_ANDAMENTO', 'DEVOLVIDO'].includes(report.status) ? (
                                                <><Edit className="w-4 h-4 mr-2" /> Continuar Preenchimento</>
                                            ) : (
                                                <><FileText className="w-4 h-4 mr-2" /> Ver Detalhes</>
                                            )}
                                        </Button>

                                        {['ADMIN', 'SUPERVISOR', 'COORDENADOR'].includes(userRole) && 
                                         ['ENVIADO_LIDER', 'APROVADO'].includes(report.status) && (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="px-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                                                onClick={() => {
                                                    setSelectedReportId(report.id)
                                                    setCorrectionOpen(true)
                                                }}
                                                title="Adicionar Carta de Correção"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        } else {
                            // Empty Card
                            const empty = item as { date: Date, weekIndex: number }
                            return (
                                <div key={`empty-${index}`} className="bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 p-4 flex flex-col justify-between min-h-[200px] transition-colors hover:bg-slate-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Semana {empty.weekIndex}
                                        </span>
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-400 mb-4">
                                        {formatDate(empty.date, "dd 'de' MMMM", { locale: ptBR })}
                                    </h3>

                                    <Button 
                                        variant="outline"
                                        className="w-full border-slate-300 text-slate-500 hover:bg-white hover:text-indigo-600 hover:border-indigo-300 font-bold"
                                        onClick={() => {
                                            const dateStr = formatDate(empty.date, 'yyyy-MM-dd')
                                            router.push(`/app/celula/reuniao/lancamento?date=${dateStr}`)
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Criar Relatório
                                    </Button>
                                </div>
                            )
                        }
                    })
                )}
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
