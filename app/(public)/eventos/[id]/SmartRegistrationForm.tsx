'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerForEvent } from '@/app/actions/events'
import { toast } from 'sonner'
import { Loader2, Ticket, CheckCircle, User, ArrowRight, Smartphone } from 'lucide-react'
import QRCode from 'react-qr-code'
import { PhoneInput } from '@/components/ui/phone-input'

type SmartRegistrationFormProps = {
  eventId: string
  eventTitle: string
  eventDate: Date
  eventLocation: string | null
  currentUser: { nome: string } | null
}

export default function SmartRegistrationForm({ eventId, eventTitle, eventDate, eventLocation, currentUser }: SmartRegistrationFormProps) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [confirmedRegistrationId, setConfirmedRegistrationId] = useState<string | null>(null)

  // Handlers
  const handleLoggedUserRegistration = async () => {
    setLoading(true)
    try {
        const result = await registerForEvent(eventId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Inscrição confirmada!')
            router.push('/app/dashboard')
        }
    } catch (error) {
        toast.error('Erro ao realizar inscrição')
    } finally {
        setLoading(false)
    }
  }

  const handleGuestRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName || !guestPhone) {
        toast.error('Preencha todos os campos')
        return
    }

    setLoading(true)
    try {
        const result = await registerForEvent(eventId, { name: guestName, phone: guestPhone })
        if ('error' in result && result.error) {
            toast.error(result.error)
        } else if ('success' in result && result.success) {
            toast.success('Inscrição confirmada!')
            if ('registrationId' in result && result.registrationId) {
                setConfirmedRegistrationId(result.registrationId)
            } else {
                setConfirmedRegistrationId('ID-PENDING')
            }
        } else {
            toast.error('Erro ao processar resposta da inscrição')
        }
    } catch (error) {
        toast.error('Erro ao realizar inscrição')
    } finally {
        setLoading(false)
    }
  }

  // 1. Success State (Visitor Ticket)
  if (confirmedRegistrationId) {
    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-xl p-6 text-center text-slate-900 shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Inscrição Confirmada!</h3>
                <p className="text-sm text-slate-500 mb-6">Tire um print desta tela e apresente na entrada.</p>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 inline-block w-full">
                    <div className="flex justify-center mb-4">
                        <QRCode 
                            value={JSON.stringify({ 
                                id: confirmedRegistrationId, 
                                event: eventTitle,
                                name: guestName 
                            })}
                            size={160}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <div className="text-xs font-mono text-slate-400 break-all">
                        ID: {confirmedRegistrationId}
                    </div>
                </div>

                <div className="text-left space-y-2 text-sm text-slate-600 mb-6">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Participante:</span>
                        <span className="font-bold text-slate-900">{guestName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Evento:</span>
                        <span className="font-bold text-slate-900">{eventTitle}</span>
                    </div>
                </div>

                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                >
                    Nova Inscrição
                </button>
            </div>
        </div>
    )
  }

  // 2. Logged User View
  if (currentUser) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser.nome?.[0] || 'U'}
                </div>
                <div>
                    <p className="text-sm text-indigo-200">Logado como</p>
                    <p className="font-bold text-white">{currentUser.nome}</p>
                </div>
            </div>
            
            <button
                onClick={handleLoggedUserRegistration}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <Ticket className="w-5 h-5" />
                        Confirmar Presença
                    </>
                )}
            </button>
            <p className="text-xs text-center text-slate-500">
                Sua inscrição ficará vinculada ao seu perfil de membro.
            </p>
        </div>
    )
  }

  // 3. Visitor View
  return (
    <form onSubmit={handleGuestRegistration} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                    type="text" 
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Ex: João Silva"
                    required
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp</label>
            <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                    type="tel" 
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="(00) 00000-0000"
                    required
                />
            </div>
        </div>

        <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    Garantir meu Lugar
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
        </button>
        
        <div className="pt-4 text-center border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-2">Já é membro da igreja?</p>
            <Link href="/login" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Fazer Login
            </Link>
        </div>
    </form>
  )
}
