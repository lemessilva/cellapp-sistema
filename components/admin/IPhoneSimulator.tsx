'use client'

import { Menu } from 'lucide-react'
import { AlertBar } from '@/components/home/AlertBar'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { FindCellSection } from '@/components/home/FindCellSection'
import { AgendaSection } from '@/components/home/AgendaSection'

interface IPhoneSimulatorProps {
  imageUrl?: string | null
  config?: any
  banners?: any[]
  cells?: any[]
  schedule?: any[]
  mode?: 'full' | 'banner-only'
  churchInfo?: any
}

export function IPhoneSimulator({ 
  imageUrl, 
  config, 
  banners = [], 
  cells = [],
  schedule = [],
  mode = 'full',
  churchInfo
}: IPhoneSimulatorProps) {
  // If imageUrl is present, we are previewing a banner (or specific image).
  // We should show the Site with THIS image as the banner.
  const isBannerPreview = !!imageUrl;

  // Construct a temporary config/banner for preview if needed
  const previewConfig = isBannerPreview ? {
    ...config,
    heroTitle: config?.heroTitle || 'Título do Banner',
    heroSubtitle: config?.heroSubtitle || 'Subtítulo do banner...',
    // We don't override heroBgImage here because we use HeroCarousel's previewImage prop
  } : config;

  return (
    <div className="flex flex-col items-center">
      {/* Phone Frame - Fixed Width 320px for Admin UI, but scales internal content */}
      <div className="relative w-[320px] h-[650px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden ring-4 ring-gray-900/50">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30 flex items-center justify-center gap-2 px-2 pointer-events-none">
           <div className="w-1.5 h-1.5 rounded-full bg-gray-800/50"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-gray-800/50 ml-auto"></div>
        </div>
        
        {/* Status Bar */}
        <div className="absolute top-3 left-6 text-white text-[10px] font-semibold z-30 pointer-events-none">9:41</div>
        <div className="absolute top-3 right-6 flex gap-1 z-30 pointer-events-none">
           <div className="w-4 h-2.5 border border-white/30 rounded-[2px] relative">
              <div className="absolute inset-0.5 bg-white rounded-[1px]"></div>
           </div>
        </div>

        {/* Screen Content - Force 390px width and scale down to fit 304px (320 - 16 border) */}
        <div className="w-[390px] h-[844px] origin-top-left transform scale-[0.78] bg-slate-950 overflow-y-auto no-scrollbar">
            {/* Mock Header */}
            <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5 pt-12">
               <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white">
                 IB
               </div>
               <Menu className="w-5 h-5 text-white" />
            </div>

            {/* Site Content */}
            {previewConfig && (
              <>
                <AlertBar config={previewConfig} />
                
                {/* 
                  If we have an imageUrl, we force HeroCarousel into preview mode with that image.
                  Otherwise, we show the actual banners.
                */}
                {isBannerPreview ? (
                  <HeroCarousel 
                    isPreview={true} 
                    previewImage={imageUrl}
                    config={previewConfig}
                  />
                ) : (
                  <HeroCarousel 
                    banners={banners} 
                    config={previewConfig} 
                  />
                )}
                
                {/* Real Sections (Compact/Mobile View) */}
                <div className="bg-slate-950">
                  <FindCellSection cells={cells} />
                  <AgendaSection schedule={schedule} />
                </div>
              </>
            )}
            
            {/* If no config/content, show placeholder */}
            {!previewConfig && !imageUrl && (
               <div className="w-full h-full flex items-center justify-center text-slate-500">
                 Carregando Preview...
               </div>
            )}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white rounded-full z-30 opacity-50 pointer-events-none"></div>
      </div>
      <p className="mt-4 text-xs text-slate-400 font-medium">iPhone 17 Pro Max • 390x844 (Scaled)</p>
    </div>
  )
}
