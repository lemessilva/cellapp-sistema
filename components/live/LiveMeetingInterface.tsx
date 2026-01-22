'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { finishLiveMeeting } from '@/app/actions/live-meeting'
import { toast } from 'sonner'
import { Loader2, Check, X, DollarSign, Clock, Users, StopCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

interface LiveMeetingInterfaceProps {
  user: any
  data: {
    report: any
    members: any[]
  }
}

export function LiveMeetingInterface({ user, data }: LiveMeetingInterfaceProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState('00:00:00')
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  
  // Initialize state from existing data if any (though usually fresh start)
  const [attendance, setAttendance] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    data.members.forEach(m => {
      // Check if already in report attendance
      const existing = data.report.attendance.find((a: any) => a.userId === m.id)
      initial[m.id] = {
        status: existing?.status || 'P',
        offerValue: existing?.offerValue || '',
        titheValue: existing?.titheValue || '',
        missionsValue: existing?.missionsValue || '',
        otherValue: existing?.otherValue || ''
      }
    })
    return initial
  })

  // Timer
  useEffect(() => {
    const startedAt = new Date(data.report.startedAt).getTime()
    
    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = now - startedAt
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    const interval = setInterval(updateTimer, 1000)
    updateTimer() // Initial call

    return () => clearInterval(interval)
  }, [data.report.startedAt])

  const toggleStatus = (userId: string) => {
    setAttendance(prev => {
      const current = prev[userId].status
      const newStatus = current === 'P' ? 'F' : 'P'
      
      // If Absent, clear financials? The prompt says "Se status == 'F', ofertaValor... deve ser setado para 0".
      // Let's apply this rule here too.
      const newState = { ...prev[userId], status: newStatus }
      if (newStatus === 'F') {
          newState.offerValue = ''
          newState.titheValue = ''
          newState.missionsValue = ''
          newState.otherValue = ''
      }
      return { ...prev, [userId]: newState }
    })
  }

  const updateFinancial = (userId: string, field: string, value: string) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }))
  }

  const handleFinish = async () => {
    if (!confirm('Deseja realmente encerrar a célula?')) return

    setLoading(true)
    
    // Calculate totals just for cache/display? Backend does it too.
    const result = await finishLiveMeeting(data.report.id, attendance, { offer: 0, missions: 0 })
    
    if (result.success) {
      toast.success('Célula finalizada com sucesso!')
      router.push('/app/celula')
    } else {
      toast.error(result.error || 'Erro ao finalizar')
    }
    setLoading(false)
  }

  const toggleExpand = (userId: string) => {
    setExpandedMember(expandedMember === userId ? null : userId)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header Imersivo */}
      <div className="bg-slate-800 p-6 shadow-lg border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex flex-col items-center gap-2">
          <div className="text-slate-400 text-xs font-bold tracking-wider uppercase">Em Andamento</div>
          <div className="text-5xl font-mono font-bold tracking-widest text-green-400 drop-shadow-lg">
            {elapsed}
          </div>
          <button 
            onClick={handleFinish}
            disabled={loading}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <StopCircle className="w-5 h-5" />}
            ENCERRAR CÉLULA
          </button>
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-3">
          <h2 className="text-slate-400 font-medium text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            PARTICIPANTES ({data.members.length})
          </h2>

          {data.members.map((member: any) => {
            const state = attendance[member.id]
            const isPresent = state.status === 'P'
            const isExpanded = expandedMember === member.id

            return (
              <div 
                key={member.id} 
                className={`
                  bg-slate-800 rounded-xl border transition-all duration-200
                  ${isPresent ? 'border-slate-700' : 'border-red-900/50 bg-red-900/10'}
                `}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Avatar & Info */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${isPresent ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}
                    `}>
                      {member.photoUrl ? (
                          <Image src={member.photoUrl} alt={member.nome} width={40} height={40} className="rounded-full" />
                      ) : (
                          member.nome.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className={`font-medium ${isPresent ? 'text-white' : 'text-slate-500 line-through'}`}>
                        {member.nome}
                      </div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                  </div>

                  {/* Toggle Presence */}
                  <button
                    onClick={() => toggleStatus(member.id)}
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                      ${isPresent ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-slate-700 text-slate-500 hover:bg-slate-600'}
                    `}
                  >
                    {isPresent ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                  </button>
                  
                  {/* Expand Financials */}
                  {isPresent && (
                      <button 
                        onClick={() => toggleExpand(member.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 ${isExpanded ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}
                      >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                      </button>
                  )}
                </div>

                {/* Financial Inputs (Drawer) */}
                {isPresent && isExpanded && (
                  <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-slate-500 font-bold">Oferta</label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-slate-500 text-xs">R$</span>
                                <input 
                                    type="number" 
                                    placeholder="0,00"
                                    value={state.offerValue}
                                    onChange={(e) => updateFinancial(member.id, 'offerValue', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-7 pr-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-slate-500 font-bold">Dízimo</label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-slate-500 text-xs">R$</span>
                                <input 
                                    type="number" 
                                    placeholder="0,00"
                                    value={state.titheValue}
                                    onChange={(e) => updateFinancial(member.id, 'titheValue', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-7 pr-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-slate-500 font-bold">Missões</label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-slate-500 text-xs">R$</span>
                                <input 
                                    type="number" 
                                    placeholder="0,00"
                                    value={state.missionsValue}
                                    onChange={(e) => updateFinancial(member.id, 'missionsValue', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-7 pr-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-slate-500 font-bold">Outros</label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-slate-500 text-xs">R$</span>
                                <input 
                                    type="number" 
                                    placeholder="0,00"
                                    value={state.otherValue}
                                    onChange={(e) => updateFinancial(member.id, 'otherValue', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-7 pr-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
