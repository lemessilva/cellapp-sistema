'use client'

import { useState } from 'react'
import { updateSiteConfiguration } from '@/app/actions/website'
import { createBanner, deleteBanner, toggleBannerStatus } from '@/app/actions/banners'
import { createResource, deleteResource } from '@/app/actions/resources'
import { Layout, Calendar, Share2, Save, Plus, Trash2, Image as ImageIcon, Loader2, X, Eye, EyeOff, FileText, RadioTower } from 'lucide-react'
import { useRouter } from 'next/navigation'

type WebsiteEditorProps = {
  initialConfig: any
  initialBanners: any[]
  initialResources: any[]
}

export default function WebsiteEditor({ initialConfig, initialBanners, initialResources }: WebsiteEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('appearance')
  const [loading, setLoading] = useState(false)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  
  // Site Config State
  const [formData, setFormData] = useState({
    // Keep legacy fields just in case, but we won't show them all
    heroTitle: initialConfig.heroTitle || '',
    heroSubtitle: initialConfig.heroSubtitle || '',
    heroBgImage: initialConfig.heroBgImage || '',
    heroCtaText: initialConfig.heroCtaText || '',
    heroCtaLink: initialConfig.heroCtaLink || '',
    weeklySchedule: initialConfig.weeklySchedule ? JSON.parse(initialConfig.weeklySchedule) : [],
    contactWhatsapp: initialConfig.contactWhatsapp || '',
    socialInstagram: initialConfig.socialInstagram || '',
    footerAddress: initialConfig.footerAddress || '',
    isLive: initialConfig.isLive ?? false,
    liveLink: initialConfig.liveLink || '',
  })

  // New Banner Form State
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    linkBotao: '',
    textoBotao: '',
    file: null as File | null
  })

  const [newResource, setNewResource] = useState({
    titulo: '',
    tipo: 'PDF',
    publicoAlvo: 'GERAL',
    file: null as File | null
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.weeklySchedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setFormData(prev => ({ ...prev, weeklySchedule: newSchedule }))
  }

  const addScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: [...prev.weeklySchedule, { dia: 'Domingo', horario: '19:00', titulo: 'Novo Culto' }]
    }))
  }

  const removeScheduleItem = (index: number) => {
    const newSchedule = formData.weeklySchedule.filter((_: any, i: number) => i !== index)
    setFormData(prev => ({ ...prev, weeklySchedule: newSchedule }))
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      await updateSiteConfiguration({
        ...formData,
        weeklySchedule: JSON.stringify(formData.weeklySchedule)
      })
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar configurações.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBanner.file) return alert('Selecione uma imagem')
    
    setLoading(true)
    try {
      const data = new FormData()
      data.append('title', newBanner.title)
      data.append('subtitle', newBanner.subtitle)
      data.append('linkBotao', newBanner.linkBotao)
      data.append('textoBotao', newBanner.textoBotao)
      data.append('file', newBanner.file)

      const result = await createBanner(data)
      if (result.error) throw new Error(result.error)

      alert('Banner criado com sucesso!')
      setIsBannerModalOpen(false)
      setNewBanner({ title: '', subtitle: '', linkBotao: '', textoBotao: '', file: null })
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao criar banner.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return
    try {
      await deleteBanner(id)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao deletar banner.')
    }
  }

  const handleToggleBanner = async (id: string) => {
    try {
      await toggleBannerStatus(id)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao alterar status.')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'appearance' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layout className="w-4 h-4" />
          Banners (Carrossel)
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'schedule' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Programação
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'contact' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Contato e Rodapé
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'resources' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Recursos
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'live' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <RadioTower className="w-4 h-4" />
          Transmissão
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Tab: Appearance (Banners) */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-slate-800">Banners da Home</h3>
                <p className="text-sm text-slate-500">Gerencie as imagens que aparecem no carrossel principal.</p>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Novo Banner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialBanners.map((banner) => (
                <div key={banner.id} className="group relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                  <div className="aspect-video bg-slate-200 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.imageUrl} alt={banner.titulo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleBanner(banner.id)}
                        className="p-2 bg-white rounded-full text-slate-700 hover:text-indigo-600 transition-colors"
                        title={banner.ativo ? "Desativar" : "Ativar"}
                      >
                        {banner.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{banner.titulo}</h4>
                        <p className="text-sm text-slate-500 line-clamp-1">{banner.subtitulo}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${banner.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {banner.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {initialBanners.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhum banner cadastrado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800">Dias de Culto</h3>
              <button
                onClick={addScheduleItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Dia
              </button>
            </div>

            <div className="space-y-3">
              {formData.weeklySchedule.map((item: any, index: number) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Dia da Semana</label>
                      <select
                        value={item.dia}
                        onChange={(e) => handleScheduleChange(index, 'dia', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Domingo">Domingo</option>
                        <option value="Segunda-feira">Segunda-feira</option>
                        <option value="Terça-feira">Terça-feira</option>
                        <option value="Quarta-feira">Quarta-feira</option>
                        <option value="Quinta-feira">Quinta-feira</option>
                        <option value="Sexta-feira">Sexta-feira</option>
                        <option value="Sábado">Sábado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Horário</label>
                      <input
                        type="time"
                        value={item.horario}
                        onChange={(e) => handleScheduleChange(index, 'horario', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Título do Culto</label>
                      <input
                        type="text"
                        value={item.titulo}
                        onChange={(e) => handleScheduleChange(index, 'titulo', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ex: Culto da Família"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeScheduleItem(index)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.weeklySchedule.length === 0 && (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhum horário cadastrado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp (apenas números)</label>
                <input
                  type="text"
                  value={formData.contactWhatsapp}
                  onChange={(e) => handleChange('contactWhatsapp', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: 5511999999999"
                />
                <p className="text-xs text-slate-500 mt-1">Formato internacional: DDI + DDD + Número</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instagram (Usuário)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400">@</span>
                  <input
                    type="text"
                    value={formData.socialInstagram.replace('@', '')}
                    onChange={(e) => handleChange('socialInstagram', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="igreja"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={formData.footerAddress}
                  onChange={(e) => handleChange('footerAddress', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Rua das Flores, 123 - Centro, Cidade - UF"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-slate-800">Recursos para Download</h3>
                <p className="text-sm text-slate-500">Envie materiais para a igreja e para a liderança.</p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!newResource.file) {
                  alert('Selecione um arquivo')
                  return
                }
                setLoading(true)
                try {
                  const data = new FormData()
                  data.append('titulo', newResource.titulo)
                  data.append('tipo', newResource.tipo)
                  data.append('publicoAlvo', newResource.publicoAlvo)
                  data.append('file', newResource.file)

                  const result = await createResource(data)
                  if (result.error) {
                    alert(result.error)
                  } else {
                    alert('Recurso criado com sucesso!')
                    setNewResource({
                      titulo: '',
                      tipo: 'PDF',
                      publicoAlvo: 'GERAL',
                      file: null
                    })
                    router.refresh()
                  }
                } catch (error) {
                  console.error(error)
                  alert('Erro ao criar recurso.')
                } finally {
                  setLoading(false)
                }
              }}
              className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título do arquivo</label>
                  <input
                    type="text"
                    value={newResource.titulo}
                    onChange={(e) => setNewResource(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Manual do Líder"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Público alvo</label>
                  <select
                    value={newResource.publicoAlvo}
                    onChange={(e) => setNewResource(prev => ({ ...prev, publicoAlvo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="GERAL">Todos</option>
                    <option value="LIDERES">Líderes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={newResource.tipo}
                    onChange={(e) => setNewResource(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="IMAGEM">Imagem</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setNewResource(prev => ({ ...prev, file: e.target.files![0] }))
                        }
                      }}
                    />
                    {newResource.file ? (
                      <div className="text-sm text-indigo-600 font-medium flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        {newResource.file.name}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-sm text-slate-500">Clique para selecionar um arquivo</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    📄 Formatos aceitos: PDF, DOCX ou Imagens. Ideal para escalas e esboços.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Adicionar recurso
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">Lista de recursos</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50">
                {initialResources.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">
                    Nenhum recurso cadastrado.
                  </div>
                )}
                {initialResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between px-4 py-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{resource.titulo}</p>
                        <p className="text-xs text-slate-500">
                          {resource.tipo === 'PDF' ? 'PDF' : resource.tipo === 'IMAGEM' ? 'Imagem' : 'Outro'} •{' '}
                          {resource.publicoAlvo === 'LIDERES' ? 'Líderes' : 'Todos'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        Baixar
                      </a>
                      <button
                        onClick={async () => {
                          if (!confirm('Deseja realmente excluir este recurso?')) return
                          try {
                            const result = await deleteResource(resource.id)
                            if (result.error) {
                              alert(result.error)
                            } else {
                              router.refresh()
                            }
                          } catch (error) {
                            console.error(error)
                            alert('Erro ao excluir recurso.')
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-slate-800">Transmissão Ao Vivo</h3>
              <p className="text-sm text-slate-500">
                Controle o modo ao vivo do site e o link da transmissão.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleChange('isLive', !formData.isLive)}
                className={`w-full max-w-md flex items-center justify-between px-4 py-3 rounded-2xl border transition-colors ${
                  formData.isLive
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    formData.isLive ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <RadioTower className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      {formData.isLive ? 'Ao vivo ativado' : 'Ao vivo desligado'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Quando ligado, uma barra vermelha aparece na Home com o link da transmissão.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                    formData.isLive ? 'bg-red-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      formData.isLive ? 'translate-x-4' : ''
                    }`}
                  />
                </div>
              </button>

              <div className="max-w-xl">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link da Live (YouTube ou outro)
                </label>
                <input
                  type="text"
                  value={formData.liveLink}
                  onChange={(e) => handleChange('liveLink', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://youtube.com/..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Este link será usado na barra de alerta quando o modo ao vivo estiver ativado.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Actions (Only for Config Tabs) */}
      {activeTab !== 'appearance' && (
        <div className="p-6 bg-slate-50 border-t flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Alterações
          </button>
        </div>
      )}

      {/* Add Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Novo Banner</h3>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddBanner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={newBanner.title}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Bem-vindo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo</label>
                <textarea
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Uma igreja família"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Texto Botão</label>
                  <input
                    type="text"
                    value={newBanner.textoBotao}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, textoBotao: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Saiba Mais"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link Botão</label>
                  <input
                    type="text"
                    value={newBanner.linkBotao}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, linkBotao: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: /sobre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagem do Banner</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setNewBanner(prev => ({ ...prev, file: e.target.files![0] }))
                            }
                        }}
                    />
                    {newBanner.file ? (
                        <div className="text-sm text-indigo-600 font-medium flex items-center justify-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            {newBanner.file.name}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                            <p className="text-sm text-slate-500">Clique para selecionar uma imagem</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  📏 Tamanho recomendado: 1920x1080px (16:9). Mantenha o texto centralizado para não cortar no celular. Máx: 2MB.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Criar Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
