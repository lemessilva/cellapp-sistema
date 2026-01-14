import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { Plus, Edit, Trash2, MapPin, Calendar, Clock, Users } from 'lucide-react'
import CellList from './CellList' // We'll extract client logic here

export const dynamic = 'force-dynamic'

async function getCells() {
  const cells = await prisma.cell.findMany({
    include: {
      lider: { select: { nome: true } },
      lider2: { select: { nome: true } },
      supervisor: { select: { nome: true } },
      supervisor2: { select: { nome: true } },
      _count: { select: { membros: true } }
    },
    orderBy: { nome: 'asc' }
  })
  return cells
}

export default async function CelulasPage() {
  const user = await getUser()
  if (!user || !['ADMIN', 'SUPERVISOR'].includes(user.role)) redirect('/app/oracao')

  const cells = await getCells()

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Células</h1>
          <p className="text-slate-500 mt-1">Gerencie os locais de reunião e horários</p>
        </div>
        <a href="/admin" className="text-indigo-600 hover:text-indigo-800 font-medium">Voltar ao Painel</a>
      </header>

      <CellList initialCells={cells} userRole={user.role} />
    </div>
  )
}
