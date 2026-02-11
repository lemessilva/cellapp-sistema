'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Users, Check, Eye, Phone, MapPin, FileCheck, FileText, UserPlus, Baby, Calendar, Settings, CalendarDays, BarChart3, Clock, Download, TrendingUp } from 'lucide-react'
import InviteGenerator from '@/components/InviteGenerator'
import Link from 'next/link'
import { approveReport } from '@/app/actions/meeting'
import { createMember } from '@/app/actions/member'
import { MultiSelect } from '@/components/ui/multi-select-strings'
import { Badge } from '@/components/ui/badge'

const MEMBER_FUNCTIONS = [
  { label: 'Tesoureiro', value: 'Tesoureiro' },
  { label: 'Secretário', value: 'Secretário' },
  { label: 'Louvor', value: 'Louvor' },
  { label: 'Mídia / Tech', value: 'Mídia' },
  { label: 'Intercessão', value: 'Intercessão' },
  { label: 'Kids', value: 'Kids' },
  { label: 'Acolhimento', value: 'Acolhimento' },
  { label: 'Evangelismo', value: 'Evangelismo' },
  { label: 'Social', value: 'Social' },
]
import { CellSettingsModal } from '@/components/settings/CellSettingsModal'
import RosterManager from '@/components/roster/RosterManager'
import { PrayerCalendarPDF } from '@/components/reports/PrayerCalendarPDF'
import MemberGrowthModal from '@/components/growth/MemberGrowthModal'
import { StartLiveMeetingButton } from '@/components/live/StartLiveMeetingButton'
import dynamic from 'next/dynamic'
import { PhoneInput } from '@/components/ui/phone-input'
import { PhotoUpload } from '@/components/photos/PhotoUpload'

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), { ssr: false })

export default function LeaderScreen({ user, members }: { user: any, members: any[] }) {
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [growthModalMember, setGrowthModalMember] = useState<any>(null)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [isChild, setIsChild] = useState(false)
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])

  const cell = user.celulaLiderada
  const cellAddress = cell ? `${cell.addressStreet || ''}, ${cell.addressNumber || ''}` : ''

  // 1. Permissão para mexer na ESTRUTURA (Botões: Editar Célula, Trocar Líder, Excluir)
  const canManageStructure = user.role === 'ADMIN' || user.role === 'SUPERVISOR' || user.role === 'LIDER'

  // 2. Permissão para mexer na OPERAÇÃO (Botões: Lançar Relatório, Editar Oferta)
  const canEditReport = user.id === cell?.leaderId || user.id === cell?.secretaryId

  const potentialParents = members.filter(m => m.categoria !== 'CRIANCA')

  async function handleRegister(formData: FormData) {
    setLoadingRegister(true)
    formData.append('isChild', isChild.toString())
    formData.append('funcoes', selectedFunctions.join(', '))
    
    const res = await createMember(formData)
    
    setLoadingRegister(false)
    if (res?.error) {
        toast.error(res.error)
    } else {
        toast.success('Membro cadastrado com sucesso!')
        setIsRegisterModalOpen(false)
        setIsChild(false)
        setSelectedFunctions([])
    }
  }

  async function handleApprove(reportId: string) {
    const res = await approveReport(reportId)
    if (res.error) {
        toast.error(res.error)
    } else {
        toast.success('Relatório aprovado!')
    }
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear()
  }

  const checkPrayedToday = (logs: any[]) => {
      if (!logs || logs.length === 0) return false
      const today = new Date()
      return logs.some(log => isSameDay(new Date(log.createdAt), today))
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">
                {user.celulaLiderada?.nome || 'Minha Célula'}
            </h1>
            <p className="text-slate-500">Gestão de membros e crescimento.</p>
        </div>
        <div className="flex items-center gap-2">
            {cell && (
                <PhotoUpload cellId={cell.id} cellName={cell.nome} />
            )}
            {canManageStructure && (
                <button 
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                    title="Configurações da Célula"
                >
                    <Settings className="w-6 h-6" />
                </button>
            )}
        </div>
      </header>

      {/* Start Live Meeting Button */}
      {cell && (
        <StartLiveMeetingButton cellId={cell.id} />
      )}



      {/* Escala e Planejamento */}
      <div 
        onClick={() => setIsRosterModalOpen(true)}
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 cursor-pointer hover:scale-[1.01] transition-transform"
      >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-xl">Escala & Planejamento</h3>
                    <p className="text-indigo-100 text-sm">Organize as funções e locais das próximas reuniões.</p>
                </div>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg font-bold text-sm backdrop-blur-md">
                Acessar
            </div>
        </div>
      </div>

      {/* Atalho para Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/app/celula/reuniao" className="block group">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between group-hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Relatórios</h3>
                <p className="text-slate-500 text-xs">Lançar frequência e ofertas</p>
              </div>
            </div>
            <div className="text-indigo-600 font-bold text-sm">
              Acessar
            </div>
          </div>
        </Link>

        <Link href="/app/celula/relatorios/mensal" className="block group">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between group-hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Relatório Mensal</h3>
                <p className="text-slate-500 text-xs">Gerar PDF consolidado</p>
              </div>
            </div>
            <div className="text-green-600 font-bold text-sm">
              Gerar
            </div>
          </div>
        </Link>
      </div>

      {/* Convite e Cadastro Manual */}
      <div className="grid md:grid-cols-2 gap-4">
          <InviteGenerator />
          
          {/* Botão Cadastro Manual */}
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-indigo-600 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
            </div>
            <span className="font-bold">Cadastro Manual</span>
            <span className="text-xs text-indigo-400">Adicionar Criança ou Membro sem convite</span>
          </button>
      </div>

      {/* Lista de Membros */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 mb-2">
          <Users className="w-5 h-5" />
          <h2 className="font-bold text-lg">Membros ({members.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${member.categoria === 'CRIANCA' ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-600'}`}>
                    {member.categoria === 'CRIANCA' ? <Baby className="w-5 h-5" /> : member.nome.charAt(0)}
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800">{member.nome}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                       {member.categoria === 'CRIANCA' && <span className="bg-pink-100 text-pink-700 px-1.5 rounded text-[10px] font-bold">KIDS</span>}
                       {checkPrayedToday(member.prayerLogs) 
                         ? <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Orou hoje</span> 
                         : <span className="text-slate-400">Pendente</span>}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedMember(member)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <p className="text-slate-500">Nenhum membro cadastrado nesta célula ainda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Configurações */}
      {cell && (
        <CellSettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            initialData={cell}
            members={members}
        />
      )}

      {/* Modal Escala */}
      {isRosterModalOpen && cell && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-indigo-600" />
                    Escala de Serviço
                  </h3>
                  <button onClick={() => setIsRosterModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>
              
              <RosterManager 
                cellId={cell.id}
                defaultMeetingDay={cell.dia_reuniao}
                defaultAddress={cellAddress}
                members={members}
                onOpenSettings={() => {
                    setIsRosterModalOpen(false)
                    setIsSettingsModalOpen(true)
                }}
              />
           </div>
        </div>
      )}

      {/* Modal Cadastro Manual */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Novo Cadastro</h3>
                  <button onClick={() => {
                    setIsRegisterModalOpen(false)
                    setSelectedFunctions([])
                  }} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {/* Toggle Criança */}
              <div className="mb-6 bg-slate-50 p-1 rounded-xl flex">
                  <button 
                    type="button"
                    onClick={() => setIsChild(false)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isChild ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Adulto
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsChild(true)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isChild ? 'bg-pink-100 text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Criança
                  </button>
              </div>

              <form action={handleRegister} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                      <input name="nome" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: João da Silva" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                          <input name="dataNascimento" type="date" required={isChild} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Gênero</label>
                          <select name="genero" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                              <option value="">Selecione</option>
                              <option value="M">Masculino</option>
                              <option value="F">Feminino</option>
                          </select>
                      </div>
                  </div>

                  {isChild ? (
                      // Campos Criança
                      <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Batismo (Opcional)</label>
                            <input name="dataBatismo" type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Responsável (Pai/Mãe na Célula)</label>
                            <select name="responsavelId" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Selecione um responsável...</option>
                                {potentialParents.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </select>
                          </div>
                      </>
                  ) : (
                      // Campos Adulto
                      <>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Responsável (Líder/Mentor)</label>
                              <select name="responsavelId" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                                  <option value="">Selecione um responsável (Opcional)</option>
                                  {potentialParents.map(p => (
                                      <option key={p.id} value={p.id}>{p.nome}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login)</label>
                              <input name="email" type="email" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="email@exemplo.com" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone (WhatsApp)</label>
                              <PhoneInput name="telefone" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="(00) 00000-0000" />
                          </div>
                          <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100">
                              O membro receberá instruções para definir sua senha no primeiro acesso (Feature futura). Por enquanto, cadastre e oriente.
                          </div>
                      </>
                  )}

                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Funções / Ministérios</label>
                      <MultiSelect 
                        options={MEMBER_FUNCTIONS}
                        selected={selectedFunctions}
                        onChange={setSelectedFunctions}
                        placeholder="Selecione as funções..."
                      />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loadingRegister}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 mt-4 flex items-center justify-center gap-2 ${loadingRegister ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                      {loadingRegister ? 'Salvando...' : 'Cadastrar Membro'}
                  </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedMember.nome}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium inline-block">
                            {selectedMember.role}
                        </span>
                        {selectedMember.categoria === 'CRIANCA' && (
                            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium inline-block">
                                Criança
                            </span>
                        )}
                      </div>
                      
                      {selectedMember.funcoes && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedMember.funcoes.split(', ').map((f: string) => (
                            <Badge key={f} variant="emerald" className="text-[10px] py-0 px-1.5">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                      ✕
                  </button>
              </div>
              
              <div className="space-y-4">
                  {/* Dados Pessoais */}
                  <div className="space-y-2 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{selectedMember.telefone || 'Sem telefone'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{selectedMember.endereco || 'Sem endereço'}</span>
                      </div>
                      {selectedMember.data_nascimento && (
                          <div className="flex items-center gap-3 text-slate-600 text-sm">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{new Date(selectedMember.data_nascimento).toLocaleDateString()}</span>
                          </div>
                      )}
                  </div>

                  {/* Botão Trilho de Crescimento */}
                  <button
                    onClick={() => {
                        setGrowthModalMember(selectedMember)
                        setSelectedMember(null)
                    }}
                    className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Trilho de Crescimento
                  </button>

                  {/* Métricas de Oração */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                          Vida de Oração ({new Date().getFullYear()})
                      </h4>
                      
                      {(() => {
                          const logs = selectedMember.prayerLogs || []
                          const lastPrayer = logs.length > 0 ? new Date(logs[0].createdAt) : null
                          const thisMonth = logs.filter((l: any) => new Date(l.createdAt).getMonth() === new Date().getMonth()).length
                          const thisYear = logs.length // Já filtrado na query
                          
                          return (
                              <>
                                  <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                                          <span className="text-xs text-slate-500 block">Este Mês</span>
                                          <span className="font-bold text-slate-800 text-lg">{thisMonth}</span>
                                      </div>
                                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                                          <span className="text-xs text-slate-500 block">Este Ano</span>
                                          <span className="font-bold text-slate-800 text-lg">{thisYear}</span>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                                      <Clock className="w-3 h-3 text-orange-400" />
                                      Última: {lastPrayer ? lastPrayer.toLocaleDateString('pt-BR') : 'Nunca registrou'}
                                  </div>

                                  <div className="pt-2">
                                      <PDFDownloadLink
                                          document={
                                              <PrayerCalendarPDF 
                                                  data={{
                                                      memberName: selectedMember.nome,
                                                      year: new Date().getFullYear(),
                                                      cellName: user.celulaLiderada?.nome || 'Célula',
                                                      leaders: user.celulaLiderada?.lider?.nome || '',
                                                      supervisors: user.celulaLiderada?.supervisor?.nome || '',
                                                      prayedDates: logs.map((l: any) => new Date(l.createdAt).toISOString().split('T')[0])
                                                  }} 
                                              />
                                          }
                                          fileName={`calendario-oracao-${selectedMember.nome.split(' ')[0].toLowerCase()}.pdf`}
                                          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                                      >
                                          <Download className="w-4 h-4" />
                                          Baixar Calendário PDF
                                      </PDFDownloadLink>
                                  </div>
                              </>
                          )
                      })()}
                  </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                  >
                      Fechar
                  </button>
              </div>
           </div>
        </div>
      )}
      {growthModalMember && (
        <MemberGrowthModal 
          member={growthModalMember} 
          isOpen={!!growthModalMember} 
          onClose={() => setGrowthModalMember(null)} 
        />
      )}
    </div>
  )
}
