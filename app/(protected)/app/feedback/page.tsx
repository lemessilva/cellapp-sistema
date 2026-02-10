'use client'

import { useState } from 'react'
import { submitFeedback } from '@/app/actions/feedback'

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white text-sm shadow-sm transition-colors ${
            loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Enviando...' : 'Enviar Report'}
        </button>

        <p className="text-xs text-slate-500 text-center mt-2">
          Obrigado! Nossa equipe técnica vai analisar cada feedback enviado.
        </p>
      </form>
    </div>
  )
}

