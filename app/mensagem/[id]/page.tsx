import { getPastoralMessageById } from '@/app/actions/pastoral-messages'
import { getSiteConfiguration } from '@/app/actions/website'
import { getUser } from '@/lib/auth'
import { LandingNavbar } from '@/components/LandingNavbar'
import { notFound } from 'next/navigation'
import { Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PastoralMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const message = await getPastoralMessageById(id)
  
  if (!message || !message.ativo) {
    notFound()
  }

  const user = await getUser()
  const config = await getSiteConfiguration()

  const backLinkHref = user 
    ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') 
    : '/'
  
  const backLinkText = user 
    ? (user.role === 'ADMIN' ? 'Voltar para Admin' : 'Voltar para Dashboard') 
    : 'Voltar para Home'

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      <LandingNavbar isAuthenticated={!!user} isLive={config.isLive} />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link 
          href={backLinkHref}
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLinkText}
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {message.imageUrl && (
            <div className="h-64 md:h-96 w-full relative">
              <img 
                src={message.imageUrl} 
                alt={message.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
                 <div className="flex items-center gap-2 text-sm font-medium bg-indigo-500/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit mb-3">
                    <User className="w-3 h-3" />
                    <span>Palavra do Pastor</span>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-2">
                    {message.titulo}
                 </h1>
                 <div className="flex items-center gap-2 text-slate-200 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(message.publishedAt).toLocaleDateString('pt-BR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                 </div>
              </div>
            </div>
          )}

          {!message.imageUrl && (
            <div className="p-8 md:p-12 border-b border-slate-100">
               <div className="flex items-center gap-2 text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full w-fit mb-4">
                  <User className="w-3 h-3" />
                  <span>Palavra do Pastor</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {message.titulo}
               </h1>
               <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(message.publishedAt).toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
               </div>
            </div>
          )}

          <div className="p-8 md:p-12 prose prose-slate max-w-none prose-lg prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
            {message.conteudo.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>
    </div>
  )
}
