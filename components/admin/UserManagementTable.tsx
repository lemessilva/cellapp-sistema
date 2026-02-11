'use client'

import { useState } from 'react'
import { Edit, Shield, User, Users, Star, Printer, Clapperboard } from 'lucide-react'
import EditUserModal from './EditUserModal'
import PrintReportModal from './PrintReportModal'
import { Role } from '@prisma/client'

type Cell = {
  id: string
  nome: string
  liderId: string | null
  supervisorId: string | null
}

type UserType = {
  id: string
  nome: string
  email: string
  role: Role
  celulaId: string | null
  celula: { nome: string } | null
  celulaLiderada: { id: string } | null
  celulasSupervisionadas: { id: string }[]
  funcoes: string | null
  createdAt: Date
}

interface UserManagementTableProps {
  users: UserType[]
  cells: Cell[]
}

const roleConfig = {
  ADMIN: { label: 'Admin', color: 'text-red-600 bg-red-50', icon: Shield },
  SUPERVISOR: { label: 'Supervisor', color: 'text-purple-600 bg-purple-50', icon: Star },
  LIDER: { label: 'Líder', color: 'text-indigo-600 bg-indigo-50', icon: Users },
  MEMBRO: { label: 'Membro', color: 'text-slate-600 bg-slate-50', icon: User },
  MIDIA: { label: 'Mídia / Tech', color: 'text-purple-600 bg-purple-50', icon: Clapperboard },
}

export default function UserManagementTable({ users, cells }: UserManagementTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [printUser, setPrintUser] = useState<UserType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEditClick = (user: UserType) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handlePrintClick = (user: UserType) => {
    setPrintUser(user)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Gerenciamento de Membros</h2>
          <div className="text-sm text-slate-500">
            Total: {users.length} usuários
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Cargo</th>
                <th className="p-4">Célula</th>
                <th className="p-4">Data Cadastro</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const RoleIcon = roleConfig[user.role].icon
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{user.nome}</div>
                      <div className="text-slate-400 text-xs">{user.email}</div>
                      {user.funcoes && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.funcoes.split(', ').map((f) => (
                            <span key={f} className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig[user.role].color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleConfig[user.role].label}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {user.celula?.nome || '-'}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => handlePrintClick(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Imprimir Relatório"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleEditClick(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                            <Edit className="w-3 h-3" />
                            Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          cells={cells}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {printUser && (
        <PrintReportModal
            userId={printUser.id}
            userName={printUser.nome}
            isOpen={!!printUser}
            onClose={() => setPrintUser(null)}
        />
      )}
    </>
  )
}
