'use client'

import { useState } from 'react'
import { Check, Flame, Users, Heart } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { savePrayer } from '@/app/actions/prayer'

interface PrayerScreenProps {
  user: any
  oikos: any[]
  members: any[]
  hasPrayedToday: boolean
}

export default function PrayerScreen({ user, oikos, members, hasPrayedToday }: PrayerScreenProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFinishPrayer = async () => {
    setLoading(true)
    const res = await savePrayer(user.id)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      setIsModalOpen(false)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#818cf8', '#c7d2fe']
      })
      toast.success('Oração registrada com sucesso! 🔥')
    }
  }

  if (hasPrayedToday) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
          <Flame className="w-12 h-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Oração Realizada!</h2>
          <p className="text-slate-500">Você já intercedeu pela sua família e célula hoje.</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 w-full max-w-sm">
            <p className="text-sm font-medium text-slate-600">Continue firme! A oração do justo pode muito em seus efeitos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Olá, {user.nome.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Vamos começar o dia buscando a Deus?</p>
      </header>

      <div className="max-w-2xl mx-auto w-full bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Momento de Oração</h2>
            <p className="text-indigo-100 text-sm">Separe alguns minutos para interceder pelos seus Oikos e pela sua Célula.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-white text-indigo-600 font-bold py-4 px-6 rounded-2xl shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
          >
            Iniciar Oração de Hoje
          </button>
        </div>
      </div>

      {/* Modal Fullscreen Simplificado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-6 bg-white border-b flex justify-between items-center sticky top-0 z-10">
            <h3 className="font-bold text-lg text-slate-800">Intercedendo...</h3>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              Fechar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seção Oikos */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Heart className="w-5 h-5" />
                  <h4 className="font-bold text-lg">Meus Oikos</h4>
                </div>
                <p className="text-sm text-slate-500">Ore pela salvação e necessidades de:</p>
                
                {oikos.length > 0 ? (
                  <div className="space-y-3">
                    {oikos.map((o: any) => {
                      return (
                        <div 
                          key={o.id} 
                          className="p-3 rounded-xl border flex items-center gap-3 bg-white border-slate-100"
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-100 text-slate-500">
                             {o.nome.charAt(0)}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium text-slate-700">{o.nome}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-500 text-sm">
                    Você ainda não cadastrou nenhum Oikos no seu perfil.
                  </div>
                )}
              </section>

              {/* Seção Célula */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-violet-600">
                  <Users className="w-5 h-5" />
                  <h4 className="font-bold text-lg">Membros da Célula</h4>
                </div>
                <p className="text-sm text-slate-500">Ore pelos membros da sua célula:</p>

                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members
                      .filter((m: any) => m.id !== user.id) // Não mostrar a si mesmo
                      .map((m: any) => {
                        return (
                        <div 
                          key={m.id} 
                          className="p-3 rounded-xl border flex items-center gap-3 bg-white border-slate-100"
                        >
                          {m.foto_url ? (
                             <img src={m.foto_url} alt={m.nome} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                             <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-violet-100 text-violet-600">
                               {m.nome.charAt(0)}
                             </div>
                          )}
                          
                          <div className="flex-1">
                            <p className="font-medium text-slate-700">{m.nome}</p>
                            {m.oikos && m.oikos.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {m.oikos.map((o: any) => (
                                  <span key={o.id} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                                    <Heart className="w-2 h-2" />
                                    {o.nome}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {members.length <= 1 && (
                       <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-500 text-sm">
                          Apenas você nesta célula por enquanto.
                       </div>
                    )}
                  </div>
                ) : (
                   <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-500 text-sm">
                      Você não está vinculado a uma célula.
                   </div>
                )}
              </section>
            </div>
          </div>

          <div className="p-6 bg-white border-t fixed bottom-0 left-0 right-0 md:relative md:border-t-0">
            <button
              onClick={handleFinishPrayer}
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Salvando...' : (
                <>
                  <Check className="w-5 h-5" />
                  Concluir Oração
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
