import { prisma } from '@/lib/prisma'
import { getBioLinks } from '@/app/actions/bio-links'
import * as Icons from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 0

export default async function BioLinksPage() {
  const [links, churchInfo] = await Promise.all([
    getBioLinks(),
    prisma.churchInfo.findUnique({ where: { id: 'main' } })
  ])

  const activeLinks = links.filter(l => l.isActive)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8 text-center space-y-4 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative bg-white">
           {churchInfo?.logoUrl ? (
             <Image src={churchInfo.logoUrl} alt={churchInfo.name} fill className="object-cover" />
           ) : (
             <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {churchInfo?.name?.charAt(0) || 'I'}
             </div>
           )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{churchInfo?.name}</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
             {churchInfo?.address?.split(',')[0]}
          </p>
        </div>
        
        {/* Social Icons Row */}
        <div className="flex gap-4 mt-2">
           {churchInfo?.instagram && (
              <a href={churchInfo.instagram} target="_blank" className="p-3 bg-white rounded-full text-pink-600 shadow-sm hover:scale-110 transition-transform">
                 <Icons.Instagram className="w-5 h-5" />
              </a>
           )}
           {churchInfo?.youtube && (
              <a href={churchInfo.youtube} target="_blank" className="p-3 bg-white rounded-full text-red-600 shadow-sm hover:scale-110 transition-transform">
                 <Icons.Youtube className="w-5 h-5" />
              </a>
           )}
           {churchInfo?.whatsapp && (
              <a href={`https://wa.me/${churchInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" className="p-3 bg-white rounded-full text-green-600 shadow-sm hover:scale-110 transition-transform">
                 <Icons.MessageCircle className="w-5 h-5" />
              </a>
           )}
        </div>
      </div>

      {/* Links List */}
      <div className="w-full max-w-md space-y-4">
        {activeLinks.map((link, index) => {
          // Dynamic Icon Rendering
          const IconComponent = link.icon && (Icons as any)[link.icon] 
            ? (Icons as any)[link.icon] 
            : Icons.Link

          return (
            <a 
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center p-4 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95
                animate-in slide-in-from-bottom-4 duration-500
                ${link.isHighlight 
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-200 ring-offset-2' 
                  : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200'
                }
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-2 rounded-lg mr-4 ${link.isHighlight ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="font-semibold text-center flex-1 pr-9">{link.title}</span>
            </a>
          )
        })}
      </div>
      
      <div className="mt-12 text-center pb-8">
         <Link href="/" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1">
            <Icons.ArrowLeft className="w-3 h-3" />
            Voltar para o site
         </Link>
      </div>
    </div>
  )
}
