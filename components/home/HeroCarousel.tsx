'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  titulo: string
  subtitulo?: string | null
  desktopUrl: string
  mobileUrl?: string | null
  linkBotao?: string | null
  textoBotao?: string | null
}

interface HeroCarouselProps {
  banners?: Banner[]
  config?: {
    heroTitle?: string | null
    heroSubtitle?: string | null
    heroBgImage?: string | null
    heroCtaText?: string | null
    heroCtaLink?: string | null
  }
  isPreview?: boolean
  previewImage?: string | null
}

export function HeroCarousel({ banners = [], config = {}, isPreview = false, previewImage }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-play
  useEffect(() => {
    if (banners.length <= 1 || isPreview) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length, isPreview])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  // Preview Mode
  if (isPreview) {
    return (
      <section className="relative w-full aspect-video flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-10">
          {/* Image Logic for Preview */}
          <div className="absolute inset-0">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Preview" 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                Sem Imagem
              </div>
            )}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          
          <div className="relative h-full flex items-center justify-center text-center z-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="space-y-2">
                <h1 className="text-xl font-bold tracking-tight text-white leading-tight whitespace-pre-line drop-shadow-lg">
                  {config.heroTitle || "Título do Banner"}
                </h1>
                <p className="max-w-md mx-auto text-xs text-slate-200 leading-relaxed drop-shadow-md line-clamp-2">
                  {config.heroSubtitle || "Subtítulo do banner aparecerá aqui."}
                </p>
                {(config.heroCtaText || "Saiba Mais") && (
                  <div className="pt-1">
                    <button className="inline-flex items-center justify-center px-3 py-1 text-[10px] font-bold rounded-lg text-white bg-indigo-600 shadow-lg shadow-indigo-900/30">
                      {config.heroCtaText || "Saiba Mais"}
                      <ArrowRight className="ml-1 w-2 h-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Fallback to Config (Legacy Mode) if no banners
  if (banners.length === 0) {
    const heroTitle = config.heroTitle || "Uma Igreja,\nUma Família."
    const heroSubtitle = config.heroSubtitle || "Somos uma comunidade apaixonada por Jesus e por pessoas. Aqui você encontra um lugar para pertencer, crescer e servir."
    const heroBgImage = config.heroBgImage || "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=2090&auto=format&fit=crop"
    const heroCtaText = config.heroCtaText || "Encontre uma Célula"
    const heroCtaLink = config.heroCtaLink || "#celulas"

    return (
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroBgImage} 
            alt="Background" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 py-12">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium tracking-wide uppercase backdrop-blur-sm">
              Bem-vindo à nossa casa
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href={heroCtaLink} 
                className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/30 group"
              >
                {heroCtaText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Carousel Mode
  return (
    <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900 group">
      {banners.map((banner, index) => (
        <div 
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Responsive Image Logic */}
          <div className="absolute inset-0">
            <picture>
              <source media="(max-width: 768px)" srcSet={banner.mobileUrl || banner.desktopUrl} />
              <img 
                src={banner.desktopUrl} 
                alt={banner.titulo} 
                className="object-cover w-full h-full"
              />
            </picture>
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          <div className="relative h-full flex items-center justify-center text-center z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className={`space-y-6 ${index === currentSlide ? 'animate-in fade-in slide-in-from-bottom-8 duration-1000' : ''}`}>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight whitespace-pre-line drop-shadow-lg">
                  {banner.titulo}
                </h1>
                {banner.subtitulo && (
                  <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 leading-relaxed drop-shadow-md">
                    {banner.subtitulo}
                  </p>
                )}
                {banner.linkBotao && (
                  <div className="pt-4">
                    <Link 
                      href={banner.linkBotao} 
                      className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/30 group"
                    >
                      {banner.textoBotao || "Saiba Mais"}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
