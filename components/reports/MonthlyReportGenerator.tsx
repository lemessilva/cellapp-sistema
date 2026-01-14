'use client'

import { useState } from 'react'
import { getMonthlyReportData } from '@/app/actions/meeting'
import { MonthlyReportPDF } from '@/components/reports/MonthlyReportPDF'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Loader2, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  cellId: string
  cellName: string
}

export function MonthlyReportGenerator({ cellId, cellName }: Props) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setReportData(null)
    
    try {
      const result = await getMonthlyReportData(cellId, month, year)
      
      if ('error' in result) {
        toast.error(result.error)
        return
      }

      setReportData(result)
      toast.success('Relatório gerado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Relatório Mensal</h2>
          <p className="text-sm text-slate-500">Gere o PDF com a frequência e financeiro do mês.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mês</label>
          <select 
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full rounded-lg border-slate-200 text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ano</label>
          <input 
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full rounded-lg border-slate-200 text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Gerar Dados
        </button>

        {reportData && (
          <PDFDownloadLink
            document={<MonthlyReportPDF data={reportData} />}
            fileName={`relatorio-${reportData.month.toLowerCase().replace(' ', '-')}-${year}.pdf`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
          >
            {({ loading: pdfLoading }) => (
              <>
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Baixar PDF
              </>
            )}
          </PDFDownloadLink>
        )}
      </div>
    </div>
  )
}
