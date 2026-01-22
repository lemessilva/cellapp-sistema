'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { finishLiveMeeting } from '@/app/actions/live-meeting'
import { toast } from 'sonner'
import { Loader2, Check, X, DollarSign, Clock, Users, StopCircle, ChevronDown, ChevronUp, Baby, BookOpen, Home, Trophy, Church } from 'lucide-react'
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
    data.members.forEach((m: any) => {
      if (m.categoria === 'CRIANCA') {
        const existing = data.report.kidsPillars?.find((k: any) => k.userId === m.id)
        initial[m.id] = {
          isKid: true,
          status: existing?.cell ? 'P' : 'F', // Cell pillar implies presence in meeting
          church: existing?.church || false,
          cell: existing?.cell || true, // Default true for cell if new? Or false? Default Present usually.
          homeWorship: existing?.homeWorship || false,
          devotional: existing?.devotional || false,
          challenge: existing?.challenge || false,
          offerValue: existing?.offerValue || '',
          titheValue: existing?.titheValue || '',
          missionsValue: existing?.missionsValue || '',
          otherValue: existing?.otherValue || ''
        }
      } else {
        // Adult
        const existing = data.report.attendance?.find((a: any) => a.userId === m.id)
        initial[m.id] = {
          isKid: false,
          status: existing?.status || 'P',
          offerValue: existing?.offerValue || '',
          titheValue: existing?.titheValue || '',
          missionsValue: existing?.missionsValue || '',
          otherValue: existing?.otherValue || ''
        }
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
      const state = prev[userId]
      
      if (state.isKid) {
          const newStatus = state.status === 'P' ? 'F' : 'P'
          const newState = { 
              ...state, 
              status: newStatus,
              cell: newStatus === 'P' 
          }
          if (newStatus === 'F') {
              newState.offerValue = ''
              newState.titheValue = ''
              newState.missionsValue = ''
              newState.otherValue = ''
          }
          return { ...prev, [userId]: newState }
      } else {
          const current = state.status
          const newStatus = current === 'P' ? 'F' : 'P'
          const newState = { ...state, status: newStatus }
          if (newStatus === 'F') {
              newState.offerValue = ''
              newState.titheValue = ''
              newState.missionsValue = ''
              newState.otherValue = ''
          }
          return { ...prev, [userId]: newState }
      }
    })
  }

  const togglePillar = (userId: string, pillar: string) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [pillar]: !prev[userId][pillar] }
    }))
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
            const isKid = state.isKid

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
                      ${isPresent ? (isKid ? 'bg-pink-600 text-white' : 'bg-indigo-600 text-white') : 'bg-slate-700 text-slate-400'}
                    `}>
                      {member.photoUrl ? (
                          <Image src={member.photoUrl} alt={member.nome} width={40} height={40} className="rounded-full" />
                      ) : (
                          isKid ? <Baby className="w-5 h-5" /> : member.nome.charAt(0)
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
                    
                    {/* Kids Pillars */}
                    {isKid && (
                        <div className="mb-4 grid grid-cols-4 gap-2">
                            <button
                                onClick={() => togglePillar(member.id, 'church')}
                                className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${state.church ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700/50 text-slate-500 border border-slate-700'}`}
                            >
                                <Church className="w-4 h-4" />
                                CULTO
                            </button>
                            <button
                                onClick={() => togglePillar(member.id, 'homeWorship')}
                                className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${state.homeWorship ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-700/50 text-slate-500 border border-slate-700'}`}
                            >
                                <Home className="w-4 h-4" />
                                CULTO LAR
                            </button>
                            <button
                                onClick={() => togglePillar(member.id, 'devotional')}
                                className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${state.devotional ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-slate-700/50 text-slate-500 border border-slate-700'}`}
                            >
                                <BookOpen className="w-4 h-4" />
                                DEVOC.
                            </button>
                            <button
                                onClick={() => togglePillar(member.id, 'challenge')}
                                className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${state.challenge ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-700/50 text-slate-500 border border-slate-700'}`}
                            >
                                <Trophy className="w-4 h-4" />
                                DESAFIO
                            </button>
                        </div>
                    )}

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
