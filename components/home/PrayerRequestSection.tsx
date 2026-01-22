'use client'

import { useState } from 'react'
import { submitPrayerRequest } from '@/app/actions/prayer'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PrayerRequestSection() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const content = formData.get('content') as string

    if (!name || !content) {
      toast.error('Nome e pedido são obrigatórios')
      setLoading(false)
      return
    }

    const result = await submitPrayerRequest({ name, phone, content })

    if (result.success) {
      setSuccess(true)
      toast.success('Pedido enviado com sucesso!')
    } else {
      toast.error(result.error || 'Erro ao enviar pedido')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="bg-slate-800/50 p-8 rounded-2xl shadow-sm border border-slate-700 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Recebemos seu pedido 🙏</h2>
            <p className="text-slate-300 mb-6">
              Nossa equipe de intercessão estará orando por você. Creia que Deus já está agindo!
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Enviar outro pedido
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pedidos-oracao" className="py-24 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-3xl"></div>
       </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Posso Orar por Você?</h2>
          <p className="text-slate-400">
            Não importa o que você esteja passando, queremos estar com você em oração.
            Deixe seu pedido abaixo e nossa equipe irá interceder por sua vida.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-slate-800/50 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-700 backdrop-blur-sm">
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Seu Nome *</label>
              <input 
                type="text" 
                name="name" 
                id="name"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Como você gostaria de ser chamado?"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">WhatsApp (Opcional)</label>
              <input 
                type="tel" 
                name="phone" 
                id="phone"
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">Como podemos orar? *</label>
              <textarea 
                name="content" 
                id="content"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                placeholder="Descreva seu pedido de oração..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Pedido de Oração'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
