'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { PrayerCalendarPDF, type ReportData } from './PrayerCalendarPDF'

export default function PrayerReportButton({ data }: { data: ReportData | null | undefined }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!data) return null

  if (!isClient) {
    return (
      <div className="mt-2 flex items-center justify-center gap-2 w-full p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 font-bold">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando PDF...
      </div>
    )
  }

  const fileName = `Relatorio_Oracao_${data.memberName.replace(/\s+/g, '_')}_${data.year}.pdf`

  return (
    <div className="mt-2">
      <PDFDownloadLink
        document={<PrayerCalendarPDF data={data} />}
        fileName={fileName}
        className="flex items-center justify-center gap-2 w-full p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-bold hover:bg-indigo-100 transition-colors"
      >
        {({ blob, url, loading, error }) => 
          loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando PDF...
            </div>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Baixar Histórico de Oração (PDF)
            </>
          )
        }
      </PDFDownloadLink>
    </div>
  )
}
