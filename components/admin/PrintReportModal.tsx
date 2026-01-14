'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, FileText } from 'lucide-react'
import { getPrayerReportData } from '@/app/actions/report'
import PrayerReportButton from '@/components/reports/PrayerReportButton'
import type { ReportData } from '@/components/reports/PrayerCalendarPDF'

interface PrintReportModalProps {
  userId: string
  userName: string
  isOpen: boolean
  onClose: () => void
}

export default function PrintReportModal({ userId, userName, isOpen, onClose }: PrintReportModalProps) {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true)
      setError('')
      getPrayerReportData(userId)
        .then(res => {
          if (res.error) {
            setError(res.error)
          } else if (res.data) {
            setReportData(res.data)
          }
        })
        .catch(() => setError('Erro ao gerar relatório.'))
        .finally(() => setLoading(false))
    }
  }, [isOpen, userId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <FileText className="w-5 h-5 text-indigo-600" />
             Relatório de Oração
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
            <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                    {userName.charAt(0)}
                </div>
                <h4 className="font-bold text-lg text-slate-900">{userName}</h4>
                <p className="text-sm text-slate-500">Gerando histórico anual...</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium">Buscando dados...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm">
                    {error}
                </div>
            ) : reportData ? (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                            <span>Ano:</span> <span className="font-bold">{reportData.year}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Célula:</span> <span className="font-bold">{reportData.cellName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Dias orados:</span> <span className="font-bold text-green-600">{reportData.prayedDates.length}</span>
                        </div>
                    </div>
                    <PrayerReportButton data={reportData} />
                </div>
            ) : null}
        </div>
      </div>
    </div>
  )
}
