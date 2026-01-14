'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Plus, 
  Save, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Send,
  FileEdit,
  Baby,
  ArrowRight,
  Lock
} from 'lucide-react'
import { submitMeetingReport, getReportByDate } from '@/app/actions/meeting'
import { getRosterForDate } from '@/app/actions/roster'

interface Participant {
  id: string
  nome: string
  role?: string
  foto_url?: string | null
}

interface ReportFormProps {
  cellId: string
  adults: Participant[]
  kids: Participant[]
  initialDate?: string
  initialReport?: any
  rosterData?: any
  readonly?: boolean
}

interface AdultState {
  status: 'P' | 'F' | 'FJ'
  absenceReason: string
  offerValue: string
  titheValue: string
  missionsValue: string
  otherValue: string
}

interface KidState {
  church: boolean
  cell: boolean
  homeWorship: boolean
  devotional: boolean
  challenge: boolean
  // Financeiro Kids
  offerValue: string
  titheValue: string
  missionsValue: string
  otherValue: string
}

interface Visitor {
  id: string
  name: string
  phone: string
  type: string
}

// Helper para limpar valores monetários
const parseCurrency = (value: string | number): number => {
  if (!value) return 0
  if (typeof value === 'number') return value
  
  // Se tiver vírgula, assume formato BR e limpa
  if (value.includes(',')) {
    const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(cleanValue) || 0
  }
  
  // Se não tiver vírgula (ex: "10.00" do banco ou "50"), faz parse direto
  return parseFloat(value) || 0
}

const formatCurrency = (value: string | number) => {
  if (!value) return ''
  const numberValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numberValue)) return ''
  return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ReportForm({ cellId, adults, kids, initialDate, initialReport, rosterData, readonly: propReadonly }: ReportFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const readonly = propReadonly || searchParams.get('readonly') === 'true'
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [nextAction, setNextAction] = useState<'hub' | 'next'>('hub')

  // Form States
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [studyTheme, setStudyTheme] = useState('')
  const [isMeetingCancelled, setIsMeetingCancelled] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Roster States
  const [hostId, setHostId] = useState('')
  const [directionId, setDirectionId] = useState('')
  const [worshipId, setWorshipId] = useState('')
  const [evangelismId, setEvangelismId] = useState('')
  
  // Adult State
  const [adultAttendance, setAdultAttendance] = useState<Record<string, AdultState>>({})
  
  // Kid State
  const [kidPillars, setKidPillars] = useState<Record<string, KidState>>({})

  // Visitors State
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [newVisitorName, setNewVisitorName] = useState('')
  const [newVisitorPhone, setNewVisitorPhone] = useState('')
  const [newVisitorType, setNewVisitorType] = useState('Visitante')

  // Financial Summary State
  const [manualTotalOffer, setManualTotalOffer] = useState<string>('')
  const [manualTotalMissions, setManualTotalMissions] = useState<string>('')

  // Initialize states
  useEffect(() => {
    // Adults
    const initialAdults: Record<string, AdultState> = {}
    adults.forEach(p => {
      initialAdults[p.id] = {
        status: 'P', 
        absenceReason: '',
        offerValue: '',
        titheValue: '',
        missionsValue: '',
        otherValue: ''
      }
    })
    setAdultAttendance(initialAdults)

    // Kids
    const initialKids: Record<string, KidState> = {}
    kids.forEach(k => {
      const existing = initialReport?.kidsPillars?.find((kp: any) => kp.userId === k.id)
      initialKids[k.id] = {
        church: existing?.church || false,
        cell: existing?.cell || false,
        homeWorship: existing?.homeWorship || false,
        devotional: existing?.devotional || false,
        challenge: existing?.challenge || false,
        offerValue: existing?.offerValue ? String(existing.offerValue.toFixed(2)) : '',
        titheValue: existing?.titheValue ? String(existing.titheValue.toFixed(2)) : '',
        missionsValue: existing?.missionsValue ? String(existing.missionsValue.toFixed(2)) : '',
        otherValue: existing?.otherValue ? String(existing.otherValue.toFixed(2)) : ''
      }
    })
    setKidPillars(initialKids)
  }, [adults, kids, initialReport])

  // Load Report Data
  useEffect(() => {
    const fillForm = (report: any) => {
        setStartTime(report.startTime)
        setEndTime(report.endTime)
        setStudyTheme(report.studyTheme)
        setIsMeetingCancelled(report.status === 'NAO_HOUVE')
        setCancelReason(report.cancelReason || '')

        // Roster Fields from Report
        setHostId(report.hostId || '')
        setDirectionId(report.directionId || '')
        setWorshipId(report.worshipId || '')
        setEvangelismId(report.evangelismId || '')
        
        if (report.status !== 'NAO_HOUVE') {
             // Update Attendance preserving structure
             setAdultAttendance(prev => {
                const next = { ...prev }
                if (report.attendance) {
                    report.attendance.forEach((att: any) => {
                        if (next[att.userId]) {
                            next[att.userId] = {
                                status: att.status as any,
                                absenceReason: att.absenceReason || '',
                                titheValue: att.titheValue !== undefined ? Number(att.titheValue).toFixed(2) : '',
                                missionsValue: att.missionsValue !== undefined ? Number(att.missionsValue).toFixed(2) : '',
                                otherValue: att.otherValue !== undefined ? Number(att.otherValue).toFixed(2) : '',
                                offerValue: att.offerValue !== undefined ? Number(att.offerValue).toFixed(2) : ''
                            }
                        }
                    })
                }
                return next
             })

             // Update Kids
             setKidPillars(prev => {
                const next = { ...prev }
                if (report.kidsPillars) {
                    report.kidsPillars.forEach((kid: any) => {
                        if (next[kid.userId]) {
                            next[kid.userId] = {
                                church: kid.church,
                                cell: kid.cell,
                                homeWorship: kid.homeWorship,
                                devotional: kid.devotional,
                                challenge: kid.challenge,
                                offerValue: kid.offerValue !== undefined ? Number(kid.offerValue).toFixed(2) : '',
                                titheValue: kid.titheValue !== undefined ? Number(kid.titheValue).toFixed(2) : '',
                                missionsValue: kid.missionsValue !== undefined ? Number(kid.missionsValue).toFixed(2) : '',
                                otherValue: kid.otherValue !== undefined ? Number(kid.otherValue).toFixed(2) : ''
                            }
                        }
                    })
                }
                return next
             })

             // Visitors
             if (report.visitors) {
                 setVisitors(report.visitors.map((v: any) => ({
                     id: v.id,
                     name: v.name,
                     phone: v.phone,
                     type: v.type
                 })))
             }
        }
    }

    const loadReport = async () => {
        if (!date) return
        
        // Use initialReport if matches date
        if (initialReport) {
            const reportDate = new Date(initialReport.date).toISOString().split('T')[0]
            if (reportDate === date) {
                fillForm(initialReport)
                return
            }
        }

        try {
            const result = await getReportByDate(cellId, date)
            if ('report' in result && result.report) {
                fillForm(result.report)
            } else {
                // Report not found, try to fetch Roster to pre-fill
                // Only if we are on the initial date and have prop, OR fetch dynamically
                if (initialDate === date && rosterData) {
                    setHostId(rosterData.hostMemberId || '')
                    setDirectionId(rosterData.directionMemberId || '')
                    setWorshipId(rosterData.worshipMemberId || '')
                    setEvangelismId(rosterData.evangelismMemberId || '')
                } else {
                    // Fetch dynamic roster
                    const [y, m, d] = date.split('-').map(Number)
                    const safeDate = new Date(y, m - 1, d, 12, 0, 0)
                    const roster = await getRosterForDate(cellId, safeDate)
                    if (roster) {
                        setHostId(roster.hostMemberId || '')
                        setDirectionId(roster.directionMemberId || '')
                        setWorshipId(roster.worshipMemberId || '')
                        setEvangelismId(roster.evangelismMemberId || '')
                    } else {
                        // Clear fields if no roster
                        setHostId('')
                        setDirectionId('')
                        setWorshipId('')
                        setEvangelismId('')
                    }
                }
            }
        } catch (error) {
            console.error("Error loading report", error)
        }
    }
    loadReport()
  }, [date, cellId, initialReport, rosterData, initialDate])

  // Calculations
  const calculatedTotalOffer = Object.values(adultAttendance).reduce((sum, curr) => {
    return sum + (parseFloat(curr.offerValue) || 0) + (parseFloat(curr.titheValue) || 0) + (parseFloat(curr.otherValue) || 0)
  }, 0) + Object.values(kidPillars).reduce((sum, curr) => {
    return sum + (parseFloat(curr.offerValue) || 0) + (parseFloat(curr.titheValue) || 0) + (parseFloat(curr.otherValue) || 0)
  }, 0)

  const calculatedTotalMissions = Object.values(adultAttendance).reduce((sum, curr) => {
    return sum + (parseFloat(curr.missionsValue) || 0)
  }, 0) + Object.values(kidPillars).reduce((sum, curr) => {
    return sum + (parseFloat(curr.missionsValue) || 0)
  }, 0)

  // Handlers: Adults
  const updateAdultStatus = (userId: string, status: 'P' | 'F' | 'FJ') => {
    setAdultAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], status }
    }))
  }

  const updateAdultReason = (userId: string, reason: string) => {
    setAdultAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], absenceReason: reason }
    }))
  }

  const updateAdultFinance = (userId: string, field: keyof AdultState, value: string) => {
    setAdultAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }))
  }

  // Handlers: Kids
  const toggleKidPillar = (userId: string, pillar: keyof Omit<KidState, 'offerValue' | 'titheValue' | 'missionsValue' | 'otherValue'>) => {
    if (readonly) return
    setKidPillars(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [pillar]: !prev[userId][pillar] }
    }))
  }

  const updateKidFinance = (userId: string, field: 'offerValue' | 'titheValue' | 'missionsValue' | 'otherValue', value: string) => {
    if (readonly) return
    setKidPillars(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }))
  }

  // Handlers: Visitors
  const addVisitor = () => {
    if (!newVisitorName.trim()) return
    const newVisitor: Visitor = {
      id: Math.random().toString(36).substr(2, 9),
      name: newVisitorName,
      phone: newVisitorPhone,
      type: newVisitorType
    }
    setVisitors([...visitors, newVisitor])
    setNewVisitorName('')
    setNewVisitorPhone('')
    setNewVisitorType('Visitante')
  }

  const removeVisitor = (id: string) => {
    setVisitors(visitors.filter(v => v.id !== id))
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const value = e.target.value.replace(/\D/g, '')
    const numberValue = parseFloat(value) / 100
    onChange(numberValue.toFixed(2))
  }

  const handleSubmit = async (status: 'RASCUNHO' | 'ENVIADO_LIDER', nextDest: 'hub' | 'next' = 'hub') => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    // Basic Validation
    if (!date || !startTime || !endTime) {
      setError('Por favor, preencha a data e os horários.')
      setIsSubmitting(false)
      return
    }

    if (startTime >= endTime) {
      setError('O horário de término deve ser posterior ao horário de início.')
      setIsSubmitting(false)
      return
    }

    // Validate Absences Reason
    for (const [userId, state] of Object.entries(adultAttendance)) {
      if ((state.status === 'F' || state.status === 'FJ') && !state.absenceReason.trim()) {
        const user = adults.find(a => a.id === userId)
        if (user) {
          setError(`Por favor, informe o motivo da falta para ${user.nome}.`)
          setIsSubmitting(false)
          return
        }
      }
    }

    try {
      const attendanceData = Object.entries(adultAttendance).map(([userId, data]) => ({
        userId,
        status: data.status,
        absenceReason: data.absenceReason,
        offerValue: parseFloat(data.offerValue) || 0,
        titheValue: parseFloat(data.titheValue) || 0,
        missionsValue: parseFloat(data.missionsValue) || 0,
        otherValue: parseFloat(data.otherValue) || 0
      }))

      // Build Kids Data
      const kidsData = Object.entries(kidPillars).map(([userId, data]) => ({
        userId,
        ...data,
        offerValue: parseFloat(data.offerValue) || 0,
        titheValue: parseFloat(data.titheValue) || 0,
        missionsValue: parseFloat(data.missionsValue) || 0,
        otherValue: parseFloat(data.otherValue) || 0
      }))

      const finalOfferValue = manualTotalOffer ? parseFloat(manualTotalOffer) : calculatedTotalOffer
      const finalMissionsValue = manualTotalMissions ? parseFloat(manualTotalMissions) : calculatedTotalMissions

      // Create date object safely avoiding timezone issues (setting to noon)
      const [y, m, d] = date.split('-').map(Number)
      const safeDate = new Date(y, m - 1, d, 12, 0, 0)

      const result = await submitMeetingReport({
        cellId,
        date: safeDate,
        startTime,
        endTime,
        studyTheme,
        visitors,
        offerValue: finalOfferValue,
        missionsValue: finalMissionsValue,
        attendance: attendanceData,
        kidsPillars: kidsData,
        status,
        // Roster Fields
        hostId,
        directionId,
        worshipId,
        evangelismId
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        router.refresh() // Atualiza a página pai (MonthlyHub)
        setTimeout(() => {
          if (nextDest === 'next') {
            const currentDate = new Date(date)
            currentDate.setDate(currentDate.getDate() + 7)
            const nextDate = currentDate.toISOString().split('T')[0]
            router.push(`/app/celula/reuniao/lancamento?date=${nextDate}`)
          } else {
            router.push('/app/celula/reuniao')
          }
        }, 1500)
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-20">
      <div className="p-6 bg-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Novo Relatório
            </h2>
            <p className="text-indigo-100 text-sm mt-1">Preencha os dados retroativos da reunião.</p>
          </div>
          {readonly && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Modo Leitura
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* A. Cabeçalho */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Dados da Reunião
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
             <input 
               type="checkbox" 
               id="cancelMeeting"
               checked={isMeetingCancelled}
               onChange={(e) => setIsMeetingCancelled(e.target.checked)}
               disabled={readonly}
               className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 disabled:opacity-50"
             />
             <label htmlFor="cancelMeeting" className="font-medium text-yellow-900 cursor-pointer">
               Não houve reunião nesta data
             </label>
          </div>

          {!isMeetingCancelled ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={readonly}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={readonly}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={readonly}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                   {/* Spacer or extra field */}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema/Estudo</label>
                <input 
                  type="text" 
                  value={studyTheme}
                  onChange={(e) => setStudyTheme(e.target.value)}
                  placeholder="Ex: A Importância da Oração"
                  disabled={readonly}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={readonly}
                className="w-full md:w-1/4 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4 disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do Cancelamento</label>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Descreva o motivo..."
                disabled={readonly}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none min-h-[100px] disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
            </div>
          )}
        </section>

        {!isMeetingCancelled && (
          <>
            <hr className="border-gray-100" />
            
            {/* Escala da Reunião */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Liderança da Reunião
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quem Dirigiu?</label>
                  <select 
                    value={directionId} 
                    onChange={(e) => setDirectionId(e.target.value)}
                    disabled={readonly}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Selecione...</option>
                    {adults.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quem fez o Louvor?</label>
                  <select 
                    value={worshipId} 
                    onChange={(e) => setWorshipId(e.target.value)}
                    disabled={readonly}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Selecione...</option>
                    {adults.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quem fez a Palavra de Oferta?</label>
                  <select 
                    value={evangelismId} 
                    onChange={(e) => setEvangelismId(e.target.value)}
                    disabled={readonly}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Selecione...</option>
                    {adults.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anfitrião (Casa)</label>
                  <select 
                    value={hostId} 
                    onChange={(e) => setHostId(e.target.value)}
                    disabled={readonly}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Selecione...</option>
                    {adults.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />
            {/* B. Lista de Membros (Adultos) */}
            <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Membros (Adultos)
          </h3>
          
          <div className="space-y-4">
            {adults.map(adult => {
              const state = adultAttendance[adult.id] || { status: 'P', absenceReason: '', offerValue: '', titheValue: '', missionsValue: '', otherValue: '' }
              const isAbsent = state.status === 'F' || state.status === 'FJ'

              return (
                <div key={adult.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Nome e Presença */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${state.status === 'P' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {adult.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{adult.nome}</p>
                        <div className="flex gap-1 mt-1">
                          <button 
                            type="button"
                            onClick={() => updateAdultStatus(adult.id, 'P')}
                            className={`px-2 py-0.5 text-xs rounded border ${state.status === 'P' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-300'}`}
                          >
                            P
                          </button>
                          <button 
                            type="button"
                            onClick={() => updateAdultStatus(adult.id, 'F')}
                            className={`px-2 py-0.5 text-xs rounded border ${state.status === 'F' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-300'}`}
                          >
                            F
                          </button>
                          <button 
                            type="button"
                            onClick={() => updateAdultStatus(adult.id, 'FJ')}
                            className={`px-2 py-0.5 text-xs rounded border ${state.status === 'FJ' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-300'}`}
                            title="Falta Justificada"
                          >
                            FJ
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Motivo da Falta */}
                    {isAbsent && (
                      <div className="flex-1 animate-in fade-in zoom-in-95 duration-200">
                        <input 
                          type="text" 
                          value={state.absenceReason}
                          onChange={(e) => updateAdultReason(adult.id, e.target.value)}
                          placeholder="Motivo da falta (Obrigatório)"
                          disabled={readonly}
                          className="w-full p-2 text-sm border border-red-200 rounded-lg bg-red-50 focus:ring-2 focus:ring-red-200 outline-none placeholder:text-red-300 disabled:opacity-50"
                        />
                      </div>
                    )}

                    {/* Financeiro */}
                    {!isAbsent && (
                      <div className="flex gap-2 flex-wrap md:flex-nowrap animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative w-28">
                          <span className="absolute left-2 top-6 text-xs text-gray-500 font-semibold z-10">R$</span>
                          <span className="absolute left-0 top-0 text-xs text-gray-400">Oferta</span>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={formatCurrency(state.offerValue)}
                            onChange={(e) => handleCurrencyChange(e, (val) => updateAdultFinance(adult.id, 'offerValue', val))}
                            className="w-full pl-7 pt-4 pb-1 text-sm border rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="0,00"
                          />
                        </div>
                        <div className="relative w-28">
                          <span className="absolute left-2 top-6 text-xs text-gray-500 font-semibold z-10">R$</span>
                          <span className="absolute left-0 top-0 text-xs text-gray-400">Dízimo</span>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={formatCurrency(state.titheValue)}
                            onChange={(e) => handleCurrencyChange(e, (val) => updateAdultFinance(adult.id, 'titheValue', val))}
                            className="w-full pl-7 pt-4 pb-1 text-sm border rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="0,00"
                          />
                        </div>
                        <div className="relative w-28">
                          <span className="absolute left-2 top-6 text-xs text-gray-500 font-semibold z-10">R$</span>
                          <span className="absolute left-0 top-0 text-xs text-gray-400">Missões</span>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={formatCurrency(state.missionsValue)}
                            onChange={(e) => handleCurrencyChange(e, (val) => updateAdultFinance(adult.id, 'missionsValue', val))}
                            className="w-full pl-7 pt-4 pb-1 text-sm border rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* C. Lista de Crianças (Gamificação) */}
        {kids.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Baby className="w-5 h-5 text-indigo-500" />
              Crianças (Gamificação)
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {kids.map(kid => {
                const state = kidPillars[kid.id] || { church: false, cell: false, homeWorship: false, devotional: false, challenge: false }
                
                return (
                  <div key={kid.id} className="p-4 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
                    <span className="font-medium text-gray-800">{kid.nome}</span>
                    
                    <div className="flex gap-4">
                      <button type="button" disabled={readonly} onClick={() => toggleKidPillar(kid.id, 'church')} className={`flex flex-col items-center gap-1 ${state.church ? 'opacity-100 scale-110' : 'opacity-40 grayscale'} disabled:cursor-not-allowed`}>
                        <span className="text-2xl">⛪</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500">Igreja</span>
                      </button>
                      
                      <button type="button" disabled={readonly} onClick={() => toggleKidPillar(kid.id, 'cell')} className={`flex flex-col items-center gap-1 ${state.cell ? 'opacity-100 scale-110' : 'opacity-40 grayscale'} disabled:cursor-not-allowed`}>
                        <span className="text-2xl">🏠</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500">Célula</span>
                      </button>
                      
                      <button type="button" disabled={readonly} onClick={() => toggleKidPillar(kid.id, 'devotional')} className={`flex flex-col items-center gap-1 ${state.devotional ? 'opacity-100 scale-110' : 'opacity-40 grayscale'} disabled:cursor-not-allowed`}>
                        <span className="text-2xl">📖</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500">Devocional</span>
                      </button>

                      <button type="button" disabled={readonly} onClick={() => toggleKidPillar(kid.id, 'homeWorship')} className={`flex flex-col items-center gap-1 ${state.homeWorship ? 'opacity-100 scale-110' : 'opacity-40 grayscale'} disabled:cursor-not-allowed`}>
                        <span className="text-2xl">🙏</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500">Culto Lar</span>
                      </button>

                      <button type="button" disabled={readonly} onClick={() => toggleKidPillar(kid.id, 'challenge')} className={`flex flex-col items-center gap-1 ${state.challenge ? 'opacity-100 scale-110' : 'opacity-40 grayscale'} disabled:cursor-not-allowed`}>
                        <span className="text-2xl">🎯</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500">Desafio</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 border-t pt-4">
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-gray-400 text-xs font-bold">Dízimo</span>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={formatCurrency(parseCurrency(state.titheValue))}
                            onChange={(e) => handleCurrencyChange(e, (val) => updateKidFinance(kid.id, 'titheValue', val))}
                            disabled={readonly}
                            className="w-full pl-2 pt-5 pb-1 text-sm border rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="0,00"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-gray-400 text-xs font-bold">Oferta</span>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={formatCurrency(parseCurrency(state.offerValue))}
                            onChange={(e) => handleCurrencyChange(e, (val) => updateKidFinance(kid.id, 'offerValue', val))}
                            disabled={readonly}
                            className="w-full pl-2 pt-5 pb-1 text-sm border rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="0,00"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-gray-400 text-xs font-bold">Outros</span>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={formatCurrency(parseCurrency(state.otherValue))}
                            onChange={(e) => handleCurrencyChange(e, (val) => updateKidFinance(kid.id, 'otherValue', val))}
                            disabled={readonly}
                            className="w-full pl-2 pt-5 pb-1 text-sm border rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="0,00"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-blue-400 text-xs font-bold">Missões</span>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={formatCurrency(parseCurrency(state.missionsValue))}
                            onChange={(e) => handleCurrencyChange(e, (val) => updateKidFinance(kid.id, 'missionsValue', val))}
                            disabled={readonly}
                            className="w-full pl-2 pt-5 pb-1 text-sm border rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="0,00"
                          />
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <hr className="border-gray-100" />

        {/* Visitantes */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Visitantes
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {visitors.map(visitor => (
              <div key={visitor.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-gray-100">
                <div className="flex gap-4 items-center">
                  <div>
                    <p className="font-medium text-gray-800">{visitor.name}</p>
                    <p className="text-xs text-gray-500">{visitor.phone} • {visitor.type}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeVisitor(visitor.id)}
                  disabled={readonly}
                  className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input 
                type="text" 
                value={newVisitorName}
                onChange={(e) => setNewVisitorName(e.target.value)}
                placeholder="Nome"
                disabled={readonly}
                className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
              />
              <input 
                type="text" 
                value={newVisitorPhone}
                onChange={(e) => setNewVisitorPhone(e.target.value)}
                placeholder="Telefone"
                disabled={readonly}
                className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
              />
              <select 
                value={newVisitorType}
                onChange={(e) => setNewVisitorType(e.target.value)}
                disabled={readonly}
                className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="Visitante">Visitante</option>
                <option value="Primeira Vez">Primeira Vez</option>
                <option value="Membro de Outra">Membro de Outra</option>
              </select>
              <button 
                type="button" 
                onClick={addVisitor}
                disabled={readonly}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Resumo Financeiro */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Resumo Financeiro (Conferência)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <label className="block text-sm font-medium text-green-800 mb-1">Total Ofertas + Dízimos</label>
              <div className="text-2xl font-bold text-green-700 mb-2">
                R$ {calculatedTotalOffer.toFixed(2).replace('.', ',')}
              </div>
              <div className="relative">
                 <span className="absolute left-2 top-1.5 text-sm text-gray-500 font-semibold z-10">R$</span>
                 <input 
                  type="text" 
                  inputMode="numeric"
                  value={formatCurrency(manualTotalOffer)}
                  onChange={(e) => handleCurrencyChange(e, setManualTotalOffer)}
                  placeholder="Corrigir total se necessário"
                  disabled={readonly}
                  className="w-full text-sm p-1 pl-8 bg-white border border-green-200 rounded px-2 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="block text-sm font-medium text-blue-800 mb-1">Total Missões</label>
              <div className="text-2xl font-bold text-blue-700 mb-2">
                R$ {calculatedTotalMissions.toFixed(2).replace('.', ',')}
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1.5 text-sm text-gray-500 font-semibold z-10">R$</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={formatCurrency(manualTotalMissions)}
                  onChange={(e) => handleCurrencyChange(e, setManualTotalMissions)}
                  placeholder="Corrigir total se necessário"
                  disabled={readonly}
                  className="w-full text-sm p-1 pl-8 bg-white border border-blue-200 rounded px-2 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        </section>
        </>
        )}

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Relatório salvo com sucesso!
          </div>
        )}

      </div>

      {/* D. Rodapé */}
      <div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col md:flex-row gap-4 justify-end">
        {!readonly && (
          <>
            <button 
              type="button" 
              onClick={() => handleSubmit('RASCUNHO')}
              disabled={isSubmitting || success}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FileEdit className="w-5 h-5" />
              Salvar Rascunho
            </button>

            <button 
              type="button" 
              onClick={() => handleSubmit('ENVIADO_LIDER', 'next')}
              disabled={isSubmitting || success}
              className="px-6 py-3 bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              {isMeetingCancelled ? 'Confirmar e Próxima' : 'Salvar e Próxima'}
            </button>

            <button 
              type="button" 
              onClick={() => handleSubmit('ENVIADO_LIDER')}
              disabled={isSubmitting || success}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isMeetingCancelled ? 'Confirmar Cancelamento' : 'Enviar para o Líder'}
            </button>
          </>
        )}
        
        {readonly && (
           <button 
             type="button" 
             onClick={() => router.back()}
             className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
           >
             <ArrowRight className="w-5 h-5 rotate-180" />
             Voltar
           </button>
        )}
      </div>
    </div>
  )
}
