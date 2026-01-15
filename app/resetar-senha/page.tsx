'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { resetarSenha } from '@/app/actions/auth-reset'
import { Eye, EyeOff } from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess('')

    if (!token) {
      setError('Token de recuperação inválido.')
      return
    }

    const novaSenha = formData.get('password') as string
    if (!novaSenha || novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const res = await resetarSenha(token, novaSenha)

    if (res?.error) {
      setError(res.error)
    }

    if (res?.success) {
      setSuccess(res.success)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">CellApp</h1>
        <p className="text-gray-500">Definir Nova Senha</p>
      </div>

      {!token && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
          Link de recuperação inválido. Solicite um novo link.
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="input-field pr-11"
              placeholder="Digite a nova senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !token}
        >
          {loading ? 'Atualizando...' : 'Atualizar senha'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Já lembrei da senha?{' '}
        <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Voltar para o login
        </a>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <Suspense fallback={<div className="text-center text-indigo-600">Carregando...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}

