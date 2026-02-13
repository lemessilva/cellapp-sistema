import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Heart, MessageSquare, Bell, Flame, User, Camera } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getActivePastoralMessage } from '@/app/actions/pastoral-messages'
import { NextEventCard } from '@/components/NextEventCard'
import { PhotoFeedCard } from '@/components/photos/PhotoFeedCard'
import { KidsWidget } from '@/components/kids/KidsWidget'
import { getMyChildren } from '@/app/actions/kids'

export default async function DashboardPage() {
  const sessionUser = await getUser()

  if (!sessionUser) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      celulaLiderada: true,
      celulaLiderada2: true,
      celulasSupervisionadas: true,
      celulasSupervisionadas2: true,
    }
  })

  if (!user) {
    redirect('/login')
  }

  // Ensure arrays are not null (defensive programming)
  const celulaLiderada = user.celulaLiderada || []
  const celulaLiderada2 = user.celulaLiderada2 || []
  const celulasSupervisionadas = user.celulasSupervisionadas || []
  const celulasSupervisionadas2 = user.celulasSupervisionadas2 || []

  const { data: myChildren } = await getMyChildren()

  if (user?.role === 'MIDIA') {
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

  // Real Data: Prayer Requests (for Leaders/Admins)
  const canViewRequests = ['ADMIN', 'LIDER', 'SUPERVISOR'].includes(user.role)
  const pendingRequests = canViewRequests 
    ? await prisma.prayerRequest.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    : []

  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      isOpen: true
    },
    take: 3,
    orderBy: { date: 'asc' }
  })

  const pastoralMessage = await getActivePastoralMessage()

  // Passo 1: Buscar os Dados (Server Component)
  const latestPhotos = await prisma.cellPhoto.findMany({
    take: 6, // Pegar as 6 últimas
    orderBy: { createdAt: 'desc' },
    include: {
      cell: { select: { nome: true } }
    }
  })

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bem-vindo, {user.nome?.split(' ')[0] || 'Irmão'}
        </h1>
        <div className="text-slate-600 mt-1 space-y-1 text-sm">
            {celulaLiderada.length > 0 && (
                <p className="flex items-center gap-2">
                    <span className="text-indigo-600">🛡️</span> 
                    Você é Líder {celulaLiderada.length > 1 ? 'das células' : 'da célula'} <span className="font-semibold text-slate-800">{celulaLiderada.map(c => c.nome).join(', ')}</span>.
                </p>
            )}
            {celulaLiderada2.length > 0 && (
                <p className="flex items-center gap-2">
                    <span className="text-blue-600">🛡️</span> 
                    Você é Líder {celulaLiderada2.length > 1 ? 'das células' : 'da célula'} <span className="font-semibold text-slate-800">{celulaLiderada2.map(c => c.nome).join(', ')}</span>.
                </p>
            )}
            {celulasSupervisionadas.length > 0 && (
                <p className="flex items-center gap-2">
                    <span className="text-purple-600">🦅</span>
                    Você supervisiona: <span className="font-semibold text-slate-800">{celulasSupervisionadas.map(c => c.nome).join(', ')}</span>.
                </p>
            )}
            {celulasSupervisionadas2.length > 0 && (
                <p className="flex items-center gap-2">
                    <span className="text-pink-600">🦅</span>
                    Você supervisiona: <span className="font-semibold text-slate-800">{celulasSupervisionadas2.map(c => c.nome).join(', ')}</span>.
                </p>
            )}
        </div>
        <p className="text-slate-500 mt-2">
          Aqui está o resumo da sua caminhada com Cristo.
        </p>
      </div>

      {pastoralMessage && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium">
                            <User className="w-3 h-3" />
                            <span>Palavra do Pastor</span>
                        </div>
                        {new Date(pastoralMessage.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide animate-pulse">
                                Nova
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold">{pastoralMessage.title}</h3>
                    <p className="text-indigo-100 text-sm line-clamp-1 max-w-xl">{pastoralMessage.content}</p>
                </div>
                
                <Link 
                    href={`/mensagem/${pastoralMessage.id}`}
                    className="shrink-0 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    Ler Mensagem
                </Link>
            </div>
        </div>
      )}

      {/* Mural das Células (Community Feed) */}
      <section className="space-y-4">
        {myChildren && myChildren.length > 0 && (
            <KidsWidget children={myChildren} />
        )}

        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
            <Camera className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Mural das Células</h2>
        </div>

        {latestPhotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPhotos.map((photo) => {
              const canEdit = ['ADMIN', 'SUPERVISOR'].includes(user.role) || 
                              celulaLiderada.some(c => c.id === photo.cellId) || 
                              celulaLiderada2.some(c => c.id === photo.cellId)
              
              return (
                <PhotoFeedCard 
                  key={photo.id} 
                  photo={photo} 
                  canEdit={canEdit} 
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 border-dashed">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-medium">Nenhuma foto compartilhada esta semana.</p>
            <p className="text-sm text-slate-400">Líderes, postem seus momentos!</p>
          </div>
        )}
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget: Próximo Evento */}
        <NextEventCard />

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
            <Link href="/#pedidos-oracao" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1 bg-indigo-50 rounded-full transition-colors">
              Solicitar
            </Link>
          </div>
          
          {canViewRequests ? (
             pendingRequests.length > 0 ? (
               <ul className="space-y-3 mb-4">
                 {pendingRequests.map((req) => (
                  <li key={req.id} className="text-sm text-slate-600 flex gap-2 items-start">
                     <span className="text-pink-300 mt-1 shrink-0">•</span>
                     <span className="line-clamp-2"><span className="font-medium">{req.name}</span>: {req.content}</span>
                  </li>
                ))}
              </ul>
             ) : (
               <div className="text-center py-8 text-slate-500 text-sm">
                 Nenhum pedido pendente.
               </div>
             )
          ) : (
            <div className="text-sm text-slate-600 mb-4 py-2">
               Precisa de oração? Nossa equipe de intercessão está pronta para orar por você e sua família.
            </div>
          )}

           {canViewRequests && (
             <Link href="/admin/prayers" className="block w-full text-center py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
              Ver todos os pedidos
            </Link>
           )}
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
