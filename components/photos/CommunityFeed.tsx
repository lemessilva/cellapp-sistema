import { getCommunityFeed } from '@/app/actions/photos'
import Image from 'next/image'
import { Camera } from 'lucide-react'

export async function CommunityFeed() {
  const photos = await getCommunityFeed()

  if (photos.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
          <Camera className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Mural da Comunidade</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-slate-100">
            <Image
              src={photo.url}
              alt={photo.caption || `Foto da célula ${photo.cell.nome}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-200 mb-0.5">
                {photo.cell.nome}
              </p>
              {photo.caption && (
                <p className="text-xs line-clamp-2 font-medium leading-tight">
                  {photo.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
