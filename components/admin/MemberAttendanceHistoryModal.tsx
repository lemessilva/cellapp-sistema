'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { getMemberAttendanceHistory } from '@/app/actions/member'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AttendanceRecord {
  id: string
  status: string // "P", "F", "FJ"
  absenceReason: string | null
  report: {
    date: Date | string
    studyTheme: string | null
  }
}

interface MemberAttendanceHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  memberId: string | null
  memberName: string | null
}

export function MemberAttendanceHistoryModal({ 
  isOpen, 
  onClose, 
  memberId,
  memberName 
}: MemberAttendanceHistoryModalProps) {
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && memberId) {
      setLoading(true)
      setError('')
      getMemberAttendanceHistory(memberId)
        .then((res) => {
          if (res.error) {
            setError(res.error)
          } else if (res.data) {
            setHistory(res.data as any)
          }
        })
        .catch(() => setError('Erro ao carregar histórico.'))
        .finally(() => setLoading(false))
    } else {
        setHistory([])
    }
  }, [isOpen, memberId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'P':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" /> Presente
          </span>
        )
      case 'F':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" /> Falta
          </span>
        )
      case 'FJ':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <AlertCircle className="w-3 h-3" /> Justificada
          </span>
        )
      default:
        return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico de Presença</DialogTitle>
          <DialogDescription>
            Registros de {memberName} nas reuniões de célula.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Carregando histórico...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum registro de presença encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div 
                  key={record.id} 
                  className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {format(new Date(record.report.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {record.report.studyTheme || 'Sem tema registrado'}
                      </p>
                      {record.status === 'FJ' && record.absenceReason && (
                         <p className="text-xs text-yellow-700 mt-1 italic">
                           "{record.absenceReason}"
                         </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
