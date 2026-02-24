'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { assignDecision, updateDecisionStatus, addDecisionNote } from '@/app/actions/decision'

type Leader = { id: string; nome: string }
type Decision = {
  id: string
  name: string
  phone: string
  decisionType: string
  prayerRequest: string | null
  status: string
  createdAt: string | Date
  assignedToId?: string | null
  assignedTo?: { id: string; nome: string } | null
  notes?: string | null
}

function formatDate(d: string | Date) {
  const date = new Date(d)
  return date.toLocaleString('pt-BR')
}

const STATUS_FLOW: Array<{ key: 'PENDING' | 'EM_CONTATO' | 'CONSOLIDADO'; label: string; color: string }> = [
  { key: 'PENDING', label: 'Pendente', color: 'bg-red-100 text-red-700 border-red-300' },
  { key: 'EM_CONTATO', label: 'Em Contato', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { key: 'CONSOLIDADO', label: 'Consolidado', color: 'bg-green-100 text-green-800 border-green-300' },
]

export default function DecisionAdminTable({ items, leaders }: { items: Decision[]; leaders: Leader[] }) {
  const [isPending, startTransition] = useTransition()
  const [noteOpenId, setNoteOpenId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const nextStatus = (current: string) => {
    const idx = STATUS_FLOW.findIndex(s => s.key === current)
    const next = STATUS_FLOW[(idx + 1) % STATUS_FLOW.length]
    return next.key
  }

  const handleToggleStatus = (id: string, current: string) => {
    const s = nextStatus(current)
    startTransition(async () => {
      await updateDecisionStatus(id, s)
    })
  }

  const handleAssign = (id: string, userId: string) => {
    startTransition(async () => {
      await assignDecision(id, userId)
    })
  }

  const openNotes = (id: string, current: string | null | undefined) => {
    setNoteDraft(current || '')
    setNoteOpenId(id)
  }

  const saveNotes = () => {
    if (!noteOpenId) return
    startTransition(async () => {
      await addDecisionNote(noteOpenId, noteDraft)
      setNoteOpenId(null)
    })
  }

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left p-3">Nome</th>
            <th className="text-left p-3">WhatsApp</th>
            <th className="text-left p-3">Decisão</th>
            <th className="text-left p-3">Data</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Responsável</th>
            <th className="text-left p-3">Observações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const st = STATUS_FLOW.find(s => s.key === (item.status as any)) || STATUS_FLOW[0]
            return (
              <tr key={item.id} className="border-t">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.phone}</td>
                <td className="p-3">{item.decisionType}</td>
                <td className="p-3">{formatDate(item.createdAt)}</td>
                <td className="p-3">
                  <Button
                    variant="outline"
                    className={`border ${st.color} transition-colors`}
                    disabled={isPending}
                    onClick={() => handleToggleStatus(item.id, item.status)}
                  >
                    {st.label}
                  </Button>
                </td>
                <td className="p-3 min-w-[220px]">
                  <Select
                    value={item.assignedToId || ''}
                    onValueChange={(v) => handleAssign(item.id, v)}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Direcionar líder" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaders.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Button variant="outline" onClick={() => openNotes(item.id, item.notes)} disabled={isPending}>
                    {item.notes ? 'Ver/Editar' : 'Adicionar'}
                  </Button>
                </td>
              </tr>
            )
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-500">
                Nenhum cartão enviado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Dialog open={!!noteOpenId} onOpenChange={(open) => !open && setNoteOpenId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observações pastorais</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            placeholder="Ex: Precisa de visita. Quer batismo. Detalhes importantes..."
            className="min-h-[140px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpenId(null)} disabled={isPending}>Cancelar</Button>
            <Button onClick={saveNotes} disabled={isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
