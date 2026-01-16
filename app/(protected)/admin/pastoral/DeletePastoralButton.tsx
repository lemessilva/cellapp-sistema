'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { deletePastoralMessage } from '@/app/actions/pastoral-messages'
import { toast } from 'sonner'

export function DeletePastoralButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return

    setIsDeleting(true)
    try {
      const result = await deletePastoralMessage(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Mensagem excluída com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao excluir mensagem.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Excluir"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
