'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { listMediaFiles } from '@/app/actions/media'
import { Loader2, Image as ImageIcon } from 'lucide-react'

interface MediaLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export function MediaLibrary({ isOpen, onClose, onSelect }: MediaLibraryProps) {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen])

  const loadImages = async () => {
    setLoading(true)
    const files = await listMediaFiles()
    setImages(files)
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Biblioteca de Mídia</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {images.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-500">
                Nenhuma imagem encontrada.
              </div>
            ) : (
              images.map((img) => (
                <button
                  key={img.name}
                  onClick={() => {
                    onSelect(img.url)
                    onClose()
                  }}
                  className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 transition-all"
                >
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
