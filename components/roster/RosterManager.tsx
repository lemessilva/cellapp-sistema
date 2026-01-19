'use client'

import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, setDate, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Save, MapPin, User, Calendar, Loader2, RefreshCw } from 'lucide-react'
import { getRoster, upsertRoster, geocodeAddress } from '@/app/actions/roster'
import { toast } from 'sonner'

interface Props {
  cellId: string
  defaultMeetingDay: string
  defaultAddress: string
  members: any[]
  onOpenSettings: () => void
}

const WEEKDAYS: Record<string, number> = {
  'Domingo': 0,
  'Segunda-feira': 1,
  'Terça-feira': 2,
  'Quarta-feira': 3,
  'Quinta-feira': 4,
  'Sexta-feira': 5,
  'Sábado': 6
}

export default function RosterManager({ cellId, defaultMeetingDay, defaultAddress, members, onOpenSettings }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [rosters, setRosters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({})
  const [geocodingMap, setGeocodingMap] = useState<Record<string, boolean>>({})

  // Form state for each date key (YYYY-MM-DD)
  const [forms, setForms] = useState<Record<string, any>>({})

  const meetingDayIndex = defaultMeetingDay ? WEEKDAYS[defaultMeetingDay] : -1

  useEffect(() => {
    fetchRosters()
  }, [currentMonth, cellId])

  const fetchRosters = async () => {
    setLoading(true)
    const month = currentMonth.getMonth() + 1
    const year = currentMonth.getFullYear()
    
    const res = await getRoster(cellId, month, year)
    
    if (res.rosters) {
      setRosters(res.rosters)
      // Initialize forms with fetched data
      const newForms: Record<string, any> = {}
      res.rosters.forEach((r: any) => {
        const dateKey = new Date(r.date).toISOString().split('T')[0]
        newForms[dateKey] = {
          directionMemberId: r.directionMemberId || '',
          worshipMemberId: r.worshipMemberId || '',
          evangelismMemberId: r.evangelismMemberId || '',
          hostMemberId: r.hostMemberId || '',
          customAddress: r.customAddress || '',
          latitude: r.latitude,
          longitude: r.longitude
        }
      })
      setForms(prev => ({ ...prev, ...newForms }))
    }
    setLoading(false)
  }

  const getMeetingDates = () => {
    if (meetingDayIndex === -1) return []

    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    
    const days = eachDayOfInterval({ start, end })
    return days.filter(day => getDay(day) === meetingDayIndex)
  }

  const handleInputChange = (dateKey: string, field: string, value: string) => {
    setForms(prev => {
      const currentForm = prev[dateKey] || {}
      let updates = { [field]: value }

      // Auto-fill address logic when Host changes
      if (field === 'hostMemberId') {
        if (value === '') {
            // Reset to default (optional, maybe keep manual edit?)
            // Let's keep it simple: if cleared, we don't clear address automatically unless we want to revert to "default"
        } else {
            const member = members.find(m => m.id === value)
            if (member) {
                // Construct address from member profile
                const parts = [
                    member.endereco, 
                    member.numero, 
                    member.bairro, 
                    member.cidade
                ].filter(Boolean)
                
                if (parts.length > 0) {
                    updates = {
                        ...updates,
                        customAddress: parts.join(', '),
                        latitude: member.latitude || null,
                        longitude: member.longitude || null
                    }
                }
            }
        }
      }

      return {
        ...prev,
        [dateKey]: {
          ...currentForm,
          ...updates
        }
      }
    })
  }

  const handleManualGeocode = async (dateKey: string) => {
    const address = forms[dateKey]?.customAddress
    if (!address) {
        toast.error('Digite um endereço para buscar as coordenadas.')
        return
    }

    setGeocodingMap(prev => ({ ...prev, [dateKey]: true }))
    const result = await geocodeAddress(address)
    setGeocodingMap(prev => ({ ...prev, [dateKey]: false }))

    if (result) {
        setForms(prev => ({
            ...prev,
            [dateKey]: {
                ...prev[dateKey],
                latitude: result.lat,
                longitude: result.lon
            }
        }))
        toast.success('Coordenadas atualizadas com sucesso!')
    } else {
        toast.error('Endereço não encontrado. Tente ser mais específico.')
    }
  }

  const handleSave = async (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    setSavingMap(prev => ({ ...prev, [dateKey]: true }))
    
    const formData = forms[dateKey] || {}
    
    const res = await upsertRoster({
      cellId,
      date,
      ...formData
    })

    setSavingMap(prev => ({ ...prev, [dateKey]: false }))

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Escala salva com sucesso!')
      fetchRosters() // Refresh to sync IDs if needed
    }
  }

  if (meetingDayIndex === -1) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700">Dia de Reunião não definido</h3>
        <p className="text-slate-500 text-sm mb-4">Para gerar a escala, configure o dia da semana da sua célula.</p>
        <button 
          onClick={onOpenSettings}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
        >
          Configurar Célula
        </button>
      </div>
    )
  }

  const meetingDates = getMeetingDates()

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* List of Weeks */}
      <div className="space-y-4">
        {loading && rosters.length === 0 ? (
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-slate-400 mt-2 text-sm">Carregando escala...</p>
          </div>
        ) : meetingDates.map((date) => {
          const dateKey = date.toISOString().split('T')[0]
          const form = forms[dateKey] || {}
          const isSaving = savingMap[dateKey]
          const isGeocoding = geocodingMap[dateKey]
          const hasCoords = form.latitude && form.longitude

          return (
            <div key={dateKey} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                    {format(date, 'dd/MM')}
                  </div>
                  <span className="text-sm font-medium text-slate-600 capitalize">
                    {format(date, 'EEEE', { locale: ptBR })}
                  </span>
                </div>
                <button 
                  onClick={() => handleSave(date)}
                  disabled={isSaving}
                  className="flex items-center gap-2 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Salvar
                </button>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Direction */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Direção
                  </label>
                  <select 
                    value={form.directionMemberId || ''} 
                    onChange={e => handleInputChange(dateKey, 'directionMemberId', e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>

                {/* Worship */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Louvor
                  </label>
                  <select 
                    value={form.worshipMemberId || ''} 
                    onChange={e => handleInputChange(dateKey, 'worshipMemberId', e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>

                {/* Evangelism */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Palavra/Oferta
                  </label>
                  <select 
                    value={form.evangelismMemberId || ''} 
                    onChange={e => handleInputChange(dateKey, 'evangelismMemberId', e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>

                {/* Host */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Anfitrião
                  </label>
                  <select 
                    value={form.hostMemberId || ''} 
                    onChange={e => handleInputChange(dateKey, 'hostMemberId', e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                  >
                    <option value="">Padrão da Célula</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Local da Reunião
                  </label>
                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={form.customAddress || ''}
                        onChange={e => handleInputChange(dateKey, 'customAddress', e.target.value)}
                        placeholder={defaultAddress ? `Padrão: ${defaultAddress}` : 'Digite o endereço...'}
                        className="flex-1 text-sm p-2 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                    />
                    <button
                        onClick={() => handleManualGeocode(dateKey)}
                        disabled={isGeocoding || !form.customAddress}
                        className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 text-xs font-bold
                            ${hasCoords 
                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        title="Atualizar Coordenadas"
                    >
                        {isGeocoding ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className={`w-4 h-4 ${hasCoords ? 'text-green-600' : 'text-slate-400'}`} />
                        )}
                        {hasCoords ? 'Atualizado' : 'Buscar GPS'}
                    </button>
                  </div>
                  {hasCoords && (
                      <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Coordenadas salvas: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                      </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
