'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getCellMembers } from '@/app/(protected)/admin/celulas/actions'
import { Loader2, Phone } from 'lucide-react'

interface CellMembersModalProps {
  cellId: string | null
  cellName: string | null
  isOpen: boolean
  onClose: () => void
}

type Member = {
  id: string
  nome: string
  role: string
  whatsapp: string | null
  telefone: string | null
}

export default function CellMembersModal({ cellId, cellName, isOpen, onClose }: CellMembersModalProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && cellId) {
      setLoading(true)
      getCellMembers(cellId)
        .then((res) => {
          if (res.success && res.members) {
            setMembers(res.members)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, cellId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Membros da Célula: {cellName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Carregando membros...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic">
              Nenhum membro vinculado a esta célula.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Cargo</th>
                    <th className="px-4 py-3">Telefone</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors odd:bg-white even:bg-slate-50/30">
                      <td className="px-4 py-3 font-medium text-slate-900">{member.nome}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {(member.whatsapp || member.telefone) ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            {member.whatsapp || member.telefone}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
