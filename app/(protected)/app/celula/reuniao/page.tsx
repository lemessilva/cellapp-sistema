import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MonthlyHub } from '@/components/reports/MonthlyHub'
import { getMeetingData } from '@/app/actions/meeting'

export default async function Page() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Permitir Líderes, Supervisores, Admins OU Secretário da Célula
  const isSecretary = user.celula?.secretarioId === user.id
  
  if (!['LIDER', 'SUPERVISOR', 'ADMIN'].includes(user.role) && !isSecretary) {
    redirect('/app')
  }

  try {
    const data = await getMeetingData(user.id)

    if ('error' in data) {
      return (
        <div className="p-6 text-center text-red-600">
          <p>{data.error}</p>
          <a href="/app" className="text-indigo-600 underline mt-4 block">Voltar</a>
        </div>
      )
    }

    return (
      <MonthlyHub 
        cellId={data.cell.id} 
        cellName={data.cell.nome} 
        userId={user.id}
        userRole={user.role}
        isSecretary={isSecretary}
      />
    )
  } catch (error) {
    console.error('CRITICAL ERROR in MonthlyHub Page:', error)
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar a página</h1>
        <p className="text-slate-600 mb-4">Ocorreu um erro inesperado. Por favor, tente novamente.</p>
        <pre className="text-xs text-left bg-slate-100 p-4 rounded overflow-auto max-w-lg mx-auto mb-4">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <a href="/app" className="text-indigo-600 underline">Voltar para o Início</a>
      </div>
    )
  }
}
