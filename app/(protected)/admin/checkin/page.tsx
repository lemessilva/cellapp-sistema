'use client'

import { useState, useRef, useEffect } from 'react'
import { useZxing } from 'react-zxing'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Search, QrCode, User, Calendar, MapPin } from 'lucide-react'
import { getTicketDetails, confirmCheckIn } from '@/app/actions/events'

export default function CheckInPage() {
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState<string | null>(null)
  const [ticketData, setTicketData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle')
  const [message, setMessage] = useState('')

  const { ref } = useZxing({
    onDecodeResult(result) {
      if (scanning && !loading) {
        handleScan(result.getText())
      }
    },
    paused: !scanning || loading,
  })

  // Play sound
  const playSound = (type: 'success' | 'error') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2
        osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.3); // A1
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error('Audio feedback failed', e);
    }
  }

  const handleScan = async (code: string) => {
    setScanning(false)
    setLoading(true)
    setResult(code)
    
    // Clean code if it's a URL (get the last part or param)
    // Assuming code is the ID for now
    const id = code.split('/').pop() || code

    const res = await getTicketDetails(id)
    
    if (res.error || !res.registration) {
      setStatus('error')
      setMessage(res.error || 'Ingresso inválido')
      setTicketData(null)
      playSound('error')
    } else {
      setTicketData(res.registration)
      if (res.registration.checkIn) {
        setStatus('warning')
        setMessage('Check-in já realizado!')
        playSound('error')
      } else {
        setStatus('idle') // Ready to confirm
      }
    }
    setLoading(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleScan(manualInput)
  }

  const handleConfirm = async () => {
    if (!ticketData) return
    
    setLoading(true)
    const res = await confirmCheckIn(ticketData.id)
    
    if (res.error) {
      setStatus('error')
      setMessage(res.error)
      playSound('error')
    } else {
      setStatus('success')
      setMessage('Check-in realizado com sucesso!')
      playSound('success')
      // Auto reset after 2 seconds
      setTimeout(reset, 2000)
    }
    setLoading(false)
  }

  const reset = () => {
    setResult(null)
    setTicketData(null)
    setStatus('idle')
    setMessage('')
    setScanning(true)
    setManualInput('')
  }

  return (
    <div className={`min-h-screen p-4 flex flex-col items-center transition-colors duration-500 ${
      status === 'success' ? 'bg-green-100' : 
      status === 'error' ? 'bg-red-100' : 
      status === 'warning' ? 'bg-yellow-100' : 'bg-slate-50'
    }`}>
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold text-slate-900">Event Check-in</h1>
          <p className="text-slate-500">Escaneie o QR Code do ingresso</p>
        </div>

        {/* Scanner / Result Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center transition-all">
          {scanning ? (
            <div className="relative w-full h-full min-h-[400px] bg-black">
              <video ref={ref} className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-xl flex items-center justify-center">
                <div className="w-64 h-1 bg-red-500/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
                Aponte a câmera para o QR Code
              </div>
            </div>
          ) : (
            <div className="p-8 text-center w-full animate-in fade-in zoom-in duration-300">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
                  <span className="text-slate-500">Processando...</span>
                </div>
              ) : ticketData ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto overflow-hidden ring-4 ring-white shadow-lg">
                    {ticketData.user?.foto_url ? (
                      <img src={ticketData.user.foto_url} alt={ticketData.user.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{ticketData.user?.nome}</h2>
                    <p className="text-slate-500 font-medium">{ticketData.user?.role}</p>
                    {ticketData.user?.categoria === 'CRIANCA' && (
                      <span className="inline-block px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full mt-1 font-bold">
                        Criança
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-left space-y-3 text-sm border border-slate-100">
                    <div className="flex items-center gap-3 text-slate-700">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <span className="font-medium">{ticketData.event.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <MapPin className="w-5 h-5 text-indigo-500" />
                      <span>{ticketData.event.location || 'Local não definido'}</span>
                    </div>
                  </div>

                  {status === 'success' && (
                    <div className="flex flex-col items-center text-green-600 gap-2 animate-in zoom-in">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="w-12 h-12" />
                      </div>
                      <span className="font-bold text-lg">{message}</span>
                    </div>
                  )}

                  {status === 'warning' && (
                    <div className="flex flex-col items-center text-yellow-600 gap-2">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <CheckCircle className="w-12 h-12" />
                      </div>
                      <span className="font-bold text-lg">{message}</span>
                      <p className="text-sm text-yellow-700">Check-in realizado em {new Date(ticketData.checkInAt).toLocaleString()}</p>
                      <button onClick={reset} className="w-full py-3 mt-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                        Próximo
                      </button>
                    </div>
                  )}

                  {status === 'idle' && (
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={reset}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleConfirm}
                        className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform active:scale-95"
                      >
                        Confirmar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-red-600 gap-4">
                  <div className="p-4 bg-red-100 rounded-full">
                    <XCircle className="w-16 h-16" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-lg block">{message}</span>
                    <span className="text-sm opacity-80">Verifique o código e tente novamente</span>
                  </div>
                  <button onClick={reset} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition mt-2">
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Input */}
        {scanning && (
          <form onSubmit={handleManualSubmit} className="flex gap-2 animate-in slide-in-from-bottom-4">
            <input 
              type="text" 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Digite o código manualmente..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <button 
              type="submit"
              disabled={!manualInput}
              className="p-3 bg-slate-900 text-white rounded-xl disabled:opacity-50 hover:bg-slate-800 transition shadow-sm"
            >
              <Search className="w-6 h-6" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
