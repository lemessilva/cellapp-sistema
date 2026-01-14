import { validateInviteToken } from './actions'
import CadastroForm from './form'
import Link from 'next/link'

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const token = (await searchParams).token

  if (!token || typeof token !== 'string') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Convite Inválido</h1>
            <p className="text-gray-600 mb-8">Você precisa de um link de convite válido para se cadastrar.</p>
            <Link href="/login" className="text-indigo-600 font-medium">Voltar para Login</Link>
        </div>
    )
  }

  const validation = await validateInviteToken(token)

  if (validation.error) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Problema com o Convite</h1>
            <p className="text-gray-600 mb-8">{validation.error}</p>
            <Link href="/login" className="text-indigo-600 font-medium">Voltar para Login</Link>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Bem-vindo(a)!</h1>
                <p className="mt-2 text-gray-600">
                    Você foi convidado para a célula <strong>{validation.invite?.cell.nome}</strong>.
                </p>
            </div>
            
            <CadastroForm token={token} />
        </div>
    </div>
  )
}
