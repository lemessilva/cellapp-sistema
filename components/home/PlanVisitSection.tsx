'use client'

import { Clock, MapPin, Baby } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PlanVisitSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Planeje sua Visita
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Estamos ansiosos para receber você e sua família.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Horários */}
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Nossos Horários</h3>
            <p className="text-slate-600">
              Domingos às 18h<br />
              Quartas às 20h
            </p>
          </div>

          {/* Card 2: Crianças */}
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Baby className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Nossas Crianças (MCP)</h3>
            <p className="text-slate-600">
              Ambiente seguro e divertido para seus filhos aprenderem sobre Jesus enquanto você assiste ao culto.
            </p>
          </div>

          {/* Card 3: Localização */}
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Como Chegar</h3>
            <p className="text-slate-600 mb-6">
              Estamos localizados em um ponto de fácil acesso na cidade.
            </p>
            <Button 
              variant="outline" 
              className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={() => window.open('https://maps.google.com', '_blank')}
            >
              Ver no Mapa
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
