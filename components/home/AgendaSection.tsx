'use client'

import { Calendar } from 'lucide-react'

interface ScheduleItem {
  dia: string
  horario: string
  titulo: string
}

interface AgendaSectionProps {
  schedule: ScheduleItem[]
}

export function AgendaSection({ schedule }: AgendaSectionProps) {
  return (
    <section id="agenda" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nossa Programação</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Participe dos nossos encontros semanais. Você é nosso convidado especial!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <div key={index} className="group p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all hover:bg-slate-800/50">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.titulo}</h3>
                <div className="flex items-center gap-3 text-indigo-300 font-medium mt-4">
                  <Calendar className="w-5 h-5" />
                  <span>{item.dia} às {item.horario}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-slate-500">
              Nenhuma programação cadastrada.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
