'use client'

import { useState } from 'react'
import { submitDecision } from '@/app/actions/decision'
import { PhoneInput } from '@/components/ui/phone-input'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const DECISION_TYPES = [
  'Aceitou Jesus',
  'Reconciliação',
  'Visita',
  'Batismo'
]

export default function DecisionPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [decisionType, setDecisionType] = useState(DECISION_TYPES[0])
  const [prayerRequest, setPrayerRequest] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanWhatsapp = (val: string) => val.replace(/\D/g, '')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await submitDecision({
        name: name.trim(),
        phone: cleanWhatsapp(phone),
        email: email.trim() || null,
        decisionType,
        prayerRequest: prayerRequest.trim() || null
      })
      if ((res as any)?.error) {
        setError((res as any).error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Falha ao enviar seu cartão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="max-w-md w-full text-center px-6">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-semibold mb-2">Parabéns pela melhor decisão da sua vida!</h1>
          <p className="text-gray-600 mb-6">
            Alguém da nossa equipe entrará em contato com você em breve.
          </p>
          <a href="/" className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
            Voltar para o início
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold mb-1">Cartão de Decisão</h1>
        <p className="text-sm text-gray-500 mb-6">Preencha seus dados. Não precisa de login.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">WhatsApp</Label>
            <PhoneInput
              id="phone"
              placeholder="(11) 91234-5678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="border rounded-md px-3 py-2 w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de Decisão</Label>
            <div className="grid grid-cols-2 gap-2">
              {DECISION_TYPES.map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setDecisionType(t)}
                  className={`border rounded-md px-3 py-2 text-sm ${
                    decisionType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prayer">Pedido de Oração (opcional)</Label>
            <Textarea
              id="prayer"
              placeholder="Compartilhe um pedido de oração"
              value={prayerRequest}
              onChange={e => setPrayerRequest(e.target.value)}
              className="min-h-[90px]"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Enviando...' : 'Enviar Cartão'}
          </Button>
        </form>
      </div>
    </div>
  )
}
