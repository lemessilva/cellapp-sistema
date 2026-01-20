'use client'

import { useState } from 'react'
import { createSermonSeries, deleteSermonSeries, createSermon, deleteSermon } from '@/app/actions/sermons'
import { Plus, Trash2, Video, Calendar, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Sermon = {
  id: string
  title: string
  youtubeUrl: string
  date: string
}

type Series = {
  id: string
  title: string
  description: string | null
  coverUrl: string
  startDate: string | null
  isActive: boolean
  sermons: Sermon[]
}

export function SermonsManager({ initialSeries }: { initialSeries: Series[] }) {
  const [seriesList, setSeriesList] = useState(initialSeries || [])
  const [isAddingSeries, setIsAddingSeries] = useState(false)
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // New Series Form
  const [newSeries, setNewSeries] = useState({
    title: '',
    description: '',
    startDate: '',
    coverFile: null as File | null
  })

  // New Sermon Form (per series)
  const [newSermon, setNewSermon] = useState({
    title: '',
    youtubeUrl: '',
    date: ''
  })

  const handleCreateSeries = async () => {
    if (!newSeries.title || !newSeries.coverFile) {
      toast.error('Título e Capa são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', newSeries.title)
      formData.append('description', newSeries.description)
      if (newSeries.startDate) formData.append('startDate', newSeries.startDate)
      formData.append('coverFile', newSeries.coverFile)

      const res = await createSermonSeries(formData)
      if (res.error) throw new Error(res.error)
      
      toast.success('Série criada com sucesso!')
      window.location.reload()
    } catch (error) {
      toast.error('Erro ao criar série')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSeries = async (id: string) => {
    if (!confirm('Tem certeza? Isso apagará todas as pregações desta série.')) return
    try {
      await deleteSermonSeries(id)
      setSeriesList(seriesList.filter(s => s.id !== id))
      toast.success('Série excluída')
    } catch (error) {
      toast.error('Erro ao excluir')
    }
  }

  const handleAddSermon = async (seriesId: string) => {
    if (!newSermon.title || !newSermon.youtubeUrl || !newSermon.date) {
      toast.error('Preencha todos os campos do sermão')
      return
    }

    setLoading(true)
    try {
      const res = await createSermon({
        title: newSermon.title,
        youtubeUrl: newSermon.youtubeUrl,
        date: new Date(newSermon.date),
        seriesId
      })
      
      if (res.error) throw new Error(res.error)
      
      toast.success('Sermão adicionado!')
      setNewSermon({ title: '', youtubeUrl: '', date: '' })
      window.location.reload()
    } catch (error) {
      toast.error('Erro ao adicionar sermão')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSermon = async (id: string) => {
    if (!confirm('Excluir sermão?')) return
    try {
      await deleteSermon(id)
      window.location.reload()
    } catch (error) {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Acervo de Mensagens</h3>
          <p className="text-sm text-slate-500">Gerencie séries de pregações e vídeos.</p>
        </div>
        <Button onClick={() => setIsAddingSeries(!isAddingSeries)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Nova Série
        </Button>
      </div>

      {isAddingSeries && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-semibold text-slate-700">Criar Nova Série</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Título da Série</Label>
              <Input 
                value={newSeries.title} 
                onChange={e => setNewSeries({...newSeries, title: e.target.value})}
                placeholder="Ex: O Poder da Oração"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input 
                type="date"
                value={newSeries.startDate} 
                onChange={e => setNewSeries({...newSeries, startDate: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Descrição</Label>
              <Textarea 
                value={newSeries.description} 
                onChange={e => setNewSeries({...newSeries, description: e.target.value})}
                placeholder="Sobre o que é essa série?"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Capa da Série (Imagem)</Label>
              <Input 
                type="file"
                accept="image/*"
                onChange={e => e.target.files && setNewSeries({...newSeries, coverFile: e.target.files[0]})}
              />
              <p className="text-xs text-slate-400">Recomendado: Formato Vertical (Story) ou Quadrado.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsAddingSeries(false)}>Cancelar</Button>
            <Button onClick={handleCreateSeries} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Série'}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {seriesList.length === 0 && (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">
            Nenhuma série encontrada. Crie a primeira!
          </div>
        )}

        {seriesList.map((series) => (
          <div key={series.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-start gap-4">
              <img 
                src={series.coverUrl} 
                alt={series.title} 
                className="w-20 h-20 object-cover rounded-lg bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{series.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{series.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {series.startDate ? format(new Date(series.startDate), "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'Sem data'}
                      <span className="mx-1">•</span>
                      {series.sermons.length} mensagens
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedSeries(expandedSeries === series.id ? null : series.id)}
                    >
                      {expandedSeries === series.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Gerenciar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteSeries(series.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sermons List (Expanded) */}
            {expandedSeries === series.id && (
              <div className="bg-slate-50 p-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Adicionar Mensagem
                  </h5>
                  <div className="grid gap-3 md:grid-cols-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Título</Label>
                      <Input 
                        value={newSermon.title} 
                        onChange={e => setNewSermon({...newSermon, title: e.target.value})}
                        placeholder="Ex: A Oração de Jabez" 
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Link YouTube</Label>
                      <Input 
                        value={newSermon.youtubeUrl} 
                        onChange={e => setNewSermon({...newSermon, youtubeUrl: e.target.value})}
                        placeholder="https://youtu.be/..." 
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Data</Label>
                      <Input 
                        type="date"
                        value={newSermon.date} 
                        onChange={e => setNewSermon({...newSermon, date: e.target.value})}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-3 w-full" 
                    onClick={() => handleAddSermon(series.id)}
                    disabled={loading}
                  >
                    Adicionar Vídeo à Série
                  </Button>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mensagens nesta série</h5>
                  {series.sermons.length === 0 && (
                    <p className="text-sm text-slate-400 italic">Nenhuma mensagem adicionada ainda.</p>
                  )}
                  {series.sermons.map(sermon => (
                    <div key={sermon.id} className="flex items-center gap-3 bg-white p-2 rounded border border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-sm font-medium text-slate-800 truncate">{sermon.title}</h6>
                        <a href={sermon.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                          {sermon.youtubeUrl}
                        </a>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {format(new Date(sermon.date), "dd/MM")}
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                        onClick={() => handleDeleteSermon(sermon.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
