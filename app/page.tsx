import Link from 'next/link'
import { ArrowRight, MapPin, Calendar, Menu, X, Instagram, Facebook, MessageCircle, ChevronRight, Users, Heart, Music, LayoutDashboard, User } from 'lucide-react'
import { getSiteConfiguration } from '@/app/actions/website'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export default async function LandingPage() {
  const user = await getUser()
  const config = await getSiteConfiguration()
  const schedule = config.weeklySchedule ? JSON.parse(config.weeklySchedule) : []
  
  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      isOpen: true
    },
    take: 3,
    orderBy: { date: 'asc' }
  })
  
  const heroTitle = config.heroTitle || "Uma Igreja,\nUma Família."
  const heroSubtitle = config.heroSubtitle || "Somos uma comunidade apaixonada por Jesus e por pessoas. Aqui você encontra um lugar para pertencer, crescer e servir."
  const heroBgImage = config.heroBgImage || "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=2090&auto=format&fit=crop"
  const heroCtaText = config.heroCtaText || "Encontre uma Célula"
  const heroCtaLink = config.heroCtaLink || "#celulas"

  const contactWhatsapp = config.contactWhatsapp || "(00) 99999-9999"
  const footerAddress = config.footerAddress || "Av. Principal, 1000\nCentro, Cidade - UF"
  const socialInstagram = config.socialInstagram || "@igreja"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Navbar (Menu Fixo) */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-lg">C</span>
              </div>
              <span className="font-bold text-xl tracking-tight">CellApp</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Início</Link>
              <Link href="#sobre" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sobre</Link>
              <Link href="#celulas" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Células</Link>
              <Link href="#agenda" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Agenda</Link>
              <Link href="#contato" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contato</Link>
            </div>

            {/* Botão de Destaque */}
            <div className="hidden md:block">
              {user ? (
                <Link 
                  href="/app" 
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Ir para o Painel
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 gap-2"
                >
                  <User className="w-4 h-4" />
                  Área de Membros
                </Link>
              )}
            </div>

            {/* Mobile Menu Button (Placeholder functionality) */}
            <div className="md:hidden">
              <button className="text-slate-300 hover:text-white p-2">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section (A Capa) */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Placeholder (Overlay) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBgImage}')` }}
        >
          <div className="absolute inset-0 bg-slate-950/70 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium tracking-wide uppercase backdrop-blur-sm">
              Bem-vindo à nossa casa
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-300 leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href={heroCtaLink} 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/30 group"
              >
                {heroCtaText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#agenda" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all"
              >
                Ver Programação
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Seção 'Nossa Programação' */}
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
              schedule.map((item: any, index: number) => (
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

      {/* 5. Rodapé (Footer) */}
      <footer id="contato" className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                   <span className="font-bold text-white text-lg">C</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-white">CellApp</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-8">
                Levando o amor de Deus a cada lar, transformando vidas através do discipulado e da comunhão.
              </p>
              <div className="flex gap-4">
                <a href={`https://instagram.com/${socialInstagram.replace('@', '')}`} target="_blank" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Links Rápidos</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Início</Link></li>
                <li><Link href="#sobre" className="text-slate-400 hover:text-indigo-400 transition-colors">Sobre Nós</Link></li>
                <li><Link href="#celulas" className="text-slate-400 hover:text-indigo-400 transition-colors">Encontrar Célula</Link></li>
                <li>
                  {user ? (
                    <Link href="/app" className="text-slate-400 hover:text-indigo-400 transition-colors">Meu Painel</Link>
                  ) : (
                    <Link href="/login" className="text-slate-400 hover:text-indigo-400 transition-colors">Área de Membros</Link>
                  )}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Contato</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="whitespace-pre-line">{footerAddress}</span>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>{contactWhatsapp}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
            <p>&copy; 2024 CellApp. Todos os direitos reservados.</p>
            <p>Desenvolvido com ❤️ para o Reino.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
