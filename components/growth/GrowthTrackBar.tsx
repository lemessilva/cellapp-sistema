'use client'

import { Check, Lock } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Step {
  id: string
  title: string
  description: string | null
  icon: string | null
  orderIndex: number
}

interface Progress {
  stepId: string
  status: string // 'COMPLETED' | 'PENDING'
}

interface GrowthTrackBarProps {
  steps: Step[]
  userProgress: Progress[]
}

export function GrowthTrackBar({ steps, userProgress }: GrowthTrackBarProps) {
  // Sort steps by order
  const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex)

  // Determine current step index (first non-completed step)
  // Or maybe the user can be "on" multiple steps? Usually it's linear.
  // We'll assume linear progression for "Next" highlighting.
  // Actually, let's just mark completed ones. The "Next" is the first one not completed.
  
  const completedStepIds = new Set(userProgress.filter(p => p.status === 'COMPLETED').map(p => p.stepId))
  
  let firstIncompleteIndex = sortedSteps.findIndex(s => !completedStepIds.has(s.id))
  if (firstIncompleteIndex === -1) firstIncompleteIndex = sortedSteps.length // All completed

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${(Math.max(0, firstIncompleteIndex) / (sortedSteps.length - 1)) * 100}%` 
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {sortedSteps.map((step, index) => {
            const isCompleted = completedStepIds.has(step.id)
            const isCurrent = index === firstIncompleteIndex
            const isLocked = index > firstIncompleteIndex

            // Resolve Icon
            const IconName = step.icon as keyof typeof LucideIcons
            const IconComponent = LucideIcons[IconName] || LucideIcons.Circle

            return (
              <div key={step.id} className="flex flex-col items-center group relative">
                {/* Icon Circle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative z-10 bg-white",
                          isCompleted && "border-indigo-600 text-indigo-600",
                          isCurrent && "border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-200 scale-110 animate-pulse",
                          isLocked && "border-slate-200 text-slate-300 bg-slate-50"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <IconComponent className="w-6 h-6" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isLocked ? (
                        <p>Conclua a etapa anterior para desbloquear.</p>
                      ) : isCompleted ? (
                        <p>Etapa concluída!</p>
                      ) : (
                        <p>Sua etapa atual: {step.title}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Title */}
                <div className="mt-4 text-center absolute top-12 w-32 -left-10">
                  <p className={cn(
                    "text-sm font-bold transition-colors",
                    isCompleted ? "text-indigo-900" : isCurrent ? "text-indigo-600" : "text-slate-400"
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 hidden md:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
