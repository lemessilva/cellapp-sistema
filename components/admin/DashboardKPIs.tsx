'use client'

import { Users, Calendar, DollarSign, UserPlus, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPIProps {
  data: {
    kpis: {
      members: { value: number; growth: number }
      attendance: { value: number; growth: number }
      offerings: { value: number; growth: number }
      visitors: { value: number; growth: number }
    }
  }
}

export default function DashboardKPIs({ data }: KPIProps) {
  const { kpis } = data

  const cards = [
    {
      label: 'Membros Ativos',
      value: kpis.members.value,
      growth: kpis.members.growth,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Frequência Média',
      value: kpis.attendance.value,
      growth: kpis.attendance.growth,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Ofertas do Mês',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.offerings.value),
      growth: kpis.offerings.growth,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Visitantes (30d)',
      value: kpis.visitors.value,
      growth: kpis.visitors.growth,
      icon: UserPlus,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositive = card.growth > 0
        const isNegative = card.growth < 0
        const isNeutral = card.growth === 0

        return (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                isPositive ? 'bg-green-100 text-green-700' : 
                isNegative ? 'bg-red-100 text-red-700' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {isPositive && <TrendingUp className="w-3 h-3" />}
                {isNegative && <TrendingDown className="w-3 h-3" />}
                {isNeutral && <Minus className="w-3 h-3" />}
                {Math.abs(card.growth).toFixed(1)}%
              </div>
            </div>
            
            <div>
              <p className="text-slate-500 text-sm font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-2">vs. mês anterior</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
