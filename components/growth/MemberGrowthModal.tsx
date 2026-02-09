'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { getGrowthSteps, getMemberProgress, toggleStepProgress } from '@/app/actions/growth-track'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

interface MemberGrowthModalProps {
  member: {
    id: string
    name: string | null
    image: string | null
  }
  isOpen: boolean
  onClose: () => void
}

export default function MemberGrowthModal({ member, isOpen, onClose }: MemberGrowthModalProps) {
  const [steps, setSteps] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, member.id])

  async function loadData() {
    setLoading(true)
    const [fetchedSteps, fetchedProgress] = await Promise.all([
      getGrowthSteps(),
      getMemberProgress(member.id)
    ])
    setSteps(fetchedSteps)
    setProgress(fetchedProgress)
    setLoading(false)
  }

  const handleToggle = async (stepId: string, currentStatus: boolean) => {
    setToggling(stepId)
    const newStatus = !currentStatus
    
    // Optimistic update
    if (newStatus) {
      setProgress([...progress, { stepId, status: 'COMPLETED' }])
    } else {
      setProgress(progress.filter(p => p.stepId !== stepId))
    }

    const res = await toggleStepProgress(member.id, stepId, newStatus)
    
    if (!res?.success) {
      // Revert on error
      loadData()
    }
    setToggling(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Trilho de Crescimento</h3>
            <p className="text-sm text-slate-500">Acompanhamento de {member.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : steps.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum passo definido no trilho ainda.
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
              {steps.map((step, index) => {
                const isCompleted = progress.some(p => p.stepId === step.id && p.status === 'COMPLETED')
                const isToggling = toggling === step.id
                
                return (
                  <div key={step.id} className="relative pl-12">
                    {/* Timeline Connector */}
                    <div className={cn(
                      "absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-colors z-10",
                      isCompleted ? "border-indigo-600 bg-indigo-50" : "border-slate-300"
                    )}>
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">{index + 1}</span>
                      )}
                    </div>

                    <div className={cn(
                      "p-4 rounded-xl border transition-all hover:shadow-md",
                      isCompleted 
                        ? "bg-indigo-50/50 border-indigo-200" 
                        : "bg-white border-slate-200 hover:border-indigo-300"
                    )}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <h4 className={cn(
                            "font-bold",
                            isCompleted ? "text-indigo-900" : "text-slate-700"
                          )}>
                            {step.title}
                          </h4>
                          {step.description && (
                            <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {isToggling && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                          <Switch
                            checked={isCompleted}
                            onCheckedChange={() => !isToggling && handleToggle(step.id, isCompleted)}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
