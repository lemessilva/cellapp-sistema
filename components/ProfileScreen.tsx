'use client'

import { useState } from 'react'
import { updateProfile, addOikos, removeOikos } from '@/app/actions/profile'
import { toast } from 'sonner'
import { User, Save, Trash2, Plus, Phone, MapPin, Calendar, Heart, LogOut, FileText, Camera } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import PrayerReportButton from '@/components/reports/PrayerReportButton'
import type { ReportData } from '@/components/reports/PrayerCalendarPDF'
import { PhoneInput } from '@/components/ui/phone-input'

export default function ProfileScreen({ user, reportData }: { user: any, reportData?: ReportData }) {
  const [loading, setLoading] = useState(false)
  const [oikosName, setOikosName] = useState('')
  const [estadoCivil, setEstadoCivil] = useState(
    (user.estadoCivil || user.estado_civil || '') as string
  )

  // Address States for Auto-Complete
  const [cep, setCep] = useState(user.cep || '')
  const [endereco, setEndereco] = useState(user.endereco || '')
  const [numero, setNumero] = useState(user.numero || '')
  const [bairro, setBairro] = useState(user.bairro || '')
  const [cidade, setCidade] = useState(user.cidade || '')
  const [uf, setUf] = useState(user.estado || user.uf || '') 
  const [pontoReferencia, setPontoReferencia] = useState(user.pontoReferencia || '')
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  const checkCEP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep the raw value for state, but you might want to mask it visually
    const rawValue = e.target.value.replace(/\D/g, '')
    setCep(e.target.value)

    if (rawValue.length === 8) {
      setIsLoadingAddress(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawValue}/json/`)
        const data = await res.json()
        
        if (!data.erro) {
          setEndereco(data.logradouro)
          setBairro(data.bairro)
          setCidade(data.localidade)
          setUf(data.uf)
          
          // Focus on Number input for better UX
          document.getElementById('numeroInput')?.focus()
        }
      } catch (error) {
        console.error('Erro ao buscar CEP', error)
      } finally {
        setIsLoadingAddress(false)
      }
    }
  }

  const handleUpdateProfile = async (formData: FormData) => {
    setLoading(true)
    // Add userId to formData since it might not be in the form fields directly if not hidden input
    // But usually server action gets it from session. 
    // Wait, my updateProfile action in previous turn checked formData.get('userId').
    // I should ensure userId is passed if the action requires it. 
    // Let's check the action logic I recalled: "const userId = formData.get('userId') as string".
    // So I MUST append userId to formData or have a hidden input.
    // The previous code didn't show a hidden input for userId.
    // I will append it programmatically or add a hidden input. 
    // Adding hidden input is safer for standard form submission.
    
    // Actually, better to append it in the handler if using form action directly?
    // If I use <form action={handleUpdateProfile}>, the formData comes from inputs.
    // I'll add <input type="hidden" name="userId" value={user.id} /> to the form.
    
    const res = await updateProfile(formData)
    setLoading(false)

    if (res.error) toast.error(res.error)
    else toast.success('Perfil atualizado!')
  }

  const handleAddOikos = async () => {
    if (!oikosName.trim()) return
    const res = await addOikos(oikosName)
    if (res.error) toast.error(res.error)
    else {
      toast.success('Oikos adicionado!')
      setOikosName('')
    }
  }

  const handleRemoveOikos = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este Oikos?')) return
    const res = await removeOikos(id)
    if (res.error) toast.error(res.error)
    else toast.success('Oikos removido.')
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="text-slate-500">Gerencie seus dados e seus Oikos.</p>
        </div>
        <button 
          onClick={() => logout()}
          className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <User className="w-5 h-5" />
          <h2 className="font-bold text-lg">Dados Pessoais</h2>
        </div>

        <form action={handleUpdateProfile} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
             <div className="relative w-20 h-20 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-indigo-100">
                {user.foto_url ? (
                    <img src={user.foto_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-8 h-8" />
                    </div>
                )}
             </div>
             <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Foto de Perfil
                </label>
                <input 
                    type="file" 
                    name="foto_url"
                    accept="image/*"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input 
              name="nome" 
              defaultValue={user.nome} 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Telefone
                </label>
                <PhoneInput 
                name="telefone" 
                defaultValue={user.telefone || ''} 
                placeholder="(00) 00000-0000"
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Whatsapp</label>
              <PhoneInput
                name="whatsapp"
                defaultValue={user.whatsapp || user.telefone || ''}
                placeholder="(00) 00000-0000"
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Data de Nascimento
                </label>
                <input 
                name="data_nascimento" 
                type="date"
                defaultValue={
                  user.dataNascimento || user.data_nascimento
                    ? new Date(user.dataNascimento || user.data_nascimento)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
              <select
                name="sexo"
                defaultValue={user.sexo || user.genero || ''}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escolaridade</label>
              <select
                name="escolaridade"
                defaultValue={user.escolaridade || ''}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione</option>
                <option value="FUNDAMENTAL">Ensino Fundamental</option>
                <option value="MEDIO">Ensino Médio</option>
                <option value="SUPERIOR">Ensino Superior</option>
                <option value="POS">Pós-Graduação</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Naturalidade</label>
              <input
                name="naturalidade"
                defaultValue={user.naturalidade || ''}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UF Nascimento</label>
              <input
                name="ufNascimento"
                defaultValue={user.ufNascimento || ''}
                maxLength={2}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profissão</label>
              <input
                name="profissao"
                defaultValue={user.profissao || ''}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-2 space-y-4">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-sm">Endereço</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  CEP
                  {isLoadingAddress && <span className="text-xs text-indigo-600 animate-pulse">Buscando...</span>}
                </label>
                <input
                  name="cep"
                  value={cep}
                  onChange={checkCEP}
                  maxLength={9}
                  placeholder="00000-000"
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço (Rua)</label>
                <input
                  name="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                <input
                  id="numeroInput"
                  name="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                <input
                  name="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input
                  name="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">UF</label>
                    <input
                    name="estado"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    maxLength={2}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ponto de Referência</label>
                    <input
                    name="pontoReferencia"
                    value={pontoReferencia}
                    onChange={(e) => setPontoReferencia(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-2 space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">Família</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Pai</label>
                <input
                  name="nomePai"
                  defaultValue={user.nomePai || ''}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Mãe</label>
                <input
                  name="nomeMae"
                  defaultValue={user.nomeMae || ''}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado Civil</label>
                <select
                  name="estadoCivil"
                  value={estadoCivil}
                  onChange={(e) => setEstadoCivil(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione</option>
                  <option value="SOLTEIRO">Solteiro(a)</option>
                  <option value="CASADO">Casado(a)</option>
                  <option value="VIUVO">Viúvo(a)</option>
                  <option value="DIVORCIADO">Divorciado(a)</option>
                </select>
              </div>

              {estadoCivil === 'CASADO' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cônjuge</label>
                  <input
                    name="nomeConjuge"
                    defaultValue={user.nomeConjuge || user.conjuge_nome || ''}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-2 space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">Dados Eclesiásticos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Conversão</label>
                <input
                  name="dataConversao"
                  type="date"
                  defaultValue={
                    user.dataConversao
                      ? new Date(user.dataConversao).toISOString().split('T')[0]
                      : ''
                  }
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Igreja Anterior</label>
                <input
                  name="igrejaAnterior"
                  defaultValue={user.igrejaAnterior || ''}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
          </button>
        </form>
      </section>

      {/* Relatórios */}
      {reportData && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold text-lg">Relatórios</h2>
            </div>
            <p className="text-sm text-slate-500">Baixe seus históricos de oração e atividades.</p>

            <PrayerReportButton data={reportData} />
        </section>
      )}

      {/* Gestão de Oikos */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <Heart className="w-5 h-5" />
          <h2 className="font-bold text-lg">Meus Oikos</h2>
        </div>
        <p className="text-sm text-slate-500">Pessoas que você está orando e evangelizando.</p>

        <div className="flex gap-2">
          <input 
            value={oikosName}
            onChange={(e) => setOikosName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddOikos()}
            placeholder="Nome do novo Oikos"
            className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleAddOikos}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2 mt-4">
          {user.oikos && user.oikos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.oikos.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-medium text-slate-700 truncate">{o.nome}</span>
                    <button 
                        onClick={() => handleRemoveOikos(o.id)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover Oikos"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-4">Nenhum Oikos cadastrado.</p>
          )}
        </div>
      </section>
    </div>
  )
}
