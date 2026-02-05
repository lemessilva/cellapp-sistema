'use client'

import { useState } from 'react'
import { updateChurchInfo } from '@/app/actions/church-info'
import { updateSiteConfiguration } from '@/app/actions/website'
import { createBanner, deleteBanner, toggleBannerStatus } from '@/app/actions/banners'
import { uploadBrandAsset, deleteAsset, uploadGalleryImage, sendPushNotification } from '@/app/actions/media'
import { Layout, Calendar, Share2, Save, Plus, Trash2, Image as ImageIcon, Loader2, X, Eye, EyeOff, FileText, RadioTower, Smartphone, Crop as CropIcon, User, Link as LinkIcon, Video, Palette, Megaphone, Send, Grid, Download, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IPhoneSimulator } from '@/components/admin/IPhoneSimulator'
import { InlineImageCropper } from '@/components/admin/ImageCropper'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type WebsiteEditorProps = {
  initialConfig: any
  initialBanners: any[]
  initialResources: any[]
  initialCells: any[]
  initialEvents: any[]
  initialChurchInfo: any
  initialBioLinks: any[]
  initialSermonSeries: any[]
  initialBrandAssets: any[]
  initialGalleryImages: any[]
  initialNotificationHistory: any[]
  initialTab?: string
}

export default function WebsiteEditor({ 
  initialConfig, 
  initialBanners, 
  initialResources,
  initialCells,
  initialEvents,
  initialChurchInfo,
  initialBioLinks,
  initialSermonSeries,
  initialBrandAssets,
  initialGalleryImages,
  initialNotificationHistory,
  initialTab = 'general'
}: WebsiteEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const defaultTab = initialTab === 'push' ? 'notifications' : (initialTab || 'general')
  
  // New Media States
  const [brandAssets] = useState(initialBrandAssets)
  const [galleryImages] = useState(initialGalleryImages)
  const [notificationHistory] = useState(initialNotificationHistory)

  // Blaster Form
  const [blastForm, setBlastForm] = useState({
    title: '',
    message: '',
    link: '',
    target: 'ALL'
  })
  
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

  // New Banner Form State
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    linkBotao: '',
    textoBotao: '',
    desktopFile: null as Blob | null,
    mobileFile: null as Blob | null,
    desktopPreview: null as string | null,
    mobilePreview: null as string | null
  })

  // --- HANDLERS ---

  // 1. Brand & Media Handlers
  async function handleUploadBrand(e: React.ChangeEvent<HTMLInputElement>, type: string) {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setLoading(true)
    const formData = new FormData()
    formData.append('title', file.name)
    formData.append('type', type)
    formData.append('file', file)

    try {
      const res = await uploadBrandAsset(formData)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Arquivo enviado!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro no upload')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveColor(hex: string) {
    setLoading(true)
    const formData = new FormData()
    formData.append('title', 'Cor da Marca')
    formData.append('type', 'PALETTE')
    formData.append('colorHex', hex)

    try {
      const res = await uploadBrandAsset(formData)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Cor salva!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao salvar cor')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAsset(id: string, model: 'BrandAsset' | 'GalleryImage') {
    if (!confirm('Tem certeza?')) return
    setLoading(true)
    try {
      const res = await deleteAsset(id, model)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Item removido!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao excluir')
    } finally {
      setLoading(false)
    }
  }

  async function handleUploadGallery(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    
    setLoading(true)
    const formData = new FormData()
    Array.from(e.target.files).forEach(file => {
      formData.append('files', file)
    })

    try {
      const res = await uploadGalleryImage(formData)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} fotos enviadas!`)
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro no upload')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendBlast() {
    if (!blastForm.title || !blastForm.message) {
      return toast.error('Preencha título e mensagem')
    }
    setLoading(true)
    try {
      const res = await sendPushNotification(blastForm)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Enviado para ${res.count} pessoas!`)
        setBlastForm({ ...blastForm, title: '', message: '' })
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro no envio')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  }

  // 2. Banner Handlers
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

      toast.success('Banner criado com sucesso!')
      handleClearEditor()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao criar banner.')
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
      toast.error('Erro ao deletar banner.')
    }
  }

  const handleToggleBanner = async (id: string) => {
    try {
      await toggleBannerStatus(id)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao alterar status.')
    }
  }

  // 3. Config Handlers
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
      toast.success('Configurações salvas!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar.')
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

      toast.success('Identidade atualizada!')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar identidade.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Editor & Config */}
      <div className="lg:col-span-7">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="brand">Brand Kit</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
          </TabsList>

          {/* TAB 1: GERAL (Banners, Identity, Schedule) */}
          <TabsContent value="general" className="space-y-6">
            
            {/* 1.1 Banners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  Banners da Home
                </CardTitle>
                <CardDescription>Gerencie o carrossel principal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banner Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="space-y-4">
                    {!cropperState.imageSrc ? (
                      <div className="w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                            <p className="text-sm font-medium text-slate-700">Novo Banner</p>
                            <p className="text-xs text-slate-400">1920x1080 (16:9)</p>
                          </div>
                          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCropperState(prev => ({ ...prev, isOpen: true, aspect: 16/9, target: 'desktop' }))}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 ${
                              cropperState.target === 'desktop' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'
                            }`}
                          >
                            <Smartphone className="w-3 h-3 rotate-90" /> Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => setCropperState(prev => ({ ...prev, isOpen: true, aspect: 16/9, target: 'mobile' }))}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 ${
                              cropperState.target === 'mobile' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'
                            }`}
                          >
                            <Smartphone className="w-3 h-3" /> Mobile
                          </button>
                        </div>

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
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img 
                                src={cropperState.target === 'desktop' ? newBanner.desktopPreview! : (newBanner.mobilePreview || newBanner.desktopPreview!)} 
                                alt="Preview" 
                                className="w-full h-full object-contain" 
                             />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button onClick={() => setCropperState(prev => ({ ...prev, isOpen: true }))} className="px-3 py-1 bg-white text-indigo-600 rounded-lg text-xs font-bold">
                                  Ajustar
                                </button>
                                <button onClick={handleClearEditor} className="px-3 py-1 bg-white text-red-600 rounded-lg text-xs font-bold">
                                  Remover
                                </button>
                             </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           <input type="text" placeholder="Título" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="px-3 py-2 rounded-lg border text-sm" />
                           <input type="text" placeholder="Subtítulo" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} className="px-3 py-2 rounded-lg border text-sm" />
                           <input type="text" placeholder="Texto Botão" value={newBanner.textoBotao} onChange={e => setNewBanner({...newBanner, textoBotao: e.target.value})} className="px-3 py-2 rounded-lg border text-sm" />
                           <input type="text" placeholder="Link Botão" value={newBanner.linkBotao} onChange={e => setNewBanner({...newBanner, linkBotao: e.target.value})} className="px-3 py-2 rounded-lg border text-sm" />
                        </div>
                        <Button onClick={handleAddBanner as any} disabled={loading || !newBanner.desktopFile} className="w-full">
                          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />} Salvar Banner
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner List */}
                <div className="space-y-3">
                  {initialBanners.map((banner) => (
                    <div key={banner.id} className="flex gap-4 p-3 bg-white rounded-lg border border-slate-200 items-center">
                      <div className="w-16 h-9 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={banner.desktopUrl} alt={banner.titulo} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{banner.titulo}</h4>
                        <p className="text-xs text-slate-500 truncate">{banner.subtitulo}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggleBanner(banner.id)} className={`p-2 rounded hover:bg-slate-100 ${banner.ativo ? 'text-green-600' : 'text-slate-400'}`}>
                          {banner.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 1.2 Identidade Visual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-600" />
                  Identidade & Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Igreja</Label>
                    <Input value={churchInfo.name} onChange={e => setChurchInfo({...churchInfo, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Principal (Tema)</Label>
                    <Select value={churchInfo.themeColor} onValueChange={v => setChurchInfo({...churchInfo, themeColor: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Azul</SelectItem>
                        <SelectItem value="red">Vermelho</SelectItem>
                        <SelectItem value="green">Verde</SelectItem>
                        <SelectItem value="amber">Laranja</SelectItem>
                        <SelectItem value="purple">Roxo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input value={churchInfo.whatsapp} onChange={e => setChurchInfo({...churchInfo, whatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram (@)</Label>
                    <Input value={churchInfo.instagram} onChange={e => setChurchInfo({...churchInfo, instagram: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Vídeo Hero (YouTube URL)</Label>
                  <Input value={churchInfo.heroVideoUrl} onChange={e => setChurchInfo({...churchInfo, heroVideoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <Button onClick={handleSaveChurchInfo} disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" /> Salvar Identidade
                </Button>
              </CardContent>
            </Card>

            {/* 1.3 Programação Semanal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Programação Semanal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.weeklySchedule.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Select value={item.dia} onValueChange={(v) => handleScheduleChange(idx, 'dia', v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      className="w-24" 
                      value={item.horario} 
                      onChange={(e) => handleScheduleChange(idx, 'horario', e.target.value)} 
                    />
                    <Input 
                      className="flex-1" 
                      value={item.titulo} 
                      onChange={(e) => handleScheduleChange(idx, 'titulo', e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeScheduleItem(idx)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addScheduleItem} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Culto
                  </Button>
                  <Button onClick={handleSaveConfig} className="flex-1">
                    <Save className="w-4 h-4 mr-2" /> Salvar Agenda
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 1.4 Live Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RadioTower className="w-5 h-5 text-red-600" />
                  Status da Live
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Estamos ao vivo?</Label>
                    <p className="text-sm text-slate-500">Isso exibirá um aviso no topo do site.</p>
                  </div>
                  <Switch 
                    checked={formData.isLive} 
                    onCheckedChange={(checked) => handleChange('isLive', checked)} 
                  />
                </div>
                {formData.isLive && (
                  <div className="space-y-2">
                    <Label>Link da Transmissão</Label>
                    <Input value={formData.liveLink} onChange={e => handleChange('liveLink', e.target.value)} placeholder="https://youtube.com/..." />
                  </div>
                )}
                <Button onClick={handleSaveConfig} className="w-full">
                  <Save className="w-4 h-4 mr-2" /> Atualizar Status
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: BRAND KIT */}
          <TabsContent value="brand" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logotipos e Ícones</CardTitle>
                <CardDescription>Upload de arquivos PNG/SVG com fundo transparente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadBrand(e, 'LOGO')} accept="image/png,image/svg+xml" />
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium">Upload Logo Principal</span>
                    <span className="text-xs text-slate-500">PNG ou SVG</span>
                  </div>
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadBrand(e, 'ICON')} accept="image/png,image/svg+xml" />
                    <StarIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium">Upload Ícone (Favicon)</span>
                    <span className="text-xs text-slate-500">Quadrado (1:1)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Arquivos da Marca</h4>
                  {brandAssets.filter(a => ['LOGO', 'ICON'].includes(a.type)).map(asset => (
                    <div key={asset.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.fileUrl} alt={asset.title} className="max-w-full max-h-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{asset.title}</p>
                        <p className="text-xs text-slate-500">{asset.type}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(asset.fileUrl)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAsset(asset.id, 'BrandAsset')}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {brandAssets.length === 0 && <p className="text-sm text-slate-500 italic">Nenhum arquivo enviado.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores da Marca</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex items-end gap-4">
                    <div className="space-y-2 flex-1">
                      <Label>Adicionar Cor (Hex)</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-10" id="colorPicker" onChange={(e) => {
                          const input = document.getElementById('hexInput') as HTMLInputElement
                          if(input) input.value = e.target.value
                        }} />
                        <Input id="hexInput" placeholder="#000000" className="uppercase" />
                      </div>
                    </div>
                    <Button onClick={() => {
                      const input = document.getElementById('hexInput') as HTMLInputElement
                      if(input && input.value) handleSaveColor(input.value)
                    }}>Adicionar</Button>
                 </div>
                 <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-6">
                    {brandAssets.filter(a => a.type === 'PALETTE').map(asset => (
                      <div key={asset.id} className="group relative">
                        <div 
                          className="w-full aspect-square rounded-lg shadow-sm border"
                          style={{ backgroundColor: asset.colorHex }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 rounded-lg">
                           <button onClick={() => copyToClipboard(asset.colorHex)} className="text-white hover:text-indigo-200"><Copy className="w-4 h-4" /></button>
                           <button onClick={() => handleDeleteAsset(asset.id, 'BrandAsset')} className="text-white hover:text-red-200"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-xs text-center mt-1 font-mono text-slate-500">{asset.colorHex}</p>
                      </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: NOTIFICATIONS (PUSH) */}
          <TabsContent value="notifications" className="space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Megaphone className="w-5 h-5 text-indigo-600" />
                   Enviar Notificação Push
                 </CardTitle>
                 <CardDescription>Envie alertas para o app dos membros.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label>Título</Label>
                   <Input 
                      placeholder="Ex: Culto de Jovens hoje!" 
                      value={blastForm.title}
                      onChange={e => setBlastForm({...blastForm, title: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Mensagem</Label>
                   <Textarea 
                      placeholder="Escreva sua mensagem curta..." 
                      rows={3}
                      value={blastForm.message}
                      onChange={e => setBlastForm({...blastForm, message: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Link (Opcional)</Label>
                      <Input 
                        placeholder="/eventos" 
                        value={blastForm.link}
                        onChange={e => setBlastForm({...blastForm, link: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Público Alvo</Label>
                      <Select value={blastForm.target} onValueChange={v => setBlastForm({...blastForm, target: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todos os Usuários</SelectItem>
                          <SelectItem value="MEMBERS">Apenas Membros</SelectItem>
                          <SelectItem value="LEADERS">Liderança</SelectItem>
                          <SelectItem value="WORSHIP">Equipe de Louvor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                 </div>
                 <Button onClick={handleSendBlast} disabled={loading} className="w-full">
                   {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                   Enviar Notificação
                 </Button>
               </CardContent>
             </Card>

             <Card>
               <CardHeader><CardTitle>Histórico de Envios</CardTitle></CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {notificationHistory.map((notif: any) => (
                     <div key={notif.id} className="flex justify-between items-start p-3 border-b last:border-0">
                       <div>
                         <h4 className="font-bold text-sm">{notif.title}</h4>
                         <p className="text-sm text-slate-600">{notif.message}</p>
                         <div className="flex gap-2 mt-1">
                           <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{notif.target}</span>
                           <span className="text-xs text-slate-400">{new Date(notif.sentAt).toLocaleDateString()}</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="text-xs font-bold text-indigo-600">{notif.sentCount} envios</span>
                       </div>
                     </div>
                   ))}
                   {notificationHistory.length === 0 && <p className="text-sm text-slate-500">Nenhum envio recente.</p>}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          {/* TAB 4: GALLERY */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid className="w-5 h-5 text-indigo-600" />
                  Galeria da Home
                </CardTitle>
                <CardDescription>Fotos exibidas no grid da página inicial.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer relative group">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={handleUploadGallery}
                  />
                  <div className="bg-indigo-50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Adicionar Fotos</h3>
                  <p className="text-sm text-slate-500 mt-1">Arraste ou clique para selecionar (Múltiplos)</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => handleDeleteAsset(img.id, 'GalleryImage')}
                          className="rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* RIGHT COLUMN: Simulator */}
      <div className="hidden lg:block lg:col-span-5 sticky top-6">
        <IPhoneSimulator 
          config={formData}
          banners={initialBanners} // Note: Simulator might not update live with newBanner state unless we merge them, but for now using initial is safe or we can try to merge.
          churchInfo={churchInfo}
        />
        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
          <p className="font-bold mb-1">Dica:</p>
          O simulador mostra uma prévia aproximada. Sempre verifique no dispositivo real.
        </div>
      </div>
    </div>
  )
}

function StarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
