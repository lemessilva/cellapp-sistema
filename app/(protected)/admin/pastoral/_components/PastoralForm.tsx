'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPastoralMessage, updatePastoralMessage } from '@/app/actions/pastoral-messages'
import { toast } from 'sonner'
import { Loader2, Calendar, ImageIcon, Save } from 'lucide-react'
import { PastoralMessage } from '@prisma/client'

interface PastoralFormProps {
  initialData?: PastoralMessage | null
}

export function PastoralForm({ initialData }: PastoralFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    
    try {
      const title = formData.get('title')
      const content = formData.get('content')
      
      if (!title || !content) {
        toast.error('Preencha os campos obrigatórios')
        setIsSubmitting(false)
        return
      }

      let result
      if (initialData) {
        // Pass imageUrl explicitly if it wasn't changed, though server action handles null file
        if (initialData.imageUrl) {
          formData.append('imageUrl', initialData.imageUrl)
        }
        formData.append('ativo', String(initialData.ativo)) // Preserve status or add toggle in form? 
        // Let's assume we preserve status or it's managed in the list. 
        // Or we can add a status checkbox. I'll add a status checkbox.
        
        result = await updatePastoralMessage(initialData.id, formData)
      } else {
        result = await createPastoralMessage(formData)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(initialData ? 'Mensagem atualizada!' : 'Mensagem criada!')
        router.push('/admin/pastoral')
      }
    } catch (error) {
      toast.error('Erro ao salvar mensagem')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Título *</label>
          <input 
            name="title" 
            required 
            defaultValue={initialData?.titulo}
            placeholder="Ex: A Importância da Oração"
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" /> Data de Publicação
          </label>
          <input 
            type="datetime-local" 
            name="publishedAt" 
            defaultValue={initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" /> Capa da Mensagem
          </label>
          
          <div className="flex gap-4 items-start">
            {previewUrl && (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <input 
                type="file"
                name="imageFile" 
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                📏 Tamanho recomendado: 1280x720px (16:9).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Conteúdo da Mensagem *</label>
          <textarea 
            name="content" 
            required 
            rows={12}
            defaultValue={initialData?.conteudo}
            placeholder="Escreva a mensagem aqui..."
            className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-sans leading-relaxed"
          />
        </div>
        
        {initialData && (
           <div className="flex items-center gap-2 md:col-span-2">
             <input 
               type="checkbox" 
               name="ativo" 
               value="true"
               defaultChecked={initialData.ativo}
               id="ativo"
               className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
             />
             <label htmlFor="ativo" className="text-sm text-slate-700 select-none cursor-pointer">
               Mensagem Ativa (Visível no site)
             </label>
           </div>
        )}
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
          {initialData ? 'Salvar Alterações' : 'Publicar Mensagem'}
        </button>
      </div>
    </form>
  )
}
