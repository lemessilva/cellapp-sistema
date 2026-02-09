'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, GripVertical, Trash2, Edit2, Droplets, BookOpen, User, Star, Heart, Award, CheckCircle } from 'lucide-react'
import { createGrowthStep, updateGrowthStep, updateGrowthStepOrder, deleteGrowthStep } from '@/app/actions/growth-track'
import * as LucideIcons from 'lucide-react'

interface Step {
  id: string
  title: string
  description: string | null
  icon: string | null
  orderIndex: number
  isMandatory: boolean
}

const AVAILABLE_ICONS = [
  { name: 'Droplets', icon: Droplets, label: 'Batismo' },
  { name: 'BookOpen', icon: BookOpen, label: 'Curso' },
  { name: 'User', icon: User, label: 'Membro' },
  { name: 'Star', icon: Star, label: 'Liderança' },
  { name: 'Heart', icon: Heart, label: 'Serviço' },
  { name: 'Award', icon: Award, label: 'Conclusão' },
  { name: 'CheckCircle', icon: CheckCircle, label: 'Check' }
]

export default function GrowthTrackManager({ initialSteps }: { initialSteps: Step[] }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingStep, setEditingStep] = useState<Step | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', icon: 'BookOpen' })

  const handleSave = async () => {
    if (!formData.title) return toast.error('O título é obrigatório')
    
    setLoading(true)

    if (editingStep) {
        const res = await updateGrowthStep(editingStep.id, formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else if (res.step) {
            toast.success('Passo atualizado!')
            const updatedStep = { ...res.step, icon: res.step.icon || null }
            setSteps(steps.map(s => s.id === editingStep.id ? updatedStep : s))
            closeModal()
        }
    } else {
        const res = await createGrowthStep(formData)
        setLoading(false)
        
        if (res.error) {
            toast.error(res.error)
        } else if (res.step) {
            toast.success('Passo criado com sucesso!')
            const createdStep = { ...res.step, icon: res.step.icon || null }
            setSteps([...steps, createdStep])
            closeModal()
        }
    }
  }

  const openNewModal = () => {
    setEditingStep(null)
    setFormData({ title: '', description: '', icon: 'BookOpen' })
    setIsModalOpen(true)
  }

  const openEditModal = (step: Step) => {
    setEditingStep(step)
    setFormData({ 
        title: step.title, 
        description: step.description || '', 
        icon: step.icon || 'BookOpen' 
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStep(null)
    setFormData({ title: '', description: '', icon: 'BookOpen' })
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
          onClick={openNewModal}
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
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    {(() => {
                        const IconComponent = AVAILABLE_ICONS.find(i => i.name === step.icon)?.icon || BookOpen
                        return <IconComponent className="w-4 h-4" />
                    })()}
                  </span>
                  {step.title}
                  {step.isMandatory && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Obrigatório
                    </span>
                  )}
                </h3>
                {step.description && (
                  <p className="text-sm text-slate-500 mt-1 ml-10">{step.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(step)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
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

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStep ? 'Editar Passo' : 'Novo Passo do Trilho'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título do Passo
                </label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Batismo, Escola de Líderes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do que é necessário para concluir..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setFormData({ ...formData, icon: item.name })}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        formData.icon === item.name
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-indigo-300 text-slate-500'
                      }`}
                    >
                      <item.icon className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Salvando...' : (editingStep ? 'Salvar Alterações' : 'Criar Passo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
