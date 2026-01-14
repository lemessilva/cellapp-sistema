'use client'

import { useState } from 'react'
import { login } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  async function handleSubmit(formData: FormData) {
    const res = await login(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">CellApp</h1>
          <p className="text-gray-500">Gestão de Células</p>
        </div>

        {registered && (
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-center border border-green-100">
                Cadastro realizado com sucesso! <br/> Faça login para continuar.
            </div>
        )}

        <form action={handleSubmit} className="card space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" required className="input-field" placeholder="seu@email.com" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input name="password" type="password" required className="input-field" placeholder="******" />
            </div>

            <button type="submit" className="btn-primary">
                Entrar
            </button>
        </form>
        
        <p className="text-center text-sm text-gray-500">
            Não tem conta? Peça um convite ao seu líder.
        </p>
      </div>
    </div>
  )
}
