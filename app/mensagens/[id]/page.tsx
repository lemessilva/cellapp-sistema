import { getSermonSeriesById } from '@/app/actions/sermons'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, Calendar, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { notFound } from 'next/navigation'

export default async function SeriesDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const series = await getSermonSeriesById(id)
  
  if (!series) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/mensagens" className="p-2 bg-black/50 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative h-[50vh] w-full">
         <Image 
           src={series.coverUrl} 
           alt={series.title} 
           fill 
           className="object-cover opacity-40 blur-sm"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950" />
         
         <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row gap-8 items-end">
            <div className="relative w-40 h-60 md:w-56 md:h-80 shadow-2xl rounded-lg overflow-hidden border-2 border-slate-800 shrink-0 hidden md:block">
               <Image src={series.coverUrl} alt={series.title} fill className="object-cover" />
            </div>
            
            <div className="space-y-4 max-w-2xl mb-8 md:mb-0">
               <h1 className="text-4xl md:text-5xl font-bold">{series.title}</h1>
               <p className="text-slate-300 leading-relaxed">{series.description}</p>
               <div className="flex items-center gap-4 text-sm text-slate-400">
                 <span className="flex items-center gap-1">
                   <Calendar className="w-4 h-4" />
                   {series.startDate ? format(new Date(series.startDate), "MMMM yyyy", { locale: ptBR }) : 'N/A'}
                 </span>
                 <span>•</span>
                 <span>{series.sermons.length} episódios</span>
               </div>
            </div>
         </div>
      </div>

      {/* Episodes List */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <h2 className="text-2xl font-bold text-slate-200">Episódios</h2>
        
        <div className="grid gap-4">
          {series.sermons.map((sermon, index) => (
            <div key={sermon.id} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors group">
               {/* Thumbnail Placeholder (YouTube style) */}
               <div className="relative w-full md:w-48 aspect-video bg-slate-800 rounded-md overflow-hidden shrink-0">
                  <Image 
                    src={series.coverUrl} 
                    alt={sermon.title} 
                    fill 
                    className="object-cover opacity-50 group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-10 h-10 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col justify-center space-y-2">
                 <div className="flex justify-between items-start">
                   <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">
                     {index + 1}. {sermon.title}
                   </h3>
                   <span className="text-xs text-slate-500 whitespace-nowrap">
                     {format(new Date(sermon.date), "dd MMM", { locale: ptBR })}
                   </span>
                 </div>
                 <p className="text-sm text-slate-400 line-clamp-2">
                   Assista à pregação completa no YouTube.
                 </p>
                 <a 
                   href={sermon.youtubeUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium mt-2"
                 >
                   Assistir no YouTube
                 </a>
               </div>
            </div>
          ))}

          {series.sermons.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              Nenhuma pregação adicionada a esta série ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}