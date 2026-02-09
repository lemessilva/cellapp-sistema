'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateAlertSettings } from '@/app/actions/website'

interface AppAlertManagerProps {
  initialData: {
    active: boolean
    title: string | null
    message: string | null
  }
}

export default function AppAlertManager({ initialData }: AppAlertManagerProps) {
  const [active, setActive] = useState(initialData.active)
  const [title, setTitle] = useState(initialData.title || '')
  const [message, setMessage] = useState(initialData.message || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateAlertSettings({
        active,
        title,
        message
      })
      toast.success('Configurações de alerta salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle>Banner de Alerta do App</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="alert-mode" className="text-sm text-muted-foreground">
              {active ? 'Ativado' : 'Desativado'}
            </Label>
            <Switch 
              id="alert-mode" 
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        </div>
        <CardDescription>
          Exiba uma mensagem urgente no topo de todas as páginas do aplicativo.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="alert-title">Título do Aviso</Label>
          <Input 
            id="alert-title" 
            placeholder="Ex: Culto Cancelado, Aviso Importante..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!active}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="alert-message">Mensagem Completa</Label>
          <Input 
            id="alert-message" 
            placeholder="Ex: Devido às fortes chuvas, não teremos culto hoje." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!active}
          />
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/50 px-6 py-3">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
