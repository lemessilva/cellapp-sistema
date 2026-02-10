'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Edit2, Check, X, Loader2 } from 'lucide-react'
import { updatePhotoCaption } from '@/app/actions/photos'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner' // Assuming sonner is used, or generic alert

interface PhotoFeedCardProps {
  photo: {
    id: string
    url: string
    caption: string | null
    createdAt: Date
    cell: {
      nome: string
    }
  }
  canEdit: boolean
}

export function PhotoFeedCard({ photo, canEdit }: PhotoFeedCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [caption, setCaption] = useState(photo.caption || '')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePhotoCaption(photo.id, caption)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Legenda atualizada com sucesso!')
        setIsEditing(false)
      }
    })
  }

  const handleCancel = () => {
    setCaption(photo.caption || '')
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* Imagem */}
      <div className="aspect-square relative bg-slate-100">
        <Image
          src={photo.url}
          alt={photo.caption || `Foto da célula ${photo.cell.nome}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Edit Button Overlay */}
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
            title="Editar legenda"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Rodapé do Card */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
            {photo.cell.nome.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 line-clamp-1">
              {photo.cell.nome}
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva uma legenda..."
              className="min-h-[80px] text-sm resize-none bg-slate-50"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCancel}
                disabled={isPending}
                className="h-8 w-8 p-0 text-slate-500"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isPending}
                className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    <span className="text-xs">Salvar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          photo.caption && (
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {photo.caption}
            </p>
          )
        )}
      </div>
    </div>
  )
}
