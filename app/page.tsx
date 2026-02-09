import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Calendar, Instagram, Facebook, MessageCircle, ChevronRight, Users, Heart, Music, User } from 'lucide-react'
import { getSiteConfiguration } from '@/app/actions/website'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { LandingNavbar } from '@/components/LandingNavbar'
import { getYouTubeId } from '@/lib/utils'
import { getActivePastoralMessage } from '@/app/actions/pastoral-messages'
import { getGalleryImages } from '@/app/actions/media'
import { FindCellSection } from '@/components/home/FindCellSection'
import { AgendaSection } from '@/components/home/AgendaSection'
import { PrayerRequestSection } from '@/components/home/PrayerRequestSection'
import { PlanVisitSection } from '@/components/home/PlanVisitSection'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { GallerySection } from '@/components/home/GallerySection'
import { Footer } from '@/components/Footer'
import { FloatingPrayerButton } from '@/components/home/FloatingPrayerButton'

export default async function LandingPage() {
  const user = await getUser()
  const config = await getSiteConfiguration()
  const churchInfo = await prisma.churchInfo.findUnique({
    where: { id: 'main' }
  })

  const pastoralMessage = await getActivePastoralMessage()
  const galleryImages = (await getGalleryImages()).map(img => ({
    ...img,
    caption: img.caption || undefined
  }))
  const schedule = config.weeklySchedule ? JSON.parse(config.weeklySchedule) : []
  
  const banners = await prisma.siteBanner.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' }
  })

  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      isOpen: true
    },
    take: 3,
    orderBy: { date: 'asc' }
  })

  // Prioritize ChurchInfo, fallback to Config (legacy) or Defaults
  const contactWhatsapp = churchInfo?.whatsapp || config.contactWhatsapp || ""
  const footerAddress = churchInfo?.address || config.footerAddress || ""
  const socialInstagram = churchInfo?.instagram || config.socialInstagram || ""
  const socialYoutube = churchInfo?.youtube || null
  const churchName = churchInfo?.name || "CellApp"
  const logoUrl = churchInfo?.logoUrl || null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      <LandingNavbar 
        isAuthenticated={!!user} 
        isLive={config.isLive} 
        churchName={churchName}
        logoUrl={logoUrl}
      />

      {/* 2. Hero Section (Carrossel) */}
      <HeroCarousel 
        banners={banners} 
        config={{
          ...config,
          heroVideoUrl: churchInfo?.heroVideoUrl
        }} 
      />

      <PlanVisitSection />

      {config.isLive && config.liveLink && (
        <section id="transmissao" className="py-24 bg-black relative overflow-hidden border-b border-slate-800">
           {/* Decorative */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
           
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col items-center text-center mb-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Ao Vivo Agora
                 </div>
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Culto Ao Vivo</h2>
                 <p className="text-slate-400">Junte-se a nós em adoração, onde quer que você esteja.</p>
              </div>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-800 bg-slate-900">
                 {getYouTubeId(config.liveLink) ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${getYouTubeId(config.liveLink)}?autoplay=1`}
                      title="Culto Ao Vivo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                       <p>Link de transmissão inválido.</p>
                    </div>
                 )}
              </div>
           </div>
        </section>
      )}

      {/* 2.5 Pastoral Message Section */}
      {pastoralMessage && (
        <section className="py-20 bg-white border-b border-slate-100">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10 bg-slate-100">
                    {pastoralMessage.imageUrl ? (
                       <img src={pastoralMessage.imageUrl} alt={pastoralMessage.titulo} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <MessageCircle className="w-20 h-20" />
                       </div>
                    )}
                 </div>
                 <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
                       <User className="w-4 h-4" />
                       <span>Palavra do Pastor</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                       {pastoralMessage.titulo}
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                       {pastoralMessage.conteudo}
                    </p>
                    <div className="pt-4">
                       <Link 
                         href={`/mensagem/${pastoralMessage.id}`}
                         className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 group"
                       >
                         Ler Mensagem Completa
                         <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* 2.8 Seção Encontre uma Célula */}
      <FindCellSection />

      {/* 3. Seção 'Nossa Programação' */}
      <AgendaSection schedule={schedule} />

      {/* 3.5 Seção 'Próximos Eventos' */}
      <section id="eventos" className="py-20 bg-slate-950 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Próximos Eventos</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Fique por dentro de tudo o que acontece em nossa comunidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
               <div key={event.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-900/10 group flex flex-col h-full">
                  {/* Image/Banner */}
                  <div className="h-48 bg-slate-800 relative overflow-hidden">
                     {/* Placeholder if no image (In future use event.bannerUrl) */}
                     {event.bannerUrl ? (
                        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                           <Calendar className="w-12 h-12 opacity-30" />
                        </div>
                     )}
                     {/* Badge Data */}
                     <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-center shadow-lg">
                        <div className="text-xs font-bold text-indigo-400 uppercase">
                          {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                        </div>
                        <div className="text-xl font-bold text-white leading-none">
                          {new Date(event.date).getDate()}
                        </div>
                     </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                     <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {event.title}
                     </h3>
                     <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span>{event.location || 'Local a definir'}</span>
                     </div>
                     
                     <div className="mt-auto pt-4">
                        <Link 
                          href={`/eventos/${event.id}`}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Saiba Mais
                        </Link>
                     </div>
                  </div>
               </div>
            ))}
             {upcomingEvents.length === 0 && (
                <div className="col-span-3 text-center text-slate-500 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 border-dashed">
                   <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p>Nenhum evento futuro encontrado.</p>
                </div>
             )}
          </div>
        </div>
      </section>

      {/* 4. Seção 'Células' (O Diferencial) */}
      <section id="celulas" className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                A vida acontece <br/>
                <span className="text-indigo-400">em Células.</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Acreditamos que ninguém deve caminhar sozinho. As células são pequenos grupos que se reúnem semanalmente nas casas para compartilhar a vida, estudar a palavra e fortalecer laços de amizade.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mt-1">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Comunhão Real</h4>
                    <p className="text-slate-400">Faça amigos que se tornarão sua família na fé.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mt-1">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Cuidado Pastoral</h4>
                    <p className="text-slate-400">Seja acompanhado e cuidado de perto por líderes dedicados.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              {/* Placeholder Buscador Futuro */}
              <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-xl text-white">Encontre uma célula perto de você</h3>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Em breve</span>
                </div>

                {/* Cards Estáticos de Exemplo */}
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Célula Morumbi</h4>
                      <p className="text-sm text-slate-400">Quarta-feira às 20h • Líder João</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Célula Centro</h4>
                      <p className="text-sm text-slate-400">Quinta-feira às 19:30h • Líder Maria</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Célula Jovens</h4>
                      <p className="text-sm text-slate-400">Sábado às 17h • Líder Pedro</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                   <p className="text-slate-500 text-sm mb-4">Quer saber mais?</p>
                   <a href={`https://wa.me/${contactWhatsapp.replace(/\D/g, '')}`} target="_blank" className="block w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors">
                     Falar no WhatsApp
                   </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 Seção Pedidos de Oração */}
      <PrayerRequestSection />

      {/* 4.8 Galeria Nossa Vida */}
      <GallerySection images={galleryImages} />

      {/* 5. Rodapé (Footer) */}
      <Footer 
        contactWhatsapp={contactWhatsapp} 
        footerAddress={footerAddress} 
        socialInstagram={socialInstagram}
        socialYoutube={socialYoutube} 
        user={user} 
        churchName={churchName}
        logoUrl={logoUrl}
      />
      
      <FloatingPrayerButton />
    </div>
  )
}
