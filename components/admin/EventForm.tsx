'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/app/actions/events'
import { toast } from 'sonner'
import { Loader2, Calendar, MapPin, DollarSign, Image as ImageIcon, Users } from 'lucide-react'

export function EventForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    
    try {
      // Basic validation
      const title = formData.get('title')
      const date = formData.get('date')
      
      if (!title || !date) {
        toast.error('Preencha os campos obrigatórios')
        setIsSubmitting(false)
        return
      }

      // Convert inputs to match action expectation
      // const price = parseFloat(formData.get('price') as string || '0')
      // const maxCapacity = formData.get('maxCapacity') ? parseInt(formData.get('maxCapacity') as string) : undefined
      
      // const payload = {
      //   title: title as string,
      //   description: formData.get('description') as string,
      //   date: new Date(date as string).toISOString(),
      //   location: formData.get('location') as string,
      //   price,
      //   bannerUrl: formData.get('bannerUrl') as string,
      //   maxCapacity
      // }

      // const result = await createEvent(payload)
      
      // Now we pass FormData directly
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
    <form action={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Título do Evento *</label>
          <input 
            name="title" 
            required 
            placeholder="Ex: Retiro de Jovens 2024"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" /> Data e Hora *
          </label>
          <input 
            type="datetime-local" 
            name="date" 
            required 
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" /> Local
          </label>
          <input 
            name="location" 
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
            name="price" 
            min="0" 
            step="0.01" 
            defaultValue="0"
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
            name="maxCapacity" 
            min="1" 
            placeholder="Ilimitado"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" /> Banner
          </label>
          <input 
            type="file"
            name="bannerFile" 
            accept="image/*"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-slate-500">
            📏 Tamanho recomendado: 1280x720px (Padrão YouTube). Formatos: JPG ou PNG.
          </p>
          {/* Fallback URL input if needed */}
          <input 
            name="bannerUrl" 
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
            name="coverFile" 
            accept="image/*"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-slate-500">Imagem de capa para a página do evento.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Descrição</label>
        <textarea 
          name="description" 
          rows={4}
          placeholder="Detalhes sobre o evento..."
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

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
