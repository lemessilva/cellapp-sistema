import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Heart, MessageSquare, Bell, Flame } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const sessionUser = await getUser()

  if (!sessionUser) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      celulaLiderada: true,
      celulasSupervisionadas: true
    }
  })

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'MIDIA') {
    redirect('/admin/website')
  }

  // Real Data: Prayer Stats
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1) // 1st Jan of current year

  const prayerCount = await prisma.prayerLog.count({
    where: {
      userId: user.id,
      date: {
        gte: startOfYear
      }
    }
  })

  const lastPrayerLog = await prisma.prayerLog.findFirst({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format last prayer date
  let lastPrayerText = 'Nenhuma oração registrada'
  if (lastPrayerLog) {
    const date = new Date(lastPrayerLog.createdAt)
    const today = new Date()
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear()
    
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    
    lastPrayerText = isToday ? `Hoje, ${timeStr}` : `${dateStr} às ${timeStr}`
  }

  // Mock Data for other cards
  const notices = [
    { id: 1, title: 'Culto de Jovens', date: 'Sábado, 19h' },
    { id: 2, title: 'Reunião de Líderes', date: 'Segunda, 20h' },
    { id: 3, title: 'Escola Bíblica', date: 'Domingo, 09h' }
  ]

  const prayerRequests = [
    { id: 1, text: 'Pela saúde da Dona Maria' },
    { id: 2, text: 'Pelo emprego do João' }
  ]

  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      isOpen: true
    },
    take: 3,
    orderBy: { date: 'asc' }
  })

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bem-vindo, {user.nome?.split(' ')[0] || 'Irmão'}
        </h1>
        <div className="text-slate-600 mt-1 space-y-1 text-sm">
            {user.celulaLiderada && (
                <p className="flex items-center gap-2">
                    <span className="text-indigo-600">🛡️</span> 
                    Você é Líder da célula <span className="font-semibold text-slate-800">{user.celulaLiderada.nome}</span>.
                </p>
            )}
            {user.celulasSupervisionadas.length > 0 && (
                <p className="flex items-center gap-2">
                    <span className="text-purple-600">🦅</span>
                    Você supervisiona: <span className="font-semibold text-slate-800">{user.celulasSupervisionadas.map(c => c.nome).join(', ')}</span>.
                </p>
            )}
        </div>
        <p className="text-slate-500 mt-2">
          Aqui está o resumo da sua caminhada com Cristo.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Prayer Life (Oikós) - Real Data */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Flame className="w-6 h-6" />
            </div>
            <h2 className="font-semibold text-slate-900">Minha Intercessão (Oikós)</h2>
          </div>
          <div className="space-y-2">
             <div className="text-4xl font-bold text-slate-900">{prayerCount}</div>
             <p className="text-sm text-slate-500">Orações realizadas em {now.getFullYear()}</p>
             <div className="pt-4 mt-4 border-t border-slate-50 flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Última: {lastPrayerText}</span>
             </div>
          </div>
        </div>

        {/* Card 2: Notices */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="font-semibold text-slate-900">Quadro de Avisos</h2>
          </div>
          <ul className="space-y-3">
            {notices.map((notice) => (
              <li key={notice.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{notice.title}</p>
                  <p className="text-xs text-slate-500">{notice.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Prayer Requests */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="font-semibold text-slate-900">Pedidos de Oração</h2>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1 bg-indigo-50 rounded-full transition-colors">
              Solicitar Oração
            </button>
          </div>
          <ul className="space-y-3 mb-4">
             {prayerRequests.map((req) => (
              <li key={req.id} className="text-sm text-slate-600 flex gap-2">
                 <span className="text-pink-300">•</span>
                 {req.text}
              </li>
            ))}
          </ul>
           <button className="w-full py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
            Ver todos os pedidos
          </button>
        </div>

        {/* Card 4: News / Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="font-semibold text-slate-900">Próximos Eventos</h2>
          </div>
          <div className="space-y-4">
             {upcomingEvents.length > 0 ? (
               upcomingEvents.map((event) => (
                 <div key={event.id} className="flex flex-col md:flex-row gap-4 border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                    <div className="h-24 w-full md:w-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0 overflow-hidden relative">
                       {/* Placeholder or Image */}
                       {event.bannerUrl ? (
                          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                       ) : (
                          <Calendar className="w-8 h-8 opacity-20" />
                       )}
                    </div>
                    <div className="flex-1">
                       <h3 className="font-medium text-slate-900 mb-1">{event.title}</h3>
                       <p className="text-xs text-indigo-600 font-semibold mb-1 uppercase tracking-wide">
                          {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                       </p>
                       <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                         {event.description || 'Participe deste evento especial!'}
                       </p>
                       <Link href={`/app/eventos`} className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
                         Ler mais &rarr;
                       </Link>
                    </div>
                 </div>
               ))
             ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Nenhum evento próximo.</p>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  )
}
