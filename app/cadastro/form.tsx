'use client'

import { useState } from 'react'
import { registerUser } from './actions'

export default function CadastroForm({ token }: { token: string }) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')
        
        const res = await registerUser(formData)
        if (res?.error) {
            setError(res.error)
            setLoading(false)
        }
        // Se sucesso, o server action faz o redirect
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}
            
            <input type="hidden" name="token" value={token} />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input name="nome" type="text" required className="input-field" placeholder="Seu nome" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" required className="input-field" placeholder="seu@email.com" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input name="telefone" type="tel" required className="input-field" placeholder="(11) 99999-9999" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input name="password" type="password" required className="input-field" placeholder="******" minLength={6} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-4">
                {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
        </form>
    )
}
