'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, MessageCircle, AlertCircle, Loader2, Clock } from 'lucide-react'

interface Cell {
  id: string
  nome: string
  liderNome: string
  diaSemana: string
  horario: string
  bairro: string
  cidade: string
  whatsappLider: string
  displayLocation: string
}

// Ordem cronológica da semana
const ORDERED_DAYS = [
  { value: 'DOMINGO', label: 'Domingo' },
  { value: 'SEGUNDA', label: 'Segunda-feira' },
  { value: 'TERCA', label: 'Terça-feira' },
  { value: 'QUARTA', label: 'Quarta-feira' },
  { value: 'QUINTA', label: 'Quinta-feira' },
  { value: 'SEXTA', label: 'Sexta-feira' },
  { value: 'SABADO', label: 'Sábado' },
]

export function FindCellSection({ cells: initialCells }: { cells?: Cell[] }) {
  const [loading, setLoading] = useState(!initialCells)
  const [error, setError] = useState<string | null>(null)
  const [cells, setCells] = useState<Cell[]>(initialCells || [])

  useEffect(() => {
    if (initialCells) {
        setCells(initialCells)
        setLoading(false)
        return
    }

    const fetchCells = async () => {
      try {
        const response = await fetch('/api/cells/search')
        if (!response.ok) throw new Error('Falha ao carregar células')
        const data = await response.json()
        setCells(data)
      } catch (err) {
        console.error(err)
        setError('Não foi possível carregar as células no momento.')
      } finally {
        setLoading(false)
      }
    }

    fetchCells()
  }, [])

  const openWhatsApp = (cell: Cell) => {
    if (!cell.whatsappLider) return
    
    // Remover caracteres não numéricos
    const phone = cell.whatsappLider.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${cell.liderNome}, vi a ${cell.nome} no site e quero visitar!`
    )
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank')
  }

  // Agrupamento por dia
  const groupedCells = ORDERED_DAYS.reduce((acc, day) => {
    const dayCells = cells.filter(cell => {
      // Normalização robusta: tenta casar o value ou o label, ignorando case e acentos se necessário
      // Assumindo que o banco guarda algo como "SEGUNDA" ou "Segunda-feira"
      if (!cell.diaSemana) return false
      const cellDay = cell.diaSemana.toUpperCase()
      return cellDay.includes(day.value) || cellDay.includes(day.label.toUpperCase().split('-')[0])
    })
    
    if (dayCells.length > 0) {
      acc[day.value] = dayCells
    }
    return acc
  }, {} as Record<string, Cell[]>)

  const hasAnyCell = Object.keys(groupedCells).length > 0

  return (
    <section id="celulas" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-200/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-200/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Encontre uma Célula
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Células são pequenos grupos que se reúnem semanalmente para compartilhar a vida. 
            Veja os horários disponíveis abaixo e escolha a melhor para você!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 text-sm border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : !hasAnyCell ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhuma célula encontrada</h3>
            <p className="text-slate-500 mt-2">
              No momento não temos células cadastradas. Entre em contato com a igreja.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {ORDERED_DAYS.map((day) => {
              const dayCells = groupedCells[day.value]
              if (!dayCells) return null

              return (
                <div key={day.value} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-indigo-900">
                      {day.label}
                    </h3>
                    <div className="h-px bg-indigo-100 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dayCells.map((cell) => (
                      <div key={cell.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        
                        <div className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                    {cell.nome}
                                </h4>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                                    <Clock className="w-3 h-3" />
                                    {cell.horario}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span>{cell.displayLocation}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-50 mb-6">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold ring-2 ring-white">
                                {cell.liderNome.charAt(0)}
                            </div>
                            <div className="text-sm">
                                <p className="text-slate-500">Líder</p>
                                <p className="font-medium text-slate-900">{cell.liderNome}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => openWhatsApp(cell)}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-200"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Entre em contato
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
