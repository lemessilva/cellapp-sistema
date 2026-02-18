'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { submitDecision } from '@/app/actions/decision'
import { PhoneInput } from '@/components/ui/phone-input'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const DECISION_TYPES = [
  'Aceitei Jesus Hoje',
  'Estou me Reconciliando',
  'Quero Conhecer a Igreja'
]

export default function DecisionPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [decisionType, setDecisionType] = useState(DECISION_TYPES[0])
  const [prayerRequest, setPrayerRequest] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanWhatsapp = (val: string) => val.replace(/\D/g, '')

  const fireConfetti = () => {
    const duration = 2 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        spread: 70,
        origin: { y: 0.2 }
      })
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  useEffect(() => {
    if (success) {
      fireConfetti()
    }
  }, [success])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await submitDecision({
        name: name.trim(),
        phone: cleanWhatsapp(phone),
        email: null,
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900">
      <AnimatePresence>
        {!success && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-center text-slate-100"
            >
              <h1 className="text-2xl font-semibold mb-2">
                A melhor escolha da sua vida! ❤️
              </h1>
              <p className="text-sm text-slate-300">
                Ficamos muito felizes com sua decisão hoje.
                Queremos apenas te conhecer um pouquinho para orar por você.
              </p>
            </motion.div>

            <motion.form
              onSubmit={onSubmit}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl shadow-black/40 p-6 space-y-5 backdrop-blur"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-1.5"
              >
                <Label htmlFor="name" className="text-slate-100">
                  Qual o seu nome?
                </Label>
                <Input
                  id="name"
                  placeholder="Seu nome ou apelido"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-1.5"
              >
                <Label htmlFor="phone" className="text-slate-100">
                  Seu WhatsApp (para te darmos um oi)
                </Label>
                <PhoneInput
                  id="phone"
                  placeholder="(11) 91234-5678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="bg-slate-900/60 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-400 w-full px-3 py-2 rounded-md"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-1.5"
              >
                <Label className="text-slate-100">
                  Que tipo de decisão você tomou hoje?
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DECISION_TYPES.map((t, index) => (
                    <motion.button
                      key={t}
                      type="button"
                      onClick={() => setDecisionType(t)}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-xl px-3 py-2 text-xs font-medium border transition-colors ${
                        decisionType === t
                          ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/40'
                          : 'bg-slate-900/40 text-slate-200 border-slate-700 hover:border-indigo-400/60'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-1.5"
              >
                <Label htmlFor="prayer" className="text-slate-100">
                  Tem algo específico que podemos orar por você hoje?
                  <span className="text-xs text-slate-400 ml-1">(opcional)</span>
                </Label>
                <Textarea
                  id="prayer"
                  placeholder="Se quiser, compartilhe aqui. Se não, tudo bem também. 🙂"
                  value={prayerRequest}
                  onChange={e => setPrayerRequest(e.target.value)}
                  className="min-h-[90px] bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2 rounded-full shadow-lg shadow-indigo-500/40"
                >
                  {submitting ? 'Enviando...' : 'Confirmar minha decisão'}
                </Button>
              </motion.div>
            </motion.form>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center"
          >
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl shadow-black/40 p-8 text-slate-100 backdrop-blur">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-5xl mb-4"
              >
                🙌
              </motion.div>
              <h1 className="text-2xl font-semibold mb-3">
                Há festa no céu por sua causa!
              </h1>
              <p className="text-sm text-slate-300 mb-6">
                Um de nossos líderes vai entrar em contato em breve.
                Deus te abençoe!
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 text-white px-5 py-2 text-sm font-medium hover:bg-indigo-400 transition-colors"
              >
                Voltar para o início
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
