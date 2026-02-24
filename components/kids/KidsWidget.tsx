'use client'

import { useState } from 'react'
import { Baby, X, Plus, Trash2, Heart, Star, Sparkles, UserCircle, Edit2, Check } from 'lucide-react'
import { addKidOikos, removeKidOikos, updateKidData } from '@/app/actions/kids'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function KidsWidget({ children }: { children: any[] }) {
  const [selectedKid, setSelectedKid] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newOikosName, setNewOikosName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditingData, setIsEditingData] = useState(false)
  const [editData, setEditData] = useState({ data_nascimento: '', genero: '' })

  if (!children || children.length === 0) return null

  const handleOpenKid = (kid: any) => {
    setSelectedKid(kid)
    setEditData({
      data_nascimento: kid.data_nascimento ? new Date(kid.data_nascimento).toISOString().split('T')[0] : '',
      genero: kid.genero || ''
    })
    setIsModalOpen(true)
  }

  const handleUpdateKidData = async () => {
    if (!selectedKid) return
    setLoading(true)
    const res = await updateKidData(selectedKid.id, editData)
    setLoading(false)

    if (res.success) {
      toast.success('Dados atualizados!')
      setIsEditingData(false)
      setSelectedKid({
        ...selectedKid,
        data_nascimento: editData.data_nascimento,
        genero: editData.genero
      })
    } else {
      toast.error(res.error || 'Erro ao atualizar.')
    }
  }

  const handleAddOikos = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOikosName.trim() || !selectedKid) return

    setLoading(true)
    const res = await addKidOikos(selectedKid.id, newOikosName)
    setLoading(false)

    if (res.success) {
      toast.success('Amiguinho adicionado!')
      setNewOikosName('')
      // Update local state for immediate feedback
      setSelectedKid({
        ...selectedKid,
        oikos: [...(selectedKid.oikos || []), { id: Math.random().toString(), nome: newOikosName }]
      })
    } else {
      toast.error(res.error || 'Erro ao adicionar.')
    }
  }

  const handleRemoveOikos = async (oikosId: string) => {
    if (!selectedKid) return

    const res = await removeKidOikos(selectedKid.id, oikosId)
    if (res.success) {
      toast.success('Removido!')
      setSelectedKid({
        ...selectedKid,
        oikos: selectedKid.oikos.filter((o: any) => o.id !== oikosId)
      })
    }
  }

  return (
    <>
      {/* Widget na Home */}
      <div className="bg-gradient-to-br from-orange-400 to-yellow-400 p-6 rounded-3xl shadow-lg shadow-orange-100 hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => children.length === 1 ? handleOpenKid(children[0]) : setIsModalOpen(true)}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">
            <h3 className="text-xl font-bold">Espaço Kids</h3>
            <p className="text-orange-50 text-sm">
              {children.length === 1 ? `Gerenciar Oikós de ${children[0].nome.split(' ')[0]}` : 'Gerenciar Oikós dos seus filhos'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Principal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            
            {/* Header Lúdico */}
            <div className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 p-8 text-white relative">
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedKid(null); }}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">
                    {selectedKid ? `Oikós do ${selectedKid.nome.split(' ')[0]}` : 'Meus Filhos'}
                  </h2>
                  <p className="text-orange-50 font-medium">Ensine o caminho que se deve andar ❤️</p>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-orange-50/30">
              {!selectedKid ? (
                // Seleção de Filho
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {children.map((kid) => (
                    <button
                      key={kid.id}
                      onClick={() => handleOpenKid(kid)}
                      className="group flex flex-col items-center gap-3 p-4 rounded-3xl bg-white border-2 border-transparent hover:border-orange-400 hover:shadow-xl transition-all"
                    >
                      <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden ring-4 ring-orange-50 group-hover:ring-orange-200 transition-all">
                        {kid.foto_url ? (
                          <img src={kid.foto_url} alt={kid.nome} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-16 h-16 text-orange-300" />
                        )}
                      </div>
                      <span className="font-bold text-slate-700 text-lg">{kid.nome.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              ) : (
                // Painel da Criança
                <div className="space-y-8">
                  {/* Info Rápida e Edição */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        📝 Dados da Criança
                      </h3>
                      <button 
                        onClick={() => setIsEditingData(!isEditingData)}
                        className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
                      >
                        {isEditingData ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                      </button>
                    </div>

                    {isEditingData ? (
                      <div className="bg-white p-6 rounded-3xl border-2 border-orange-200 space-y-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nascimento</label>
                            <input 
                              type="date"
                              value={editData.data_nascimento}
                              onChange={(e) => setEditData({ ...editData, data_nascimento: e.target.value })}
                              className="w-full p-3 bg-orange-50 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-400 transition-colors font-medium"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gênero</label>
                            <select 
                              value={editData.genero}
                              onChange={(e) => setEditData({ ...editData, genero: e.target.value })}
                              className="w-full p-3 bg-orange-50 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-400 transition-colors font-medium"
                            >
                              <option value="">Selecione...</option>
                              <option value="M">Menino</option>
                              <option value="F">Menina</option>
                            </select>
                          </div>
                        </div>
                        <Button 
                          onClick={handleUpdateKidData}
                          disabled={loading}
                          className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2"
                        >
                          {loading ? 'Salvando...' : <><Check className="w-5 h-5" /> Salvar Alterações</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white p-4 rounded-3xl border border-orange-100 flex items-center gap-3">
                          <div className="p-2 bg-pink-50 rounded-xl text-pink-500"><Star className="w-5 h-5" /></div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nascimento</p>
                            <p className="font-bold text-slate-700">
                              {selectedKid.data_nascimento ? new Date(selectedKid.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informada'}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-3xl border border-orange-100 flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Heart className="w-5 h-5" /></div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Gênero</p>
                            <p className="font-bold text-slate-700">{selectedKid.genero === 'M' ? 'Menino' : selectedKid.genero === 'F' ? 'Menina' : 'Não informado'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lista Oikós Kids */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        🙏 Amiguinhos de Oração
                      </h3>
                    </div>

                    <form onSubmit={handleAddOikos} className="flex gap-2">
                      <input 
                        value={newOikosName}
                        onChange={(e) => setNewOikosName(e.target.value)}
                        placeholder="Nome do amiguinho..."
                        className="flex-1 p-4 bg-white border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-400 transition-colors font-medium"
                      />
                      <Button 
                        type="submit"
                        disabled={loading}
                        className="h-14 w-14 rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100"
                      >
                        <Plus className="w-8 h-8" />
                      </Button>
                    </form>

                    <div className="grid gap-3">
                      {selectedKid.oikos?.map((item: any) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-orange-100 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                              {item.nome.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-700">{item.nome}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveOikos(item.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      {(!selectedKid.oikos || selectedKid.oikos.length === 0) && (
                        <div className="text-center py-10 bg-white/50 rounded-3xl border-2 border-dashed border-orange-100">
                          <p className="text-slate-400 font-medium italic">Nenhum amiguinho na lista ainda.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {children.length > 1 && (
                    <button 
                      onClick={() => setSelectedKid(null)}
                      className="w-full py-4 text-orange-600 font-black text-sm uppercase tracking-widest hover:bg-orange-100/50 rounded-2xl transition-colors"
                    >
                      ← Voltar para Meus Filhos
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
