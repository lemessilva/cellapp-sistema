'use client'

import { useState } from 'react'
import { createBioLink, deleteBioLink, updateBioLink } from '@/app/actions/bio-links'
import { Plus, Trash2, Link as LinkIcon, Star, GripVertical, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

type BioLink = {
  id: string
  title: string
  url: string
  icon: string | null
  isActive: boolean
  isHighlight: boolean
  order: number
}

export function BioLinksManager({ initialLinks }: { initialLinks: BioLink[] }) {
  const [links, setLinks] = useState(initialLinks || [])
  const [isAdding, setIsAdding] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: '', isHighlight: false })
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!newLink.title || !newLink.url) {
      toast.error('Preencha título e URL')
      return
    }

    setLoading(true)
    try {
      const res = await createBioLink(newLink)
      if (res.error) throw new Error(res.error)
      toast.success('Link criado com sucesso!')
      setIsAdding(false)
      setNewLink({ title: '', url: '', icon: '', isHighlight: false })
      // Na prática o refresh da página virá do parent ou router.refresh, 
      // mas aqui podemos atualizar localmente se quisermos ser otimistas
      // ou apenas esperar o refresh do server component.
      // Vou confiar no router.refresh() do pai ou reload.
      window.location.reload() 
    } catch (error) {
      toast.error('Erro ao criar link')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este link?')) return
    try {
      await deleteBioLink(id)
      setLinks(links.filter(l => l.id !== id))
      toast.success('Link excluído')
    } catch (error) {
      toast.error('Erro ao excluir')
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateBioLink(id, { isActive: !current })
      setLinks(links.map(l => l.id === id ? { ...l, isActive: !current } : l))
    } catch (error) {
      toast.error('Erro ao atualizar')
    }
  }

  const handleToggleHighlight = async (id: string, current: boolean) => {
    try {
      await updateBioLink(id, { isHighlight: !current })
      setLinks(links.map(l => l.id === id ? { ...l, isHighlight: !current } : l))
    } catch (error) {
      toast.error('Erro ao atualizar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Links da Bio</h3>
          <p className="text-sm text-slate-500">Gerencie os botões da sua página de links.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Novo Link
        </Button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Título do Botão</Label>
              <Input 
                value={newLink.title} 
                onChange={e => setNewLink({...newLink, title: e.target.value})}
                placeholder="Ex: Inscreva-se no Culto"
              />
            </div>
            <div className="space-y-2">
              <Label>URL de Destino</Label>
              <Input 
                value={newLink.url} 
                onChange={e => setNewLink({...newLink, url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Ícone (Lucide)</Label>
              <Input 
                value={newLink.icon} 
                onChange={e => setNewLink({...newLink, icon: e.target.value})}
                placeholder="Ex: Instagram, Youtube, Calendar..."
              />
              <p className="text-xs text-slate-400">Use nomes de ícones da biblioteca Lucide React.</p>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch 
                checked={newLink.isHighlight}
                onCheckedChange={c => setNewLink({...newLink, isHighlight: c})}
              />
              <Label>Destaque (Pulsar)</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar Link'}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {links.length === 0 && (
          <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
            Nenhum link cadastrado.
          </div>
        )}
        
        {links.map((link) => {
          // Dynamic Icon Rendering
          // @ts-ignore
          const IconComp = link.icon && LucideIcons[link.icon] ? LucideIcons[link.icon] : LinkIcon

          return (
            <div key={link.id} className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm transition-all ${!link.isActive ? 'opacity-60 grayscale' : ''}`}>
              <div className="cursor-move text-slate-300 hover:text-slate-600">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className={`p-2 rounded-full ${link.isHighlight ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                {/* @ts-ignore */}
                <IconComp className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800 truncate flex items-center gap-2">
                  {link.title}
                  {link.isHighlight && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                </h4>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                  {link.url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                 <div className="flex flex-col items-center gap-1 mr-2">
                   <Switch 
                     checked={link.isActive}
                     onCheckedChange={() => handleToggleActive(link.id, link.isActive)}
                     className="data-[state=checked]:bg-green-500"
                   />
                   <span className="text-[10px] text-slate-400">Ativo</span>
                 </div>
                 
                 <div className="flex flex-col items-center gap-1 mr-2">
                   <Switch 
                     checked={link.isHighlight}
                     onCheckedChange={() => handleToggleHighlight(link.id, link.isHighlight)}
                     className="data-[state=checked]:bg-amber-500"
                   />
                   <span className="text-[10px] text-slate-400">Destaque</span>
                 </div>

                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(link.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
