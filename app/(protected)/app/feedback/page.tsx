'use client'

import { useState, useRef } from 'react'
import { submitFeedback } from '@/app/actions/feedback'
import { Camera, X, Upload } from 'lucide-react'
import Image from 'next/image'

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess('')
    setLoading(true)

    const res = await submitFeedback(formData)

    if (res?.error) {
      setError(res.error)
    }

    if (res?.success) {
      setSuccess(res.success)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Reset form fields
      const form = fileInputRef.current?.closest('form')
      if (form) form.reset()
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Feedback / Bugs</h1>
      <p className="text-slate-600 mb-6">
        Envie relatos de erros ou sugestões de melhoria para nossa equipe técnica.
      </p>

      <form action={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo de feedback
          </label>
          <select
            name="type"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue="BUG"
          >
            <option value="BUG">Encontrei um Erro (Bug)</option>
            <option value="SUGGESTION">Sugestão de Melhoria</option>
            <option value="PRAISE">Elogio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resumo / Título
          </label>
          <input
            name="title"
            type="text"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Resumo rápido do problema ou sugestão"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mensagem
          </label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Conte o que aconteceu, onde aconteceu e, se possível, como reproduzir."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Anexar Imagem (Opcional)
          </label>
          <div className="mt-1 flex flex-col items-center gap-4">
            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Clique para enviar uma foto ou print</span>
                <span className="text-xs text-slate-400">PNG, JPG até 5MB</span>
              </button>
            )}
            <input
              type="file"
              name="image"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            'Enviar Feedback'
          )}
        </button>

        <p className="text-xs text-slate-500 text-center mt-2">
          Obrigado! Nossa equipe técnica vai analisar cada feedback enviado.
        </p>
      </form>
    </div>
  )
}

