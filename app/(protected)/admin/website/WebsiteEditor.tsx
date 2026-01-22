'use client'

import { useState } from 'react'
import { updateChurchInfo } from '@/app/actions/church-info'
import { updateSiteConfiguration } from '@/app/actions/website'
import { createBanner, deleteBanner, toggleBannerStatus } from '@/app/actions/banners'
import { createResource, deleteResource } from '@/app/actions/resources'
import { BioLinksManager } from '@/components/admin/BioLinksManager'
import { SermonsManager } from '@/components/admin/SermonsManager'
import { Layout, Calendar, Share2, Save, Plus, Trash2, Image as ImageIcon, Loader2, X, Eye, EyeOff, FileText, RadioTower, Smartphone, Crop as CropIcon, User, Link as LinkIcon, Video, Palette } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IPhoneSimulator } from '@/components/admin/IPhoneSimulator'
import { InlineImageCropper } from '@/components/admin/ImageCropper'
import { Button } from '@/components/ui/button'

type WebsiteEditorProps = {
  initialConfig: any
  initialBanners: any[]
  initialResources: any[]
  initialCells: any[]
  initialEvents: any[]
  initialChurchInfo: any
  initialBioLinks: any[]
  initialSermonSeries: any[]
}

export default function WebsiteEditor({ 
  initialConfig, 
  initialBanners, 
  initialResources,
  initialCells,
  initialEvents,
  initialChurchInfo,
  initialBioLinks,
  initialSermonSeries
}: WebsiteEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('appearance')
  const [loading, setLoading] = useState(false)
  
  // States for Cropper & Library
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean
    imageSrc: string | null
    aspect: number
    target: 'desktop' | 'mobile'
  }>({ isOpen: false, imageSrc: null, aspect: 16/9, target: 'desktop' })

  // Site Config State
  const [formData, setFormData] = useState({
    heroTitle: initialConfig.heroTitle || '',
    heroSubtitle: initialConfig.heroSubtitle || '',
    heroBgImage: initialConfig.heroBgImage || '',
    heroCtaText: initialConfig.heroCtaText || '',
    heroCtaLink: initialConfig.heroCtaLink || '',
    alertActive: initialConfig.alertActive || false,
    alertText: initialConfig.alertText || '',
    alertColor: initialConfig.alertColor || 'bg-blue-600',
    alertLink: initialConfig.alertLink || '',
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
    desktopFile: null as Blob | null,
    mobileFile: null as Blob | null,
    // Previews for UI
    desktopPreview: null as string | null,
    mobilePreview: null as string | null
  })

  // Resource Form State
  const [newResource, setNewResource] = useState({
    titulo: '',
    tipo: 'PDF',
    publicoAlvo: 'GERAL',
    file: null as File | null
  })

  // Church Info State
  const [churchInfo, setChurchInfo] = useState({
    name: initialChurchInfo?.name || '',
    whatsapp: initialChurchInfo?.whatsapp || '',
    address: initialChurchInfo?.address || '',
    instagram: initialChurchInfo?.instagram || '',
    youtube: initialChurchInfo?.youtube || '',
    themeColor: initialChurchInfo?.themeColor || 'blue',
    logoUrl: initialChurchInfo?.logoUrl || '',
    logoFile: null as File | null,
    heroVideoUrl: initialChurchInfo?.heroVideoUrl || ''
  })

  // Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const result = reader.result as string
        setCropperState({
          isOpen: true,
          imageSrc: result,
          aspect: 16/9,
          target: 'desktop'
        })
      })
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    if (cropperState.target === 'desktop') {
      setNewBanner(prev => ({ ...prev, desktopFile: blob, desktopPreview: url }))
    } else {
      setNewBanner(prev => ({ ...prev, mobileFile: blob, mobilePreview: url }))
    }
    setCropperState(prev => ({ ...prev, isOpen: false }))
  }

  const handleClearEditor = () => {
    setNewBanner({
      title: '', subtitle: '', linkBotao: '', textoBotao: '',
      desktopFile: null, mobileFile: null,
      desktopPreview: null, mobilePreview: null
    })
    setCropperState({ isOpen: false, imageSrc: null, aspect: 16/9, target: 'desktop' })
  }

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

  const handleSaveChurchInfo = async () => {
    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', churchInfo.name)
      data.append('whatsapp', churchInfo.whatsapp)
      data.append('address', churchInfo.address)
      data.append('instagram', churchInfo.instagram)
      data.append('youtube', churchInfo.youtube)
      data.append('themeColor', churchInfo.themeColor)
      data.append('heroVideoUrl', churchInfo.heroVideoUrl)
      if (churchInfo.logoFile) {
        data.append('logoFile', churchInfo.logoFile)
      }

      const result = await updateChurchInfo(data)
      if (result.error) throw new Error(result.error)

      alert('Identidade atualizada com sucesso!')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar identidade.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBanner.desktopFile) {
      return alert('É necessário definir a imagem do banner (Desktop).')
    }
    
    setLoading(true)
    try {
      const data = new FormData()
      data.append('title', newBanner.title)
      data.append('subtitle', newBanner.subtitle)
      data.append('linkBotao', newBanner.linkBotao)
      data.append('textoBotao', newBanner.textoBotao)
      
      if (newBanner.desktopFile) data.append('desktopFile', newBanner.desktopFile, 'desktop-banner.jpg')
      if (newBanner.mobileFile) data.append('mobileFile', newBanner.mobileFile, 'mobile-banner.jpg')

      const result = await createBanner(data)
      if (result.error) throw new Error(result.error)

      alert('Banner criado com sucesso!')
      handleClearEditor()
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
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Editor & Config */}
      <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
            onClick={() => setActiveTab('identity')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'identity' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            Identidade & Contato
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'links' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Links na Bio
          </button>
          <button
            onClick={() => setActiveTab('sermons')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sermons' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Video className="w-4 h-4" />
            Mensagens
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* 1. Add/Edit Banner Section (Inline) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    Adicionar / Editar Banner
                  </h3>
                  <p className="text-sm text-slate-500">Crie um novo banner para o carrossel da home.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* File Input & Cropper */}
                  <div className="space-y-4">
                    {/* If no image selected, show upload */}
                    {!cropperState.imageSrc ? (
                      <div className="w-full">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                               <Plus className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">Clique para selecionar imagem</p>
                            <p className="text-xs text-slate-400 mt-1">Recomendado: 1920x1080 (16:9)</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Aspect Control Tabs */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCropperState(prev => ({ ...prev, isOpen: true, aspect: 16/9, target: 'desktop' }))}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 ${
                              cropperState.target === 'desktop' 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Smartphone className="w-3 h-3 rotate-90" />
                            Ajuste Desktop (16:9)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCropperState(prev => ({ ...prev, isOpen: true, aspect: 16/9, target: 'mobile' }))}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 ${
                              cropperState.target === 'mobile' 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                             <Smartphone className="w-3 h-3" />
                             Ajuste Mobile (16:9)
                          </button>
                        </div>

                        {/* Cropper or Preview */}
                        {cropperState.isOpen ? (
                          <div className="animate-in fade-in zoom-in-95 duration-200">
                             <InlineImageCropper
                                imageSrc={cropperState.imageSrc}
                                aspect={cropperState.aspect}
                                onCropComplete={handleCropComplete}
                                onCancel={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
                             />
                          </div>
                        ) : (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video group">
                             {/* Show the preview of the currently selected target, or fallback */}
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img 
                                src={cropperState.target === 'desktop' ? newBanner.desktopPreview! : (newBanner.mobilePreview || newBanner.desktopPreview!)} 
                                alt="Preview" 
                                className="w-full h-full object-contain" 
                             />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button 
                                  onClick={() => setCropperState(prev => ({ ...prev, isOpen: true }))}
                                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-50"
                                >
                                  <CropIcon className="w-4 h-4 inline mr-2" />
                                  Ajustar Recorte
                                </button>
                                <button 
                                  onClick={handleClearEditor}
                                  className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium text-sm hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 inline mr-2" />
                                  Remover
                                </button>
                             </div>
                             <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-sm">
                                {cropperState.target === 'desktop' ? 'Preview Desktop' : 'Preview Mobile'}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Text Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Título Principal</label>
                      <input 
                        type="text" 
                        value={newBanner.title}
                        onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ex: Bem-vindo à nossa casa"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
                      <textarea 
                        value={newBanner.subtitle}
                        onChange={(e) => setNewBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                        placeholder="Ex: Uma igreja família para você pertencer..."
                      />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Texto do Botão</label>
                       <input 
                         type="text" 
                         value={newBanner.textoBotao}
                         onChange={(e) => setNewBanner(prev => ({ ...prev, textoBotao: e.target.value }))}
                         className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                         placeholder="Ex: Saiba Mais"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Link do Botão</label>
                       <input 
                         type="text" 
                         value={newBanner.linkBotao}
                         onChange={(e) => setNewBanner(prev => ({ ...prev, linkBotao: e.target.value }))}
                         className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                         placeholder="Ex: /celulas"
                       />
                    </div>
                  </div>

                  <div className="pt-2">
                     <Button 
                       onClick={handleAddBanner as any} 
                       disabled={loading || !newBanner.desktopFile}
                       className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12"
                     >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Banner
                     </Button>
                  </div>
                </div>
              </div>

              {/* Existing Banners List */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800">Banners Ativos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {initialBanners.map((banner) => (
                    <div key={banner.id} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 items-center">
                      <div className="w-24 aspect-video bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative group cursor-pointer"
                           onClick={() => {
                             // Optional: Edit existing banner? For now, just view
                           }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={banner.desktopUrl} alt={banner.titulo} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{banner.titulo}</h4>
                        <p className="text-xs text-slate-500 truncate">{banner.subtitulo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBanner(banner.id)}
                          className={`p-2 rounded-lg transition-colors ${banner.ativo ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
                          title={banner.ativo ? "Desativar" : "Ativar"}
                        >
                          {banner.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {initialBanners.length === 0 && (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm">
                      Nenhum banner cadastrado.
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Bar Configuration */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <RadioTower className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Barra de Avisos Global</h3>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.alertActive}
                      onChange={(e) => handleChange('alertActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {formData.alertActive && (
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <div>
                      <input 
                        type="text" 
                        value={formData.alertText || ''}
                        onChange={(e) => handleChange('alertText', e.target.value)}
                        placeholder="Texto do aviso..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        value={formData.alertColor}
                        onChange={(e) => handleChange('alertColor', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      >
                        <option value="bg-blue-600">Azul</option>
                        <option value="bg-red-600">Vermelho</option>
                        <option value="bg-yellow-500">Amarelo</option>
                        <option value="bg-green-600">Verde</option>
                      </select>
                      <input 
                        type="text" 
                        value={formData.alertLink || ''}
                        onChange={(e) => handleChange('alertLink', e.target.value)}
                        placeholder="Link (opcional)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
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

          {/* Tab: Identity & Contact */}
          {activeTab === 'identity' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Branding Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Branding & Identidade
                  </h3>
                  <p className="text-sm text-slate-500">Logo e nome da igreja.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo do Site</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                        {churchInfo.logoUrl || churchInfo.logoFile ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={churchInfo.logoFile ? URL.createObjectURL(churchInfo.logoFile) : churchInfo.logoUrl} 
                            alt="Logo Preview" 
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setChurchInfo(prev => ({ ...prev, logoFile: e.target.files![0] }))
                            }
                          }}
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                        />
                        <p className="text-xs text-slate-500 mt-2">Recomendado: PNG Transparente, Quadrado.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Igreja</label>
                    <input
                      type="text"
                      value={churchInfo.name}
                      onChange={(e) => setChurchInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: Minha Igreja"
                    />
                    <p className="text-xs text-slate-500 mt-1">Usado quando a logo não está disponível.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL do Vídeo de Fundo (MP4)</label>
                    <input
                      type="text"
                      value={churchInfo.heroVideoUrl}
                      onChange={(e) => setChurchInfo(prev => ({ ...prev, heroVideoUrl: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://exemplo.com/video.mp4"
                    />
                    <p className="text-xs text-slate-500 mt-1">Link direto para o vídeo que será exibido no fundo da Hero Section. Deixe em branco para usar a imagem.</p>
                  </div>
                </div>
              </div>

              {/* Theme Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    Tema Visual
                  </h3>
                  <p className="text-sm text-slate-500">Escolha a cor principal do site.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  {[
                    { id: 'blue', name: 'Azul (Padrão)', color: 'bg-blue-600' },
                    { id: 'red', name: 'Vermelho (Paixão)', color: 'bg-red-600' },
                    { id: 'dark', name: 'Dark (Jovens)', color: 'bg-slate-900' },
                    { id: 'gold', name: 'Dourado (Especial)', color: 'bg-yellow-500' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setChurchInfo(prev => ({ ...prev, themeColor: theme.id }))}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                        churchInfo.themeColor === theme.id
                          ? 'border-indigo-600 bg-white shadow-sm'
                          : 'border-transparent bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${theme.color} shadow-sm`} />
                      <span className={`text-sm font-medium ${
                        churchInfo.themeColor === theme.id ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {theme.name}
                      </span>
                      {churchInfo.themeColor === theme.id && (
                        <div className="absolute top-[-8px] right-[-8px] bg-indigo-600 text-white p-1 rounded-full shadow-md">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                           </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    Contato
                  </h3>
                  <p className="text-sm text-slate-500">Informações de contato e endereço.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={churchInfo.whatsapp}
                      onChange={(e) => setChurchInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: (11) 99999-9999"
                    />
                    <p className="text-xs text-slate-500 mt-1">Atualiza o botão flutuante do site.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                    <textarea
                      value={churchInfo.address}
                      onChange={(e) => setChurchInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                      placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP"
                    />
                    <p className="text-xs text-slate-500 mt-1">Exibido no rodapé do site.</p>
                  </div>
                </div>
              </div>

              {/* Social Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-600" />
                    Redes Sociais
                  </h3>
                  <p className="text-sm text-slate-500">Links para suas redes.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Instagram (Link ou @usuario)</label>
                    <input
                      type="text"
                      value={churchInfo.instagram}
                      onChange={(e) => setChurchInfo(prev => ({ ...prev, instagram: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: @minhaigreja"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">YouTube (Link do Canal)</label>
                    <input
                      type="text"
                      value={churchInfo.youtube}
                      onChange={(e) => setChurchInfo(prev => ({ ...prev, youtube: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: https://youtube.com/c/minhaigreja"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveChurchInfo} 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Identidade
                </Button>
              </div>

            </div>
          )}

          {/* Tab: Bio Links */}
          {activeTab === 'links' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <BioLinksManager initialLinks={initialBioLinks} />
            </div>
          )}

          {/* Tab: Sermons */}
          {activeTab === 'sermons' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <SermonsManager initialSeries={initialSermonSeries} />
            </div>
          )}

          {/* Tab: Resources */}
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

          {/* Tab: Live */}
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
      </div>

      {/* RIGHT COLUMN: Simulator */}
      <div className="hidden lg:block lg:col-span-5 sticky top-6">
        <IPhoneSimulator 
          config={formData}
          banners={initialBanners}
          cells={initialCells}
          // We pass the MOBILE preview if available, otherwise desktop preview, otherwise null
          imageUrl={newBanner.mobilePreview || newBanner.desktopPreview}
          schedule={formData.weeklySchedule}
        />
      </div>
    </div>
  )
}