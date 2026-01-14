'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, GripVertical, Trash2, Edit2 } from 'lucide-react'
import { createGrowthStep, updateGrowthStepOrder, deleteGrowthStep } from '@/app/actions/growth-track'

interface Step {
  id: string
  title: string
  description: string | null
  orderIndex: number
  isMandatory: boolean
}

export default function GrowthTrackManager({ initialSteps }: { initialSteps: Step[] }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newStep, setNewStep] = useState({ title: '', description: '' })

  const handleCreate = async () => {
    if (!newStep.title) return toast.error('O título é obrigatório')
    
    setLoading(true)
    const res = await createGrowthStep(newStep)
    setLoading(false)
    
    if (res.error) {
      toast.error(res.error)
    } else if (res.step) {
      toast.success('Passo criado com sucesso!')
      setSteps([...steps, res.step])
      setIsModalOpen(false)
      setNewStep({ title: '', description: '' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este passo?')) return

    const res = await deleteGrowthStep(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Passo removido!')
      setSteps(steps.filter(s => s.id !== id))
    }
  }

  const moveStep = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === steps.length - 1) return

    const newSteps = [...steps]
    const temp = newSteps[index]
    newSteps[index] = newSteps[index + (direction === 'up' ? -1 : 1)]
    newSteps[index + (direction === 'up' ? -1 : 1)] = temp

    // Update orderIndex for all
    const updatedSteps = newSteps.map((s, i) => ({ ...s, orderIndex: i + 1 }))
    setSteps(updatedSteps)

    // Save to server
    const payload = updatedSteps.map(s => ({ id: s.id, orderIndex: s.orderIndex }))
    await updateGrowthStepOrder(payload)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Passos do Trilho</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Passo
        </button>
      </div>

      <div className="space-y-3">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            Nenhum passo cadastrado. Comece adicionando o primeiro!
          </div>
        ) : (
          steps.map((step, index) => (
            <div 
              key={step.id}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors group"
            >
              <div className="flex flex-col gap-1 text-slate-400">
                <button 
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  className="hover:text-indigo-600 disabled:opacity-30"
                >
                  ▲
                </button>
                <button 
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === steps.length - 1}
                  className="hover:text-indigo-600 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {step.title}
                  {step.isMandatory && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Obrigatório
                    </span>
                  )}
                </h3>
                {step.description && (
                  <p className="text-sm text-slate-500 mt-1 ml-8">{step.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDelete(step.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Novo Passo do Trilho</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título do Passo
                </label>
                <input 
                  type="text" 
                  value={newStep.title}
                  onChange={e => setNewStep({ ...newStep, title: e.target.value })}
                  placeholder="Ex: Batismo, Escola de Líderes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea 
                  value={newStep.description}
                  onChange={e => setNewStep({ ...newStep, description: e.target.value })}
                  placeholder="O que o membro precisa fazer neste passo?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Adicionar Passo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
