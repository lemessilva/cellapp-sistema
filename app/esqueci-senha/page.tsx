'use client'

import { useState, Suspense } from 'react'
import { solicitarReset } from '@/app/actions/auth-reset'
import { useSearchParams } from 'next/navigation'

function ForgotPasswordContent() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const fromLogin = searchParams.get('from') === 'login'

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess('')
    setLoading(true)

    const email = formData.get('email') as string

    const res = await solicitarReset(email)

    if (res?.error) {
      setError(res.error)
    }

    if (res?.success) {
      setSuccess(res.success)
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">CellApp</h1>
        <p className="text-gray-500">Recuperação de Senha</p>
      </div>

      {fromLogin && (
        <div className="bg-indigo-50 text-indigo-700 p-4 rounded-2xl text-center border border-indigo-100 text-sm">
          Informe o email da sua conta para receber o link de redefinição.
        </div>
      )}

      <form action={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="input-field"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Lembrei minha senha?{' '}
        <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Voltar para o login
        </a>
      </p>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <Suspense fallback={<div className="text-center text-indigo-600">Carregando...</div>}>
        <ForgotPasswordContent />
      </Suspense>
    </div>
  )
}

