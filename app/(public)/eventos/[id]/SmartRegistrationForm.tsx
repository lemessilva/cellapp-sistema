'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerForEvent } from '@/app/actions/events'
import { toast } from 'sonner'
import { Loader2, Ticket, CheckCircle, User, ArrowRight, Smartphone, FileText } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useForm, Controller } from 'react-hook-form'
import { DynamicEventForm, FormField } from '@/components/events/DynamicEventForm'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SmartRegistrationFormProps = {
  eventId: string
  eventTitle: string
  eventDate: Date
  eventLocation: string | null
  currentUser: { nome: string } | null
  formConfig?: FormField[]
  requiresCpf?: boolean
}

type RegistrationFormData = {
  name: string
  phone: string
  cpf: string
  answers: any
}

export default function SmartRegistrationForm({ 
    eventId, 
    eventTitle, 
    currentUser,
    formConfig = [],
    requiresCpf = false
}: SmartRegistrationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmedRegistrationId, setConfirmedRegistrationId] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('') // For success screen

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<RegistrationFormData>({
    defaultValues: {
        name: currentUser?.nome || '',
        phone: '',
        cpf: '',
        answers: {}
    }
  })

  // CPF Mask Logic
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    // Apply mask 999.999.999-99
    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4')
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3')
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{3}).*/, '$1.$2')
    }
    
    onChange(value)
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setLoading(true)
    try {
        // If not logged in, require name and phone
        if (!currentUser && (!data.name || !data.phone)) {
            toast.error('Preencha nome e telefone')
            setLoading(false)
            return
        }

        // Prepare payload
        const payload = {
            name: currentUser ? undefined : data.name,
            phone: currentUser ? undefined : data.phone,
            cpf: requiresCpf ? data.cpf : undefined,
            answers: data.answers
        }

        const result = await registerForEvent(eventId, payload)

        if (result.error) {
            toast.error(result.error)
        } else if (result.success) {
            toast.success('Inscrição confirmada!')
            setGuestName(currentUser?.nome || data.name)
            
            if (result.registrationId) {
                setConfirmedRegistrationId(result.registrationId)
            } else {
                setConfirmedRegistrationId('ID-PENDING')
            }
        }
    } catch (error) {
        toast.error('Erro ao realizar inscrição')
    } finally {
        setLoading(false)
    }
  }

  // 1. Success State (Ticket)
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* User Info Section */}
        {currentUser ? (
             <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser.nome?.[0] || 'U'}
                </div>
                <div>
                    <p className="text-sm text-indigo-200">Logado como</p>
                    <p className="font-bold text-white">{currentUser.nome}</p>
                </div>
            </div>
        ) : (
            <>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input 
                            {...register('name', { required: true })}
                            className="pl-10 bg-slate-950 border-slate-800 text-white"
                            placeholder="Ex: João Silva"
                        />
                    </div>
                    {errors.name && <span className="text-xs text-red-500">Nome é obrigatório</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp</label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input 
                            {...register('phone', { required: true })}
                            type="tel"
                            className="pl-10 bg-slate-950 border-slate-800 text-white"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    {errors.phone && <span className="text-xs text-red-500">Telefone é obrigatório</span>}
                </div>
            </>
        )}

        {/* CPF Section */}
        {requiresCpf && (
            <div className="pt-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">CPF (Obrigatório)</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Controller
                        control={control}
                        name="cpf"
                        rules={{ required: true, minLength: 14 }}
                        render={({ field }) => (
                            <Input 
                                {...field}
                                onChange={(e) => handleCpfChange(e, field.onChange)}
                                className="pl-10 bg-slate-950 border-slate-800 text-white"
                                placeholder="000.000.000-00"
                                maxLength={14}
                            />
                        )}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1">O CPF é solicitado para garantir sua vaga exclusiva.</p>
                {errors.cpf && <span className="text-xs text-red-500">CPF inválido ou obrigatório</span>}
            </div>
        )}

        {/* Dynamic Fields */}
        <DynamicEventForm 
            formConfig={formConfig} 
            register={register} 
            control={control} 
            errors={errors}
        />

        <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    {currentUser ? <Ticket className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    {currentUser ? 'Confirmar Presença' : 'Garantir meu Lugar'}
                </>
            )}
        </button>

        {!currentUser && (
            <div className="pt-4 text-center border-t border-slate-800 mt-4">
                <p className="text-xs text-slate-500 mb-2">Já é membro da igreja?</p>
                <Link href="/login" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Fazer Login
                </Link>
            </div>
        )}
    </form>
  )
}