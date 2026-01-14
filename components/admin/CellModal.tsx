'use client'

import { useState, useEffect } from 'react'
import { X, Check, MapPin, Calendar, Clock } from 'lucide-react'
import { saveCell, getUsersForSelection, getSupervisorStats } from '@/app/(protected)/admin/celulas/actions'
import { toast } from 'sonner'
import UserMultiSelect from '@/components/UserMultiSelect'

type Cell = {
  id?: string
  nome: string
  dia_reuniao: string | null
  horario: string | null
  endereco: string | null
  liderId?: string | null
  lider2Id?: string | null
  supervisorId?: string | null
  supervisor2Id?: string | null
  tesoureiroId?: string | null
  intercessorId?: string | null
  secretarioId?: string | null
  eventosId?: string | null
  louvorId?: string | null
}

type UserOption = {
  id: string
  nome: string
  role: string
  foto_url?: string | null
  celulaId?: string | null
}

interface CellModalProps {
  cell?: Cell | null
  isOpen: boolean
  onClose: () => void
}

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
]

export default function CellModal({ cell, isOpen, onClose }: CellModalProps) {
  const [nome, setNome] = useState('')
  const [diaReuniao, setDiaReuniao] = useState('')
  const [horario, setHorario] = useState('')
  const [endereco, setEndereco] = useState('')
  
  // State for Multi-select
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([])
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([])

  // State for Roles
  const [tesoureiroId, setTesoureiroId] = useState('')
  const [intercessorId, setIntercessorId] = useState('')
  const [secretarioId, setSecretarioId] = useState('')
  const [eventosId, setEventosId] = useState('')
  const [louvorId, setLouvorId] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [users, setUsers] = useState<UserOption[]>([])
  
  // Supervisor Confirmation State
  const [showSupervisorConfirm, setShowSupervisorConfirm] = useState(false)
  const [pendingSupervisorId, setPendingSupervisorId] = useState('')
  const [supervisorStats, setSupervisorStats] = useState<{ id: string, nome: string }[]>([])
  const [checkingSupervisor, setCheckingSupervisor] = useState(false)

  useEffect(() => {
    if (isOpen) {
      getUsersForSelection().then(setUsers)
      
      if (cell) {
        setNome(cell.nome)
        setDiaReuniao(cell.dia_reuniao || '')
        setHorario(cell.horario || '')
        setEndereco(cell.endereco || '')
        
        const leaders = [cell.liderId, cell.lider2Id].filter(Boolean) as string[]
        setSelectedLeaders(leaders)
        
        const supervisors = [cell.supervisorId, cell.supervisor2Id].filter(Boolean) as string[]
        setSelectedSupervisors(supervisors)

        setTesoureiroId(cell.tesoureiroId || '')
        setIntercessorId(cell.intercessorId || '')
        setSecretarioId(cell.secretarioId || '')
        setEventosId(cell.eventosId || '')
        setLouvorId(cell.louvorId || '')
      } else {
        // Reset form for new cell
        setNome('')
        setDiaReuniao('Quarta-feira') // Default
        setHorario('')
        setEndereco('')
        setSelectedLeaders([])
        setSelectedSupervisors([])
        
        setTesoureiroId('')
        setIntercessorId('')
        setSecretarioId('')
        setEventosId('')
        setLouvorId('')
      }
    }
  }, [cell, isOpen])

  const handleSupervisorSelect = async (userId: string) => {
    // Only verify if adding a new one
    setPendingSupervisorId(userId)
    setCheckingSupervisor(true)
    
    try {
        const { supervisedCells } = await getSupervisorStats(userId)
        setSupervisorStats(supervisedCells)
        setShowSupervisorConfirm(true)
    } catch (error) {
        console.error(error)
        toast.error('Erro ao verificar supervisor')
    } finally {
        setCheckingSupervisor(false)
    }
  }

  const confirmSupervisor = () => {
    // We actually add it here? No, UserMultiSelect handles the addition visually immediately?
    // Wait, UserMultiSelect logic: onChange is called with NEW array.
    // If I want to intercept, I need to NOT update state until confirmed.
    // But MultiSelect is controlled.
    
    // Logic: 
    // User selects -> onSelect prop triggers -> we check stats -> show modal.
    // The visual update happens via onChange.
    // So:
    // 1. User clicks item in dropdown.
    // 2. We need to decide whether to update state NOW or AFTER confirm.
    // Let's modify UserMultiSelect to rely on parent for state update? Yes it does (onChange).
    // But `handleSelect` in UserMultiSelect calls `onChange`.
    // We should probably just let it update visually and show warning?
    // Or block update?
    
    // The user requirement: "Ao selecionar uma pessoa... exiba essa pessoa".
    // Supervisor warning is about "Confirmar Supervisor?".
    // If I select, I want to see the warning.
    
    // Let's allow the state update, BUT show the modal.
    // If cancelled, we remove the ID.
    
    setShowSupervisorConfirm(false)
    setPendingSupervisorId('')
    setSupervisorStats([])
  }

  const cancelSupervisor = () => {
    // Remove the pending ID from selection
    setSelectedSupervisors(prev => prev.filter(id => id !== pendingSupervisorId))
    
    setShowSupervisorConfirm(false)
    setPendingSupervisorId('')
    setSupervisorStats([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation for Role Exclusivity
    // Check overlap between arrays
    const overlap = selectedLeaders.filter(l => selectedSupervisors.includes(l))
    if (overlap.length > 0) {
        toast.error('O mesmo usuário não pode ser Líder e Supervisor simultaneamente.')
        return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    if (cell?.id) {
        formData.append('id', cell.id)
    }
    formData.append('nome', nome)
    formData.append('dia_reuniao', diaReuniao)
    formData.append('horario', horario)
    formData.append('endereco', endereco)
    
    if (selectedLeaders[0]) formData.append('liderId', selectedLeaders[0])
    if (selectedLeaders[1]) formData.append('lider2Id', selectedLeaders[1])
        
    if (selectedSupervisors[0]) formData.append('supervisorId', selectedSupervisors[0])
    if (selectedSupervisors[1]) formData.append('supervisor2Id', selectedSupervisors[1])

    formData.append('tesoureiroId', tesoureiroId)
    formData.append('intercessorId', intercessorId)
    formData.append('secretarioId', secretarioId)
    formData.append('eventosId', eventosId)
    formData.append('louvorId', louvorId)

    try {
      const result = await saveCell(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(cell?.id ? 'Célula atualizada!' : 'Célula criada com sucesso!')
        onClose()
      }
    } catch (error) {
      toast.error('Erro inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {cell?.id ? 'Editar Célula' : 'Nova Célula'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Célula</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Célula Morumbi"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="border-t pt-4 space-y-6">
             <div>
                <UserMultiSelect
                    label="Líder(es)"
                    users={users}
                    selectedIds={selectedLeaders}
                    onChange={setSelectedLeaders}
                    maxSelections={2}
                    placeholder="Buscar líder..."
                />
                <p className="text-xs text-slate-500 mt-1">
                    Nota: Um usuário só pode liderar uma célula por vez.
                </p>
             </div>

             <div>
                <UserMultiSelect
                    label="Supervisor(es)"
                    users={users}
                    selectedIds={selectedSupervisors}
                    onChange={setSelectedSupervisors}
                    maxSelections={2}
                    placeholder="Buscar supervisor..."
                    onSelect={handleSupervisorSelect}
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
              {!isSubmitting && <Check className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Modal de Confirmação do Supervisor */}
        {showSupervisorConfirm && (
            <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4 rounded-xl backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 animate-in zoom-in-95 duration-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar Supervisor?</h3>
                    <p className="text-slate-600 mb-4 text-sm">
                        Deseja definir <span className="font-bold text-slate-900">{users.find(u => u.id === pendingSupervisorId)?.nome}</span> como supervisor desta célula?
                    </p>
                    
                    <div className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Atualmente supervisiona:</p>
                        {supervisorStats.length > 0 ? (
                            <ul className="space-y-1">
                                {supervisorStats.map(s => (
                                    <li key={s.id} className="text-sm text-slate-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        {s.nome}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Nenhuma célula.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={cancelSupervisor}
                            className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmSupervisor}
                            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}
