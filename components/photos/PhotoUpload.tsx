'use client'

import { useState, useRef } from 'react'
import { uploadCellPhoto } from '@/app/actions/photos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImagePlus, Loader2, X, Camera } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface PhotoUploadProps {
  cellId: string
  cellName: string
}

export function PhotoUpload({ cellId, cellName }: PhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Use ref to trigger hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('cellId', cellId)
    formData.append('photo', file)
    formData.append('caption', caption)

    try {
      const result = await uploadCellPhoto(formData)
      if (result.success) {
        toast.success('Foto publicada com sucesso!')
        setIsOpen(false)
        handleRemove()
        setCaption('')
      } else {
        toast.error(result.error || 'Erro ao publicar foto')
      }
    } catch (error) {
      toast.error('Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 text-indigo-600 border-indigo-100">
          <Camera className="w-4 h-4" />
          Postar Foto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Postar Foto - {cellName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Foto do Encontro</Label>
            
            {!preview ? (
              <div 
                onClick={handleUploadClick}
                className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors relative"
              >
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <ImagePlus className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-500">Clique para selecionar</span>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-100">
                <Image 
                  src={preview} 
                  alt="Preview" 
                  fill 
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Legenda (Opcional)</Label>
            <Input
              id="caption"
              placeholder="Como foi o encontro hoje?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!file || loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Publicar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
