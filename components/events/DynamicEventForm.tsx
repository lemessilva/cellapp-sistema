'use client'

import { UseFormRegister, Control, Controller, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export type FormFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'

export interface FormField {
  type: FormFieldType
  label: string
  required: boolean
  options?: string
}

interface DynamicEventFormProps {
  formConfig: FormField[]
  register: UseFormRegister<any>
  control: Control<any>
  errors: FieldErrors<any>
}

export function DynamicEventForm({ formConfig, register, control, errors }: DynamicEventFormProps) {
  if (!formConfig || formConfig.length === 0) return null

  return (
    <div className="space-y-4 border-t border-slate-800 pt-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-white mb-2">Informações Adicionais</h3>
      
      {formConfig.map((field, index) => {
        // Use label as key for storage
        const fieldName = `answers.${field.label}`
        
        return (
          <div key={index} className="space-y-2">
            <Label className="text-slate-300 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            
            {field.type === 'text' && (
              <Input 
                {...register(fieldName, { required: field.required })}
                className="bg-slate-950 border-slate-800 text-white focus:border-indigo-500 transition-colors"
                placeholder="Sua resposta..."
              />
            )}

            {field.type === 'textarea' && (
              <Textarea 
                {...register(fieldName, { required: field.required })}
                className="bg-slate-950 border-slate-800 text-white focus:border-indigo-500 transition-colors"
                placeholder="Sua resposta..."
              />
            )}

            {field.type === 'select' && (
               <Controller
                 control={control}
                 name={fieldName}
                 rules={{ required: field.required }}
                 render={({ field: f }) => (
                   <Select onValueChange={f.onChange} defaultValue={f.value}>
                     <SelectTrigger className="bg-slate-950 border-slate-800 text-white w-full">
                       <SelectValue placeholder="Selecione uma opção" />
                     </SelectTrigger>
                     <SelectContent className="bg-slate-900 border-slate-800 text-white">
                       {field.options?.split(',').map(opt => (
                         <SelectItem key={opt.trim()} value={opt.trim()} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                           {opt.trim()}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 )}
               />
            )}

            {field.type === 'checkbox' && (
               <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                 <Controller
                    control={control}
                    name={fieldName}
                    rules={{ required: field.required }}
                    render={({ field: f }) => (
                        <Switch 
                            checked={f.value === 'Sim'}
                            onCheckedChange={(checked) => f.onChange(checked ? 'Sim' : 'Não')}
                            className="data-[state=checked]:bg-indigo-600"
                        />
                    )}
                 />
                 <span className="text-sm text-slate-300 font-medium">Sim, confirmo.</span>
               </div>
            )}
            
            {field.type === 'radio' && (
                <div className="space-y-2 p-2">
                    {field.options?.split(',').map((opt) => (
                        <div key={opt} className="flex items-center gap-3">
                            <input
                                type="radio"
                                id={`${fieldName}-${opt}`}
                                value={opt.trim()}
                                {...register(fieldName, { required: field.required })}
                                className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-950"
                            />
                            <Label htmlFor={`${fieldName}-${opt}`} className="text-sm text-slate-300 cursor-pointer font-normal">
                                {opt.trim()}
                            </Label>
                        </div>
                    ))}
                </div>
            )}

            {(errors.answers as any)?.[field.label] && (
              <p className="text-xs text-red-400 font-medium mt-1">Este campo é obrigatório.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}