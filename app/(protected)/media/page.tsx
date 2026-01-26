'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, FileText, Globe, BarChart3, AlertTriangle, Save, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getChurchInfo, updateGlobalAlert } from '@/app/actions/church-info'

export default function MediaDashboard() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Alert State
  const [alertActive, setAlertActive] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const data = await getChurchInfo()
      if (data) {
        setAlertActive(data.isAlertActive || false)
        setAlertTitle(data.globalAlertTitle || '')
        setAlertMessage(data.globalAlertMessage || '')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAlert() {
    setSaving(true)
    try {
      const result = await updateGlobalAlert({
        title: alertTitle,
        message: alertMessage,
        isActive: alertActive
      })

      if (result.success) {
        toast.success('Aviso global atualizado!')
      } else {
        toast.error('Erro ao salvar aviso')
      }
    } catch (error) {
      toast.error('Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  const menuItems = [
    {
      title: 'Gerenciar Eventos',
      description: 'Criar inscrições e ver lista de participantes',
      icon: Calendar,
      href: '/admin/eventos',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Mensagem Pastoral',
      description: 'Publicar palavra semanal para as células',
      icon: FileText,
      href: '/admin/pastoral',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Website & App',
      description: 'Configurar tema, links e informações da igreja',
      icon: Globe,
      href: '/admin/website',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Trilho de Crescimento',
      description: 'Gerenciar conteúdo e vídeos do trilho',
      icon: BarChart3,
      href: '/admin/trilho',
      color: 'bg-orange-50 text-orange-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel de Mídia</h1>
        <p className="text-slate-500">Gerencie a comunicação e conteúdo da igreja</p>
      </div>

      {/* Global Alert Card */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Banner de Alerta do App</h2>
              <p className="text-sm text-slate-500">Exibe um aviso importante no topo de todas as páginas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="alert-mode" className="text-sm font-medium text-slate-700">
              {alertActive ? 'Ativado' : 'Desativado'}
            </Label>
            <Switch 
              id="alert-mode" 
              checked={alertActive}
              onCheckedChange={setAlertActive}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Título do Aviso</Label>
            <Input 
              placeholder="Ex: Culto de Jovens adiado" 
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Mensagem Completa</Label>
            <Input 
              placeholder="Ex: Devido à chuva, nosso culto será online..." 
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveAlert} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="group block bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
