'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Share2, Copy, UserPlus, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { generateInvite } from '@/app/actions/leader'

export default function InviteGenerator() {
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    // Se já tiver link, não gera outro sem pedir (pode ser o mesmo token valido)
    // Mas aqui vamos gerar sempre um novo para garantir frescor
    const res = await generateInvite()
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      const fullLink = `${window.location.origin}/cadastro?token=${res.token}`
      setLink(fullLink)
      setIsOpen(true)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite para Célula',
          text: 'Olá! Quero te convidar para participar da nossa célula. Acesse o link para se cadastrar:',
          url: link
        })
      } catch (err) {
        // Ignora erro de cancelamento do usuário
      }
    } else {
      handleCopy()
    }
  }

  return (
    <>
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-6 h-6" /> Convidar Novo Membro
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Gere um link e QR Code para facilitar o cadastro.
            </p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-white text-purple-700 font-bold py-3 px-6 rounded-xl hover:bg-purple-50 transition-colors active:scale-95 whitespace-nowrap flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Gerando...' : 'Gerar Convite'}
          </button>
        </div>
      </section>

      {/* Modal de Convite */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Convite Gerado! 🚀</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm">
                <QRCode 
                    value={link} 
                    size={200} 
                    viewBox={`0 0 256 256`}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
              
              <div className="w-full space-y-3">
                <p className="text-center text-sm text-slate-500">
                  Peça para o visitante escanear ou envie o link:
                </p>
                
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <code className="text-xs flex-1 truncate font-mono text-slate-600">{link}</code>
                  <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-800">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Compartilhar Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
