import { getSermonSeries } from '@/app/actions/sermons'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const revalidate = 60 // Cache for 60 seconds

export default async function MessagesPage() {
  const series = await getSermonSeries()
  const activeSeries = series.filter(s => s.isActive)
  const latestSeries = activeSeries[0]
  const otherSeries = activeSeries.slice(1)

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
       {/* Hero Section (Latest Series) */}
       {latestSeries && (
         <div className="relative h-[60vh] w-full">
            <div className="absolute inset-0">
               <Image 
                 src={latestSeries.coverUrl} 
                 alt={latestSeries.title} 
                 fill 
                 className="object-cover opacity-60"
                 priority
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 space-y-4">
               <div className="inline-block px-3 py-1 bg-red-600 rounded-md text-xs font-bold uppercase tracking-wider mb-2">
                 Nova Série
               </div>
               <h1 className="text-4xl md:text-6xl font-bold max-w-2xl leading-tight">
                 {latestSeries.title}
               </h1>
               <p className="text-slate-300 max-w-xl text-lg line-clamp-3">
                 {latestSeries.description}
               </p>
               <div className="flex items-center gap-4 pt-4">
                 <Link 
                   href={`/mensagens/${latestSeries.id}`}
                   className="flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-md font-bold hover:bg-slate-200 transition-colors"
                 >
                   <PlayCircle className="w-5 h-5" />
                   Assistir Agora
                 </Link>
               </div>
            </div>
         </div>
       )}

       {/* Series Grid */}
       <div className="px-4 md:px-16 mt-12 space-y-8">
         <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">Séries Anteriores</h2>
         
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {otherSeries.map((serie) => (
             <Link 
               key={serie.id} 
               href={`/mensagens/${serie.id}`}
               className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-slate-900 border border-slate-800 hover:scale-105 transition-transform duration-300"
             >
               <Image 
                 src={serie.coverUrl} 
                 alt={serie.title} 
                 fill 
                 className="object-cover group-hover:opacity-40 transition-opacity"
               />
               <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                 <h3 className="font-bold text-lg leading-tight">{serie.title}</h3>
                 <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                   <Calendar className="w-3 h-3" />
                   {serie.startDate ? format(new Date(serie.startDate), "MMM yyyy", { locale: ptBR }) : 'S/ Data'}
                 </div>
                 <span className="text-xs text-slate-500 mt-1">{serie.sermons.length} episódios</span>
               </div>
             </Link>
           ))}
         </div>
         
         {otherSeries.length === 0 && !latestSeries && (
           <div className="text-center py-20 text-slate-500">
             Nenhuma série disponível no momento.
           </div>
         )}
       </div>
    </div>
  )
}