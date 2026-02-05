'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/app/actions/events'
import { toast } from 'sonner'
import { Loader2, Calendar, MapPin, DollarSign, Image as ImageIcon, Users } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { EventFormBuilder, FormField } from './EventFormBuilder'

interface EventFormData {
  title: string
  date: string
  location: string
  price: number
  maxCapacity: number | null
  registrationDeadline: string | null
  description: string
  bannerUrl: string
  bannerFile: FileList | null
  coverFile: FileList | null
  formConfig: FormField[]
  requiresCpf: boolean
}

export function EventForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      price: 0,
      requiresCpf: false,
      formConfig: []
    }
  })

  async function onSubmit(data: EventFormData) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('date', data.date)
      formData.append('location', data.location)
      formData.append('price', data.price.toString())
      if (data.maxCapacity) formData.append('maxCapacity', data.maxCapacity.toString())
      if (data.registrationDeadline) formData.append('registrationDeadline', data.registrationDeadline)
      formData.append('description', data.description)
      if (data.bannerUrl) formData.append('bannerUrl', data.bannerUrl)
      
      if (data.bannerFile && data.bannerFile[0]) {
        formData.append('bannerFile', data.bannerFile[0])
      }
       if (data.coverFile && data.coverFile[0]) {
        formData.append('coverFile', data.coverFile[0])
      }
      
      formData.append('formConfig', JSON.stringify(data.formConfig))
      formData.append('requiresCpf', data.requiresCpf.toString())

      const result = await createEvent(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Evento criado com sucesso!')
        router.push('/admin/eventos')
      }
    } catch (error) {
      toast.error('Erro ao criar evento')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Título do Evento *</label>
          <input 
            {...register('title', { required: true })}
            placeholder="Ex: Retiro de Jovens 2024"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.title && <span className="text-xs text-red-500">Obrigatório</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" /> Data e Hora *
          </label>
          <input 
            type="datetime-local" 
            {...register('date', { required: true })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
           {errors.date && <span className="text-xs text-red-500">Obrigatório</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" /> Local
          </label>
          <input 
            {...register('location')}
            placeholder="Ex: Chácara Recanto Feliz"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" /> Valor (R$)
          </label>
          <input 
            type="number" 
            {...register('price')}
            min="0" 
            step="0.01" 
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-slate-500">Deixe 0 para gratuito.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" /> Limite de Vagas
          </label>
          <input 
            type="number" 
            {...register('maxCapacity')}
            min="1" 
            placeholder="Ilimitado"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" /> Encerramento Inscrições
          </label>
          <input 
            type="datetime-local" 
            {...register('registrationDeadline')}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-slate-500">Deixe em branco se não houver prazo.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" /> Banner
          </label>
          <input 
            type="file"
            {...register('bannerFile')}
            accept="image/*"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-slate-500">
            📏 Tamanho recomendado: 1280x720px (Padrão YouTube). Formatos: JPG ou PNG.
          </p>
          {/* Fallback URL input if needed */}
          <input 
            {...register('bannerUrl')}
            placeholder="Ou cole uma URL (https://...)"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mt-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" /> Capa do Evento
          </label>
          <input 
            type="file"
            {...register('coverFile')}
            accept="image/*"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-slate-500">Imagem de capa para a página do evento.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Descrição</label>
        <textarea 
          {...register('description')}
          rows={4}
          placeholder="Detalhes sobre o evento..."
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <EventFormBuilder control={control} register={register} />

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg mr-2 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Criar Evento
        </button>
      </div>
    </form>
  )
}
