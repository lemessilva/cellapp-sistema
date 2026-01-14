'use client'

import { useState } from 'react'
import { updateCellSettings } from '@/app/actions/settings'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialData: any
  members: any[]
}

export function CellSettingsModal({ isOpen, onClose, initialData, members }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dia_reuniao: initialData.dia_reuniao || '',
    horario: initialData.horario || '',
    endereco: initialData.endereco || '',
    tesoureiroId: initialData.tesoureiroId || '',
    secretarioId: initialData.secretarioId || '',
    louvorId: initialData.louvorId || '',
    eventosId: initialData.eventosId || '',
    mcpId: initialData.mcpId || '',
    intercessaoId: initialData.intercessorId || ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const result = await updateCellSettings(initialData.id, {
        ...formData
    })

    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Configurações salvas!')
      onClose()
    }
  }

  if (!isOpen) return null

  const roleFields = ['tesoureiroId', 'secretarioId', 'louvorId', 'eventosId', 'mcpId', 'intercessaoId']

  const renderMemberSelect = (label: string, field: keyof typeof formData) => {
    // Calcular IDs já usados em outros campos
    const usedIds = roleFields
        .filter(f => f !== field) // Ignora o campo atual
        .map(f => (formData as any)[f]) // Pega o valor
        .filter(Boolean) // Remove vazios

    // Filtra membros: Mantém se não estiver usado OU se for o valor atual deste campo
    const availableMembers = members.filter(m => !usedIds.includes(m.id))

    return (
        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select 
            value={formData[field]} 
            onChange={e => setFormData({...formData, [field]: e.target.value})} 
            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
            <option value="">Selecione...</option>
            {availableMembers.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Configurações da Célula</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Seção 0: Liderança (Read-only) */}
          <div className="space-y-4">
            <h4 className="font-bold text-indigo-900 border-b pb-2">Liderança</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Líder</label>
                    <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium">
                        {initialData.lider?.nome || 'Não definido'}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor</label>
                    <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium">
                        {initialData.supervisor?.nome || 'Não definido'}
                    </div>
                </div>
            </div>
          </div>

          {/* Seção 1: Geral */}
          <div className="space-y-4">
            <h4 className="font-bold text-indigo-900 border-b pb-2">Geral</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dia da Reunião</label>
                <select 
                  value={formData.dia_reuniao}
                  onChange={e => setFormData({...formData, dia_reuniao: e.target.value})}
                  className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Selecione...</option>
                  <option value="Segunda-feira">Segunda-feira</option>
                  <option value="Terça-feira">Terça-feira</option>
                  <option value="Quarta-feira">Quarta-feira</option>
                  <option value="Quinta-feira">Quinta-feira</option>
                  <option value="Sexta-feira">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                <input 
                  type="time" 
                  value={formData.horario}
                  onChange={e => setFormData({...formData, horario: e.target.value})}
                  className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Equipe Fixa */}
          <div className="space-y-4">
            <h4 className="font-bold text-indigo-900 border-b pb-2">Equipe Fixa</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderMemberSelect("Tesoureiro", "tesoureiroId")}
              {renderMemberSelect("Secretário", "secretarioId")}
              {renderMemberSelect("Louvor", "louvorId")}
              {renderMemberSelect("Eventos", "eventosId")}
              {renderMemberSelect("MCP", "mcpId")}
              {renderMemberSelect("Intercessão", "intercessaoId")}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-sm shadow-indigo-200 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
