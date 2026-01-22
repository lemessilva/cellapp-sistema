'use client'

import { useState, useEffect } from 'react'
import { getMonthlyHubData, getMonthlyReportData } from '@/app/actions/meeting'
import { closeMonthlyReport, signMonthlyReportLider, signMonthlyReportSupervisor, requestCorrection } from '@/app/actions/closure'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { MonthlyReportPDF } from '@/components/reports/MonthlyReportPDF'
import { Loader2, Plus, Edit, Calendar, FileText, Download, CheckCircle, AlertCircle, Clock, XCircle, Lock, Send, PenTool, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface MonthlyHubProps {
  cellId: string
  cellName: string
  userId: string
  userRole: string
  isSecretary: boolean
}

export function MonthlyHub({ cellId, cellName, userId, userRole, isSecretary }: MonthlyHubProps) {
  const router = useRouter()
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [weeks, setWeeks] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [closure, setClosure] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Correction Modal
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false)
  const [correctionReason, setCorrectionReason] = useState('')
  // Renamed isPreviewOpen to isSignatureModalOpen to avoid confusion
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  const loadHub = async () => {
    setLoading(true)
    const result = await getMonthlyHubData(cellId, month, year)
    if ('error' in result) {
      toast.error(result.error)
    } else {
      setWeeks(result.weeks)

      // Recalculate stats locally to include RASCUNHO (Drafts) as filled
      const totalWeeks = result.weeks.length
      const filledWeeks = result.weeks.filter((w: any) => w.status !== 'PENDENTE').length
      const progressPercentage = totalWeeks > 0 ? Math.round((filledWeeks / totalWeeks) * 100) : 0

      setStats({ ...result.stats, filledWeeks, totalWeeks, progressPercentage })
      setClosure(result.closure)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadHub()
  }, [month, year])

  const handleGeneratePreview = async () => {
    setGeneratingPdf(true)
    try {
      const result = await getMonthlyReportData(cellId, month, year)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setReportData(result)
      }
    } catch (error) {
      toast.error('Erro ao gerar prévia')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const isWeekLocked = (dateStr: string) => {
    if (userRole === 'ADMIN') return false
    
    // Parse dateStr (YYYY-MM-DD)
    const [y, m, d] = dateStr.split('-').map(Number)
    const meetingDate = new Date(y, m - 1, d)
    
    // Available from day + 1 (tomorrow)
    const availableDate = new Date(meetingDate)
    availableDate.setDate(availableDate.getDate() + 1)
    availableDate.setHours(0, 0, 0, 0)
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    return now < availableDate
  }

  const handleWeekClick = (date: string) => {
    if (isWeekLocked(date)) {
        toast.info('O relatório estará disponível para preenchimento a partir de amanhã')
        return
    }

    // If month is closed (not ABERTO), prevent editing or open in read-only
    const isReadOnly = closure && closure.status !== 'ABERTO'
    router.push(`/app/celula/reuniao/lancamento?date=${date}${isReadOnly ? '&readonly=true' : ''}`)
  }

  const handleCloseMonth = async () => {
    if (!confirm('Tem certeza que deseja encerrar o mês? Não será possível editar os relatórios semanais após essa ação.')) return

    setActionLoading(true)
    const result = await closeMonthlyReport(cellId, month, year)
    if (result.success) {
      toast.success('Mês encerrado e enviado para o líder!')
      loadHub()
    } else {
      toast.error(result.error)
    }
    setActionLoading(false)
  }

  const handleRequestCorrection = async () => {
    setActionLoading(true)
    const result = await requestCorrection(cellId, month, year, correctionReason)
    if (result.success) {
      toast.success('Solicitação de correção enviada! O status voltou para ABERTO.')
      setIsCorrectionModalOpen(false)
      loadHub()
    } else {
      toast.error(result.error)
    }
    setActionLoading(false)
  }

  const [signatureType, setSignatureType] = useState<'LIDER' | 'SUPERVISOR'>('LIDER')

  const handleSignClick = async (type: 'LIDER' | 'SUPERVISOR') => {
    setSignatureType(type)
    setIsSignatureModalOpen(true)
    
    if (!reportData) {
        setGeneratingPdf(true)
        const data = await getMonthlyReportData(cellId, month, year)
        setReportData(data)
        setGeneratingPdf(false)
    }
  }

  const handleConfirmSignature = async () => {
    if (signatureType === 'LIDER') {
        await handleSignLider()
    } else {
        await handleSignSupervisor()
    }
    setIsSignatureModalOpen(false)
  }

  const handleSignLider = async () => {
    setActionLoading(true)
    const result = await signMonthlyReportLider(cellId, month, year, userId)
    if (result.success) {
      toast.success('Relatório assinado e validado!')
      loadHub()
    } else {
      toast.error(result.error)
    }
    setActionLoading(false)
  }

  const handleSignSupervisor = async () => {
    setActionLoading(true)
    const result = await signMonthlyReportSupervisor(cellId, month, year, userId)
    if (result.success) {
      toast.success('Relatório finalizado com sucesso!')
      loadHub()
    } else {
      toast.error(result.error)
    }
    setActionLoading(false)
  }

  const isLate = () => {
    const today = new Date()
    const limitDate = new Date(year, month, 10) // 10th of next month
    return today > limitDate && (!closure || closure.status === 'ABERTO')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTO': return 'bg-blue-100 text-blue-700'
      case 'AGUARDANDO_LIDER': return 'bg-orange-100 text-orange-700'
      case 'AGUARDANDO_SUPERVISOR': return 'bg-purple-100 text-purple-700'
      case 'FINALIZADO': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const canCloseMonth = stats?.progressPercentage === 100 && (!closure || closure.status === 'ABERTO')
  const canSignLider = userRole === 'LIDER' && closure?.status === 'AGUARDANDO_LIDER'
  const canSignSupervisor = (userRole === 'SUPERVISOR' || userRole === 'ADMIN') && closure?.status === 'AGUARDANDO_SUPERVISOR'
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Painel de Relatórios</h1>
              <p className="text-slate-500">{cellName}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border-slate-200 text-slate-700 focus:ring-indigo-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <input 
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded-lg border-slate-200 text-slate-700 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">Status do Mês</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${getStatusColor(closure?.status || 'ABERTO')}`}>
                    {closure?.status?.replace('_', ' ') || 'ABERTO'}
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${stats?.progressPercentage || 0}%` }}
                    />
                </div>
                <span className="text-sm font-bold text-slate-700">{stats?.progressPercentage || 0}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
                Preenchimento: {stats?.progressPercentage || 0}% - {stats?.filledWeeks || 0} de {stats?.totalWeeks || 0} semanas
            </p>
        </div>

        {/* Late Warning */}
        {isLate() && (
           <div className="mb-4 p-3 bg-orange-50 text-orange-700 rounded-lg border border-orange-200 text-sm flex items-center gap-2">
             <AlertCircle className="w-4 h-4" />
             <span>Atenção: Prazo de envio regular expirado (Dia 10).</span>
           </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          
          {/* Secretary Actions */}
          {(isSecretary || userRole === 'LIDER') && canCloseMonth && (
             <button
                onClick={handleCloseMonth}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
             >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Encerrar Mês e Enviar
             </button>
          )}

          {/* Leader Actions */}
          {canSignLider && (
              <>
                <div className="flex items-center gap-2 mr-auto text-orange-600 bg-orange-50 px-3 py-1 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Aguardando sua conferência
                </div>
                <button
                    onClick={() => setIsCorrectionModalOpen(true)}
                    disabled={actionLoading}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
                >
                    <RotateCcw className="w-4 h-4" />
                    Solicitar Correção
                </button>
                <button
                    onClick={() => handleSignClick('LIDER')}
                    disabled={actionLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                >
                    <PenTool className="w-4 h-4" />
                    Assinar e Validar
                </button>
              </>
          )}

          {/* Supervisor Actions */}
          {canSignSupervisor && (
              <button
                onClick={() => handleSignClick('SUPERVISOR')}
                disabled={actionLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                 <PenTool className="w-4 h-4" />
                 Assinar como Supervisor
              </button>
          )}

          {/* PDF Download */}
          {!reportData ? (
            <button 
              onClick={handleGeneratePreview}
              disabled={generatingPdf}
              className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-indigo-100"
            >
              {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Gerar PDF
            </button>
          ) : (
            <PDFDownloadLink
              document={<MonthlyReportPDF data={reportData} />}
              fileName={`relatorio-${month}-${year}.pdf`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              {({ loading }) => (
                <>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Baixar PDF
                </>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Weeks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          weeks.map((week) => (
            <div
              key={week.date}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${week.status === 'PENDENTE' ? 'bg-slate-50 border-slate-200' : ''}
                ${week.status === 'CONCLUIDO' ? 'bg-green-50 border-green-200' : ''}
                ${week.status === 'RASCUNHO' ? 'bg-blue-50 border-blue-200' : ''}
                ${week.status === 'NAO_HOUVE' ? 'bg-yellow-50 border-yellow-200' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Semana {week.weekIndex}
                </span>
                {week.status === 'CONCLUIDO' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {week.status === 'RASCUNHO' && <Clock className="w-5 h-5 text-blue-500" />}
                {week.status === 'NAO_HOUVE' && <XCircle className="w-5 h-5 text-yellow-500" />}
                {week.status === 'PENDENTE' && <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-4">{week.formattedDate}</h3>
              
              <button 
                onClick={() => handleWeekClick(week.date)}
                title={isWeekLocked(week.date) ? 'O relatório estará disponível para preenchimento a partir de amanhã' : ''}
                className={`
                  w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                  ${isWeekLocked(week.date) ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 
                    week.status === 'PENDENTE' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                    week.status === 'CONCLUIDO' ? 'bg-white text-green-700 border border-green-200 hover:bg-green-50' :
                    week.status === 'RASCUNHO' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    week.status === 'NAO_HOUVE' ? 'bg-white text-yellow-700 border border-yellow-200 hover:bg-yellow-50' : ''
                  }
                `}
              >
                {/* Logic for Button Label/Icon based on Status AND Closure Status */}
                {isWeekLocked(week.date) ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Aguardando
                    </>
                ) : closure && closure.status !== 'ABERTO' ? (
                     <>
                        <Lock className="w-4 h-4" />
                        Visualizar
                     </>
                ) : (
                    <>
                        {week.status === 'PENDENTE' && <><Plus className="w-4 h-4" /> Preencher</>}
                        {week.status === 'RASCUNHO' && <><Edit className="w-4 h-4" /> Continuar</>}
                        {week.status === 'CONCLUIDO' && <><Edit className="w-4 h-4" /> Editar</>}
                        {week.status === 'NAO_HOUVE' && <><Edit className="w-4 h-4" /> Editar</>}
                    </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Correction Modal */}
      {isCorrectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Solicitar Correção</h3>
                  <p className="text-sm text-slate-500 mb-4">
                      Descreva o motivo da correção. O status voltará para "ABERTO" e o secretário poderá editar os relatórios.
                  </p>
                  <textarea
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                      rows={4}
                      placeholder="Ex: O valor da oferta da semana 2 está incorreto..."
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setIsCorrectionModalOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={handleRequestCorrection}
                        disabled={actionLoading || !correctionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                          Confirmar Solicitação
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Signature Preview Modal */}
      <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Conferência de Relatório Mensal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                    <p>Por favor, confira os dados abaixo antes de assinar. Esta ação é irrevogável.</p>
                </div>

                {reportData && (
                    <div className="space-y-6">
                        {/* Summary Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <h4 className="bg-gray-100 p-2 font-bold text-sm border-b">Resumo Geral</h4>
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-2 text-left">Data</th>
                                        <th className="p-2 text-left">Tema</th>
                                        <th className="p-2 text-right">Presentes</th>
                                        <th className="p-2 text-right">Visitantes</th>
                                        <th className="p-2 text-left">Observações</th>
                                        <th className="p-2 text-left">Detalhamento Oferta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {reportData.reportSummaries.map((s: any, i: number) => (
                                        <tr key={i}>
                                            <td className="p-2">{s.date}</td>
                                            <td className="p-2 text-xs truncate max-w-[150px]">{s.theme}</td>
                                            <td className="p-2 text-right">{s.present}</td>
                                            <td className="p-2 text-right">{s.visitors}</td>
                                            <td className="p-2 text-xs truncate max-w-[150px]">{s.observations || '-'}</td>
                                            <td className="p-2 text-xs truncate max-w-[150px]">{s.offerDetails || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financial Breakdown */}
                         <div className="border rounded-lg overflow-hidden">
                            <h4 className="bg-gray-100 p-2 font-bold text-sm border-b">Detalhamento Financeiro</h4>
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-2 text-left">Categoria</th>
                                        {reportData.reportSummaries.map((s: any, i: number) => (
                                            <th key={i} className="p-2 text-right">{s.date}</th>
                                        ))}
                                        <th className="p-2 text-right bg-slate-100">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="p-2 font-medium">Dízimos</td>
                                        {reportData.reportSummaries.map((s: any, i: number) => (
                                            <td key={i} className="p-2 text-right">R$ {s.financials.tithe.toFixed(2)}</td>
                                        ))}
                                        <td className="p-2 text-right font-bold bg-slate-50">
                                            R$ {reportData.reportSummaries.reduce((acc: number, curr: any) => acc + curr.financials.tithe, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium">Ofertas</td>
                                        {reportData.reportSummaries.map((s: any, i: number) => (
                                            <td key={i} className="p-2 text-right">R$ {s.financials.offer.toFixed(2)}</td>
                                        ))}
                                        <td className="p-2 text-right font-bold bg-slate-50">
                                            R$ {reportData.reportSummaries.reduce((acc: number, curr: any) => acc + curr.financials.offer, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium">Missões</td>
                                        {reportData.reportSummaries.map((s: any, i: number) => (
                                            <td key={i} className="p-2 text-right">R$ {s.financials.missions.toFixed(2)}</td>
                                        ))}
                                        <td className="p-2 text-right font-bold bg-slate-50">
                                            R$ {reportData.reportSummaries.reduce((acc: number, curr: any) => acc + curr.financials.missions, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-50 font-bold">
                                        <td className="p-2">TOTAL GERAL</td>
                                        {reportData.reportSummaries.map((s: any, i: number) => (
                                            <td key={i} className="p-2 text-right">R$ {s.financials.total.toFixed(2)}</td>
                                        ))}
                                        <td className="p-2 text-right">
                                            R$ {reportData.reportSummaries.reduce((acc: number, curr: any) => acc + curr.financials.total, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                         {/* Member Attendance */}
                         <div className="border rounded-lg overflow-hidden">
                            <h4 className="bg-gray-100 p-2 font-bold text-sm border-b">Lista de Presença (Adultos) - Pro Rata</h4>
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">Membro</th>
                                            {reportData.reportSummaries.map((s: any, i: number) => (
                                                <th key={i} className="p-2 text-center text-xs">{s.date}</th>
                                            ))}
                                            <th className="p-2 text-center">Freq.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {reportData.adults.map((adult: any) => (
                                            <tr key={adult.id}>
                                                <td className="p-2">{adult.name}</td>
                                                {reportData.reportSummaries.map((s: any) => (
                                                    <td key={s.date} className="p-2 text-center text-xs">
                                                        {adult.attendance[s.date] || '-'}
                                                    </td>
                                                ))}
                                                <td className="p-2 text-center font-bold">
                                                    {adult.stats.present}/{adult.stats.eligible}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <button
                                onClick={() => setIsSignatureModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                            >
                                Voltar / Editar
                            </button>

                            <button
                                onClick={handleConfirmSignature}
                                disabled={actionLoading}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Confirmar Dados e Assinar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
