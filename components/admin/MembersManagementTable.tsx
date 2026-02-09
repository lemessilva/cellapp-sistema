'use client'

import { useMemo, useState, useEffect } from 'react'
import { User, Phone, MapPin, FileText, Heart, Calendar, Loader2, ArrowRightLeft, History, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import PrayerReportButton from '@/components/reports/PrayerReportButton'
import { MemberAttendanceHistoryModal } from './MemberAttendanceHistoryModal'
import MemberGrowthModal from '@/components/growth/MemberGrowthModal'
import type { ReportData } from '@/components/reports/PrayerCalendarPDF'
import { getPrayerReportData } from '@/app/actions/report'
import { updateMemberCell } from '@/app/actions/member'
import { toggleUserActiveStatus } from '@/app/(protected)/admin/actions'

type Member = {
  id: string
  nome: string
  foto_url: string | null
  dataNascimento: string | Date | null
  data_nascimento: string | Date | null
  telefone: string | null
  whatsapp: string | null
  bairro: string | null
  ativo: boolean
  celula: { nome: string } | null
  prayerTotalDays: number
  lastPrayerDate: string | Date | null
  prayerFrequency: string
}

type CellOption = {
  id: string
  nome: string
  lider: { nome: string } | null
}

function parseDate(value: string | Date | null | undefined) {
  if (!value) return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

function calculateAge(
  mainDate: string | Date | null,
  fallbackDate: string | Date | null
) {
  const d = parseDate(mainDate) || parseDate(fallbackDate)
  if (!d) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

function normalizePhone(phone: string | null | undefined) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  return digits
}

function formatPhone(phone: string | null | undefined) {
  const digits = normalizePhone(phone)
  if (!digits) return ''
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone || ''
}

type Props = {
  members: Member[]
  cells?: CellOption[]
}

export default function MembersManagementTable({ members, cells = [] }: Props) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportError, setReportError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  
  // History State
  const [memberForHistory, setMemberForHistory] = useState<Member | null>(null)
  const [memberForGrowth, setMemberForGrowth] = useState<Member | null>(null)

  // Cell Move State
  const [memberToMove, setMemberToMove] = useState<Member | null>(null)
  const [targetCellId, setTargetCellId] = useState<string>('')
  const [isMoving, setIsMoving] = useState(false)

  const rows = useMemo(() => members, [members])

  useEffect(() => {
    if (!selectedMember) {
      setReportData(null)
      setReportError('')
      setLoadingReport(false)
      return
    }

    setLoadingReport(true)
    setReportError('')

    getPrayerReportData(selectedMember.id)
      .then((res) => {
        if (res.error) {
          setReportError(res.error)
        } else if (res.data) {
          setReportData(res.data)
        }
      })
      .catch(() => setReportError('Erro ao carregar relatório de oração.'))
      .finally(() => setLoadingReport(false))
  }, [selectedMember?.id])

  const handleMoveMember = async () => {
    if (!memberToMove) return

    setIsMoving(true)
    try {
      const res = await updateMemberCell(memberToMove.id, targetCellId)
      if (res.error) {
        toast.error(res.error)
      } else {
        const cellName = cells.find(c => c.id === targetCellId)?.nome || 'Sem Célula'
        toast.success(`Membro movido para ${cellName} com sucesso!`)
        setMemberToMove(null)
        setTargetCellId('')
      }
    } catch (error) {
      toast.error('Erro ao mover membro.')
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Membros</h2>
          <div className="text-sm text-slate-500">Total: {rows.length}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Idade</th>
                <th className="p-4">Célula</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Bairro</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((member) => {
                const age = calculateAge(
                  member.dataNascimento,
                  member.data_nascimento
                )
                const mainPhone = member.whatsapp || member.telefone
                const normalized = normalizePhone(mainPhone)
                const displayPhone = formatPhone(mainPhone)

                return (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-50 transition-colors ${member.ativo ? '' : 'opacity-60'}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center overflow-hidden">
                          {member.foto_url ? (
                            <img
                              src={member.foto_url}
                              alt={member.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold">
                              {member.nome.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {member.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">
                      {age !== null ? `${age} anos` : '-'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {member.celula?.nome || '-'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {displayPhone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {normalized ? (
                            <a
                              href={`https://wa.me/${normalized}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              {displayPhone}
                            </a>
                          ) : (
                            <span>{displayPhone}</span>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      {member.bairro || '-'}
                    </td>
                    <td className="p-4">
                      <button
                        disabled={togglingId === member.id}
                        onClick={async () => {
                          try {
                            setTogglingId(member.id)
                            const next = !member.ativo
                            const res = await toggleUserActiveStatus(member.id, next)
                            if (res?.error) {
                              toast.error(res.error)
                            } else {
                              toast.success(next ? 'Membro ativado.' : 'Membro inativado.')
                            }
                          } catch {
                            toast.error('Erro ao atualizar status.')
                          } finally {
                            setTogglingId(null)
                          }
                        }}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          member.ativo
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        } ${togglingId === member.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {togglingId === member.id && (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        )}
                        {member.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setMemberToMove(member)
                            setTargetCellId('') // Reset selection
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Mudar Célula"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            toast.info(
                              'Em breve: Ficha cadastral em PDF para este membro.'
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Ficha Cadastral"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMemberForHistory(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Histórico de Presença"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMemberForGrowth(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Trilho de Crescimento"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Relatório de Oração"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Move Member Dialog */}
      <Dialog 
        open={!!memberToMove} 
        onOpenChange={(open) => {
          if (!open) {
            setMemberToMove(null)
            setTargetCellId('')
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mover Membro</DialogTitle>
            <DialogDescription>
              Selecione a nova célula para <strong>{memberToMove?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nova Célula
              </label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={targetCellId}
                onChange={(e) => setTargetCellId(e.target.value)}
              >
                <option value="" disabled>Selecione uma célula</option>
                <option value="none">Sem Célula (Remover)</option>
                {cells.map((cell) => (
                  <option key={cell.id} value={cell.id}>
                    {cell.nome} {cell.lider?.nome ? `- ${cell.lider.nome}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMemberToMove(null)}
              disabled={isMoving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleMoveMember} 
              disabled={!targetCellId || isMoving}
            >
              {isMoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Movendo...
                </>
              ) : (
                'Confirmar Troca'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prayer Report Dialog */}
      <Dialog
        open={!!selectedMember}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null)
        }}
      >
        <DialogContent className="max-w-xl">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  Relatório de Oração
                </DialogTitle>
                <DialogDescription>
                  Visão geral da disciplina de oração deste membro.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center overflow-hidden">
                    {selectedMember.foto_url ? (
                      <img
                        src={selectedMember.foto_url}
                        alt={selectedMember.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {selectedMember.nome}
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedMember.celula?.nome || 'Sem célula vinculada'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <div className="text-xs font-semibold text-emerald-700">
                      Frequência
                    </div>
                    <div className="mt-1 text-lg font-bold text-emerald-900">
                      {selectedMember.prayerFrequency}
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Calculado pelos últimos 30 dias de oração.
                    </p>
                  </div>
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-sky-700">
                      <Calendar className="w-3 h-3" />
                      Última vez que orou
                    </div>
                    <div className="mt-1 text-lg font-bold text-sky-900">
                      {selectedMember.lastPrayerDate
                        ? parseDate(selectedMember.lastPrayerDate)?.toLocaleDateString(
                            'pt-BR'
                          )
                        : 'Sem registros'}
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                    <div className="text-xs font-semibold text-indigo-700">
                      Total de dias orados
                    </div>
                    <div className="mt-1 text-lg font-bold text-indigo-900">
                      {selectedMember.prayerTotalDays}
                    </div>
                    <p className="mt-1 text-[11px] text-indigo-700">
                      No ano atual.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {loadingReport ? (
                    <div className="flex items-center justify-center gap-2 w-full p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando dados para o calendário de oração...
                    </div>
                  ) : reportError ? (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                      {reportError}
                    </div>
                  ) : reportData ? (
                    <PrayerReportButton data={reportData} />
                  ) : null}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <MemberAttendanceHistoryModal
        isOpen={!!memberForHistory}
        onClose={() => setMemberForHistory(null)}
        memberId={memberForHistory?.id || null}
        memberName={memberForHistory?.nome || null}
      />

      {/* Member Growth Modal */}
      {memberForGrowth && (
        <MemberGrowthModal
          member={{
            id: memberForGrowth.id,
            name: memberForGrowth.nome,
            image: memberForGrowth.foto_url
          }}
          isOpen={!!memberForGrowth}
          onClose={() => setMemberForGrowth(null)}
        />
      )}
    </>
  )
}
