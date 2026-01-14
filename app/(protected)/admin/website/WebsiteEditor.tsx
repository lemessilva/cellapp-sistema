'use client'

import { useState } from 'react'
import { updateSiteConfiguration } from '@/app/actions/website'
import { Layout, Calendar, Share2, Save, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function WebsiteEditor({ initialConfig }: { initialConfig: any }) {
  const [activeTab, setActiveTab] = useState('appearance')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    heroTitle: initialConfig.heroTitle || '',
    heroSubtitle: initialConfig.heroSubtitle || '',
    heroBgImage: initialConfig.heroBgImage || '',
    heroCtaText: initialConfig.heroCtaText || '',
    heroCtaLink: initialConfig.heroCtaLink || '',
    weeklySchedule: initialConfig.weeklySchedule ? JSON.parse(initialConfig.weeklySchedule) : [],
    contactWhatsapp: initialConfig.contactWhatsapp || '',
    socialInstagram: initialConfig.socialInstagram || '',
    footerAddress: initialConfig.footerAddress || '',
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

  const handleSave = async () => {
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
          Aparência (Hero)
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
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Tab: Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título Principal</label>
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) => handleChange('heroTitle', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Bem-vindo à Nossa Igreja"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo</label>
                  <textarea
                    value={formData.heroSubtitle}
                    onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Um lugar de fé, esperança e amor."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Imagem de Fundo (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.heroBgImage}
                      onChange={(e) => handleChange('heroBgImage', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <div className="w-10 h-10 flex-shrink-0 bg-slate-100 rounded-lg border flex items-center justify-center overflow-hidden">
                       {formData.heroBgImage ? (
                         <img src={formData.heroBgImage} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <ImageIcon className="w-5 h-5 text-slate-400" />
                       )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Cole o link direto da imagem.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Botão</label>
                    <input
                      type="text"
                      value={formData.heroCtaText}
                      onChange={(e) => handleChange('heroCtaText', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: Visite-nos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link do Botão</label>
                    <input
                      type="text"
                      value={formData.heroCtaLink}
                      onChange={(e) => handleChange('heroCtaLink', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: #schedule"
                    />
                  </div>
                </div>
              </div>
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

      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-slate-50 border-t flex justify-end">
        <button
          onClick={handleSave}
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
    </div>
  )
}
