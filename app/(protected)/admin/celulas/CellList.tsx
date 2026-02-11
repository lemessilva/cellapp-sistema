'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, MapPin, Calendar, Clock, Users, Eye } from 'lucide-react'
import CellModal from '@/components/admin/CellModal'
import CellMembersModal from '@/components/admin/CellMembersModal'
import { deleteCell } from './actions'
import { toast } from 'sonner'

type Cell = {
  id: string
  nome: string
  dia_reuniao: string | null
  horario: string | null
  endereco: string | null
  liderId: string | null
  supervisorId: string | null
  lider: { nome: string } | null
  lider2: { nome: string } | null
  supervisor: { nome: string } | null
  supervisor2: { nome: string } | null
  _count: { membros: number }
}

const dayColors: Record<string, string> = {
  'Segunda-feira': 'bg-yellow-100 text-yellow-800',
  'Terça-feira': 'bg-blue-100 text-blue-800',
  'Quarta-feira': 'bg-green-100 text-green-800',
  'Quinta-feira': 'bg-purple-100 text-purple-800',
  'Sexta-feira': 'bg-pink-100 text-pink-800',
  'Sábado': 'bg-orange-100 text-orange-800',
  'Domingo': 'bg-red-100 text-red-800',
}

export default function CellList({ initialCells, userRole }: { initialCells: Cell[], userRole: string }) {
  const canManageStructure = userRole === 'ADMIN' || userRole === 'SUPERVISOR'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [cellForMembers, setCellForMembers] = useState<{ id: string, nome: string } | null>(null)

  const handleCreate = () => {
    setSelectedCell(null)
    setIsModalOpen(true)
  }

  const handleEdit = (cell: Cell) => {
    setSelectedCell(cell)
    setIsModalOpen(true)
  }

  const handleViewMembers = (cell: Cell) => {
    setCellForMembers({ id: cell.id, nome: cell.nome })
    setIsMembersModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta célula? Isso removerá o vínculo de todos os membros.')) {
      const result = await deleteCell(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Célula excluída com sucesso.')
      }
    }
  }

  return (
    <>
      <div className="flex justify-end">
        {canManageStructure && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nova Célula
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="p-4 pl-6">Nome / Endereço</th>
                <th className="p-4">Dia & Horário</th>
                <th className="p-4">Liderança</th>
                <th className="p-4 text-center">Membros</th>
                <th className="p-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialCells.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhuma célula cadastrada.
                  </td>
                </tr>
              ) : (
                initialCells.map((cell) => (
                  <tr key={cell.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 text-base">{cell.nome}</div>
                      {cell.endereco && (
                        <div className="flex items-start gap-1 text-slate-500 mt-1 max-w-xs">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="text-xs truncate">{cell.endereco}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {cell.dia_reuniao && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dayColors[cell.dia_reuniao] || 'bg-slate-100 text-slate-700'}`}>
                            {cell.dia_reuniao}
                          </span>
                        )}
                        {cell.horario && (
                          <div className="flex items-center gap-1 text-slate-600 text-xs">
                            <Clock className="w-3 h-3" />
                            {cell.horario}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        {/* Líderes */}
                        {(cell.lider || cell.lider2) ? (
                            <div className="text-sm font-medium text-indigo-700">
                                <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-indigo-400 mb-0.5">👑 Líderes</div>
                                {cell.lider && <div>{cell.lider.nome}</div>}
                                {cell.lider2 && <div>{cell.lider2.nome}</div>}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 italic">Sem líder</div>
                        )}
                        
                        {/* Supervisores */}
                        {(cell.supervisor || cell.supervisor2) ? (
                            <div className="text-xs text-purple-600 font-medium">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-purple-400 mb-0.5">👁️ Supervisão</div>
                                {cell.supervisor && <div>{cell.supervisor.nome}</div>}
                                {cell.supervisor2 && <div>{cell.supervisor2.nome}</div>}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 italic">Sem supervisor</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold text-xs">
                        <Users className="w-3 h-3" />
                        {cell._count.membros}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewMembers(cell)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Visualizar Membros"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        {canManageStructure && (
                          <>
                            <button
                              onClick={() => handleEdit(cell)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cell.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CellModal
        cell={selectedCell}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <CellMembersModal
        cellId={cellForMembers?.id || null}
        cellName={cellForMembers?.nome || null}
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />
    </>
  )
}
