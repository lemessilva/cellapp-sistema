import { getSiteConfiguration } from '@/app/actions/website'
import AppAlertManager from '@/components/media/AppAlertManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, LayoutTemplate, MessageCircleHeart, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function MediaDashboardPage() {
  const config = await getSiteConfiguration()

  const menuItems = [
    {
      title: 'Gerenciar Eventos',
      description: 'Crie e gerencie inscrições, check-ins e listas de presença.',
      icon: CalendarDays,
      href: '/admin/eventos',
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30'
    },
    {
      title: 'Mensagem Pastoral',
      description: 'Publique palavras, vídeos e comunicados semanais.',
      icon: MessageCircleHeart,
      href: '/admin/pastoral',
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30'
    },
    {
      title: 'Trilho de Crescimento',
      description: 'Configure os passos da jornada de membresia.',
      icon: TrendingUp,
      href: '/admin/trilho',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      title: 'Website & App',
      description: 'Personalize a home, banners, links e identidade visual.',
      icon: LayoutTemplate,
      href: '/admin/website',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30'
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Painel de Mídia
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gerencie a comunicação, eventos e conteúdo digital da igreja.
        </p>
      </div>

      {/* Seção de Alerta Global */}
      <section>
        <AppAlertManager 
          initialData={{
            active: config.alertActive,
            title: config.alertTitle,
            message: config.alertText
          }}
        />
      </section>

      {/* Grid de Funcionalidades */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="group block h-full">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 group-hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4 transition-colors`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription>
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}
