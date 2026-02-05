'use client'

import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form'
import { Plus, Trash2, GripVertical, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export type FormFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'

export interface FormField {
  type: FormFieldType
  label: string
  required: boolean
  options?: string // Comma separated
}

interface EventFormBuilderProps {
  control: Control<any>
  register: UseFormRegister<any>
}

export function EventFormBuilder({ control, register }: EventFormBuilderProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'formConfig'
  })

  return (
    <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <List className="w-5 h-5 text-indigo-600" />
            Formulário Personalizado
          </h3>
          <p className="text-sm text-slate-500">Defina quais perguntas os inscritos devem responder.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Label htmlFor="requiresCpf" className="text-sm font-semibold text-slate-700 cursor-pointer">Exigir CPF Único?</Label>
            <Controller
                control={control}
                name="requiresCpf"
                render={({ field }) => (
                    <Switch 
                        id="requiresCpf"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
            />
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
           const type = control._formValues.formConfig[index]?.type // Watch value to conditionally show options

           return (
            <div key={field.id} className="group relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
              </div>

              <div className="pl-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Tipo de Campo */}
                <div className="md:col-span-3 space-y-1">
                  <Label className="text-xs text-slate-500">Tipo de Resposta</Label>
                  <Controller
                    control={control}
                    name={`formConfig.${index}.type`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto Curto</SelectItem>
                          <SelectItem value="textarea">Texto Longo</SelectItem>
                          <SelectItem value="select">Dropdown (Lista)</SelectItem>
                          <SelectItem value="radio">Múltipla Escolha</SelectItem>
                          <SelectItem value="checkbox">Checkbox (Sim/Não)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Pergunta */}
                <div className="md:col-span-6 space-y-1">
                  <Label className="text-xs text-slate-500">Pergunta / Label</Label>
                  <Input 
                    {...register(`formConfig.${index}.label` as const, { required: true })}
                    placeholder="Ex: Qual seu tamanho de camiseta?"
                    className="bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Obrigatório */}
                <div className="md:col-span-2 flex flex-col items-center justify-center space-y-2 pt-1">
                  <Label className="text-xs text-slate-500">Obrigatório?</Label>
                  <Controller
                    control={control}
                    name={`formConfig.${index}.required`}
                    render={({ field }) => (
                        <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                  />
                </div>

                {/* Remover */}
                <div className="md:col-span-1 flex justify-end pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Opções (Condicional) */}
                <div className="md:col-span-12 w-full">
                    {/* We need to check the current type of this field */}
                    <Controller
                        control={control}
                        name={`formConfig.${index}.type`}
                        render={({ field: { value: typeValue } }) => {
                            if (typeValue === 'select' || typeValue === 'radio') {
                                return (
                                    <div className="mt-2 bg-slate-50 p-3 rounded-lg animate-in slide-in-from-top-2">
                                        <Label className="text-xs text-slate-500 mb-1 block">Opções (separadas por vírgula)</Label>
                                        <Input 
                                            {...register(`formConfig.${index}.options` as const)}
                                            placeholder="Ex: P, M, G, GG"
                                            className="bg-white"
                                        />
                                    </div>
                                )
                            }
                            return <></>
                        }}
                    />
                </div>
              </div>
            </div>
           )
        })}
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={() => append({ type: 'text', label: '', required: false, options: '' })}
        className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Adicionar Campo Personalizado
      </Button>
    </div>
  )
}
