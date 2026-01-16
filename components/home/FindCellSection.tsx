'use client'

import { useState } from 'react'
import { MapPin, Search, Calendar, ChevronRight, MessageCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Cell {
  id: string
  nome: string
  liderNome: string
  diaSemana: string
  horario: string
  bairro: string
  cidade: string
  whatsappLider: string
  distancia?: number
}

const DAYS_OF_WEEK = [
  { value: 'SEGUNDA', label: 'Segunda-feira' },
  { value: 'TERCA', label: 'Terça-feira' },
  { value: 'QUARTA', label: 'Quarta-feira' },
  { value: 'QUINTA', label: 'Quinta-feira' },
  { value: 'SEXTA', label: 'Sexta-feira' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
]

export function FindCellSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Cell[] | null>(null)
  
  // Filtros
  const [cidade, setCidade] = useState('')
  const [bairro, setBairro] = useState('')
  const [dia, setDia] = useState('')

  const handleSearch = async (params: URLSearchParams) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`/api/cells/search?${params.toString()}`)
      if (!response.ok) throw new Error('Falha na busca')
      
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError('Ocorreu um erro ao buscar as células. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo seu navegador.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams()
        params.append('lat', position.coords.latitude.toString())
        params.append('lng', position.coords.longitude.toString())
        if (dia) params.append('dia', dia)
        
        handleSearch(params)
      },
      (err) => {
        console.error(err)
        setError('Não foi possível obter sua localização. Verifique as permissões.')
        setLoading(false)
      }
    )
  }

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (cidade) params.append('cidade', cidade)
    if (bairro) params.append('bairro', bairro)
    if (dia) params.append('dia', dia)

    if (!cidade && !bairro && !dia) {
        setError('Preencha pelo menos um campo para buscar.')
        return
    }

    handleSearch(params)
  }

  const openWhatsApp = (cell: Cell) => {
    if (!cell.whatsappLider) return
    
    // Remover caracteres não numéricos
    const phone = cell.whatsappLider.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${cell.liderNome}, vi a célula do ${cell.bairro} no site e quero visitar!`
    )
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank')
  }

  return (
    <section id="celulas" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-200/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-200/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Encontre uma Célula
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Células são pequenos grupos que se reúnem semanalmente para compartilhar a vida. 
            Encontre uma perto de você!
          </p>
        </div>

        {/* Card de Busca */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-6 md:p-8 border border-slate-100 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
            <button
              onClick={handleLocationSearch}
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              <span>Usar minha localização</span>
            </button>
            
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">ou</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
          </div>

          <form onSubmit={handleTextSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative">
              <input
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="md:col-span-4 relative">
              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="md:col-span-3 relative">
              <select
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className="w-full pl-4 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Qualquer dia</option>
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
            <div className="md:col-span-1">
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors disabled:opacity-70"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Resultados */}
        {results && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Nenhuma célula encontrada</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                  Tente expandir sua busca removendo filtros ou buscando por outra região.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((cell) => (
                  <div key={cell.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                                <Calendar className="w-3 h-3" />
                                {cell.diaSemana} • {cell.horario}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900">{cell.nome}</h3>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3 text-slate-600">
                            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-slate-900">{cell.bairro}</p>
                                <p className="text-sm text-slate-500">{cell.cidade}</p>
                                {cell.distancia !== undefined && cell.distancia !== null && (
                                    <span className="inline-block mt-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        a {cell.distancia}km de você
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                {cell.liderNome.charAt(0)}
                            </div>
                            <span className="text-sm">Líder: <span className="font-medium text-slate-900">{cell.liderNome}</span></span>
                        </div>
                    </div>

                    <button
                        onClick={() => openWhatsApp(cell)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Quero Visitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
