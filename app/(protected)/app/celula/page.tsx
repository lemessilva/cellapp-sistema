import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MapPin, Calendar, Clock, User, Users, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StartLiveMeetingButton } from '@/components/live/StartLiveMeetingButton'
import { prisma } from '@/lib/prisma'
import { PhotoUpload } from '@/components/photos/PhotoUpload'

export default async function MemberCellPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'MIDIA') {
    redirect('/admin/website')
  }

  // Lógica Robusta de Busca de Célula (Líder, Líder 2, Membro ou Admin)
  let targetCell = await prisma.cell.findFirst({
    where: {
        OR: [
            { liderId: user.id },
            { lider2Id: user.id },
            { membros: { some: { id: user.id } } }
        ]
    },
    include: {
        lider: { select: { nome: true } },
        membros: {
            where: { ativo: true },
            orderBy: { nome: 'asc' }
        }
    }
  })

  // Fallback para ADMIN: Se não tiver célula vinculada, pega a primeira disponível
  if (!targetCell && user.role === 'ADMIN') {
      targetCell = await prisma.cell.findFirst({
          orderBy: { nome: 'asc' },
          include: {
              lider: { select: { nome: true } },
              membros: {
                  where: { ativo: true },
                  orderBy: { nome: 'asc' }
              }
          }
      })
  }

  const celula = targetCell
  const canStartMeeting = ['LIDER', 'SUPERVISOR', 'COORDENADOR', 'ADMIN'].includes(user.role)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minha Célula</h1>
          <p className="text-slate-500">Informações sobre sua comunidade</p>
        </div>
        <div className="flex items-center gap-2">
            {celula && canStartMeeting && (
                <PhotoUpload cellId={celula.id} cellName={celula.nome} />
            )}
            {user.role === 'ADMIN' && (
            <Link href="/admin/celulas">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Célula
                </Button>
            </Link>
            )}
        </div>
      </header>

      {!celula ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Você ainda não participa de uma célula</h2>
          <p className="text-yellow-700">
            Entre em contato com a liderança para ser inserido em um grupo.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Start Meeting Button */}
          {canStartMeeting && (
             <div className="md:col-span-2">
                <StartLiveMeetingButton cellId={celula.id} />
             </div>
          )}

          {/* Cartão Principal da Célula */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">{celula.nome}</h2>
                <div className="flex items-center gap-2 text-indigo-600 mt-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Líder: {celula.lider?.nome || 'Sem líder definido'}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Dia</p>
                  <p className="text-sm font-medium">{celula.dia_reuniao || 'A definir'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Horário</p>
                  <p className="text-sm font-medium">{celula.horario || 'A definir'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Local</p>
                  <p className="text-sm font-medium">{celula.endereco || 'A definir'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Membros */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden md:col-span-2">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Participantes ({celula.membros.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {celula.membros.map((membro) => (
                <div key={membro.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {membro.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{membro.nome}</p>
                    {membro.id === celula.liderId && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase">
                        Líder
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {celula.membros.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Nenhum membro encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
