'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { updateUserRoleAndCells } from '@/app/(protected)/admin/actions'
import { toast } from 'sonner'
import { Role, User as PrismaUser } from '@prisma/client'

type Cell = {
  id: string
  nome: string
  liderId: string | null
  supervisorId: string | null
}

type User = Pick<PrismaUser, 'id' | 'nome' | 'email' | 'role' | 'celulaId'> & {
  celulaLiderada: { id: string } | null
  celulasSupervisionadas: { id: string }[]
}

interface EditUserModalProps {
  user: User
  cells: Cell[]
  isOpen: boolean
  onClose: () => void
}

export default function EditUserModal({ user, cells, isOpen, onClose }: EditUserModalProps) {
  const [role, setRole] = useState<Role>(user.role)
  const [celulaId, setCelulaId] = useState(user.celulaId || '')
  const [liderancaCellId, setLiderancaCellId] = useState(user.celulaLiderada?.id || '')
  const [supervisaoCellIds, setSupervisaoCellIds] = useState<string[]>(
    user.celulasSupervisionadas.map(c => c.id)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setRole(user.role)
      setCelulaId(user.celulaId || '')
      setLiderancaCellId(user.celulaLiderada?.id || '')
      setSupervisaoCellIds(user.celulasSupervisionadas.map(c => c.id))
    }
  }, [user, isOpen])

  // Lógica automática para Líder
  useEffect(() => {
    if (role === 'LIDER' && liderancaCellId) {
      setCelulaId(liderancaCellId)
    }
  }, [role, liderancaCellId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateUserRoleAndCells({
        userId: user.id,
        role,
        celulaId,
        liderancaCellId: role === 'LIDER' ? liderancaCellId : undefined,
        supervisaoCellIds: role === 'SUPERVISOR' ? supervisaoCellIds : undefined
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuário atualizado com sucesso!')
        onClose()
      }
    } catch (error) {
      toast.error('Erro inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSupervisionCell = (cellId: string) => {
    setSupervisaoCellIds(prev => 
      prev.includes(cellId) 
        ? prev.filter(id => id !== cellId)
        : [...prev, cellId]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Editar Usuário</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-600 font-medium">
              {user.nome}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="MEMBRO">Membro</option>
              <option value="LIDER">Líder</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Admin</option>
              <option value="MIDIA">Mídia / Tech</option>
            </select>
          </div>

          {/* Lógica para LÍDER */}
          {role === 'LIDER' && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-4">
              <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">Configuração de Líder</h3>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">
                  Qual Célula ele lidera?
                </label>
                <select
                  value={liderancaCellId}
                  onChange={(e) => setLiderancaCellId(e.target.value)}
                  required
                  className="w-full p-2 border border-indigo-200 rounded bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma célula...</option>
                  {cells.map(cell => (
                    <option key={cell.id} value={cell.id}>
                      {cell.nome} {cell.liderId && cell.liderId !== user.id ? '(Já tem líder)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-indigo-600 mt-1">
                  * Ao selecionar, ele será automaticamente membro desta célula.
                </p>
              </div>
            </div>
          )}

          {/* Lógica para SUPERVISOR */}
          {role === 'SUPERVISOR' && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4">
              <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wide">Configuração de Supervisor</h3>
              
              {/* Célula Base */}
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Célula Base (Onde congrega?)
                </label>
                <select
                  value={celulaId}
                  onChange={(e) => setCelulaId(e.target.value)}
                  required
                  className="w-full p-2 border border-purple-200 rounded bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione a célula base...</option>
                  {cells.map(cell => (
                    <option key={cell.id} value={cell.id}>{cell.nome}</option>
                  ))}
                </select>
              </div>

              {/* Células Supervisionadas */}
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Células Supervisionadas
                </label>
                <div className="max-h-48 overflow-y-auto border border-purple-200 rounded-lg bg-white p-2 space-y-1">
                  {cells.map(cell => (
                    <label key={cell.id} className="flex items-center p-2 hover:bg-purple-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={supervisaoCellIds.includes(cell.id)}
                        onChange={() => toggleSupervisionCell(cell.id)}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cell.nome}</span>
                      {cell.supervisorId && cell.supervisorId !== user.id && (
                        <span className="ml-auto text-xs text-orange-500 font-medium">Tem supervisor</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lógica Padrão (Membro ou Admin) */}
          {['MEMBRO', 'ADMIN'].includes(role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pertence a qual Célula?
              </label>
              <select
                value={celulaId}
                onChange={(e) => setCelulaId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Sem célula</option>
                {cells.map(cell => (
                  <option key={cell.id} value={cell.id}>{cell.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              {!isSubmitting && <Check className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
