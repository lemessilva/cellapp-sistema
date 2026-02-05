'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react'

type GalleryImage = {
  id: string
  url: string
  caption?: string
}

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  const handleNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex + 1) % images.length)
  }

  const handlePrev = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
  }

  return (
    <section className="py-24 bg-slate-950 border-t border-slate-800 relative">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nossa Vida</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Momentos especiais da nossa comunidade.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all"
                onClick={() => setSelectedIndex(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={image.url} 
                  alt={image.caption || "Galeria"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
       </div>

       {/* Lightbox */}
       {selectedIndex !== null && (
         <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <button 
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
            >
              <X className="w-8 h-8" />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); handleNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <div className="max-w-5xl max-h-[85vh] relative">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={images[selectedIndex].url} 
                 alt="Full size" 
                 className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
               />
               {images[selectedIndex].caption && (
                 <p className="text-center text-white/80 mt-4 text-lg font-medium">{images[selectedIndex].caption}</p>
               )}
            </div>
         </div>
       )}
    </section>
  )
}
