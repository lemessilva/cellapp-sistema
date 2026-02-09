'use client'

import { useState, useRef } from 'react'
import QRCode from 'react-qr-code'
import html2canvas from 'html2canvas'
import { Download, RefreshCw, User, Star, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MemberCardProps {
  user: {
    id: string
    name: string
    role: string
    image: string | null
    memberSince: Date | string | null
    bloodType?: string | null
    emergencyContact?: string | null
    churchName?: string
    churchLogo?: string | null
  }
}

export default function MemberCard({ user }: MemberCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true // Allow loading external images
      })
      
      const link = document.createElement('a')
      link.download = `carteirinha-${user.name.split(' ')[0].toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      toast.success('Carteirinha salva com sucesso!')
    } catch (error) {
      console.error('Error generating card:', error)
      toast.error('Erro ao gerar a imagem. Tente novamente.')
    } finally {
      setDownloading(false)
    }
  }

  const memberSinceYear = user.memberSince 
    ? new Date(user.memberSince).getFullYear() 
    : new Date().getFullYear()

  // Determine badge/icon based on role
  const getRoleIcon = () => {
    switch (user.role) {
      case 'LIDER': return <Star className="w-3 h-3 text-yellow-300" />
      case 'ADMIN': return <Star className="w-3 h-3 text-yellow-300" />
      case 'SUPERVISOR': return <Star className="w-3 h-3 text-yellow-300" />
      case 'MEMBRO': return <User className="w-3 h-3 text-indigo-200" />
      default: return <User className="w-3 h-3 text-indigo-200" />
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto py-8">
      {/* 3D Card Container */}
      <div 
        className="relative w-full aspect-[1.586/1] group cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          ref={cardRef}
          className="w-full h-full relative transition-all duration-700 shadow-2xl rounded-2xl"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/10"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* Efeito de Luz (Glow) */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent blur-3xl pointer-events-none" />
            
            {/* Texture Noise (Optional) */}
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
            />

            {/* Top Bar */}
            <div className="relative z-10 flex justify-between items-start p-6">
              {/* Church Name */}
              <div className="max-w-[60%]">
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-medium">
                  {user.churchName || 'IDPB Casa de Oração'}
                </span>
              </div>
              
              {/* Church Logo */}
              <div className="w-20 h-20 opacity-90">
                 <img 
                    src={user.churchLogo || "/logo.png"} 
                    alt="Logo Igreja" 
                    className="w-full h-full object-contain filter brightness-0 invert" 
                    crossOrigin="anonymous"
                  />
              </div>
            </div>

            {/* Middle Details (Chip & Contactless) */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2 flex items-center gap-4 z-10">
               {/* Simulated Chip */}
               <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-300/50 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 border border-black/10 rounded-md" />
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/10" />
                  <div className="absolute left-1/2 top-0 h-full w-[1px] bg-black/10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-black/10 rounded-sm" />
               </div>
               
               {/* Contactless Icon */}
               <Wifi className="w-6 h-6 text-white/50 rotate-90" />
            </div>

            {/* Glass Footer */}
            <div className="absolute bottom-0 left-0 w-full p-5 backdrop-blur-md bg-white/5 border-t border-white/10 flex justify-between items-center z-20">
               {/* User Info */}
               <div className="flex-1 min-w-0 mr-4">
                  <h2 className="text-white font-bold text-lg truncate tracking-wide drop-shadow-sm">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-white/70 bg-white/10 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      {getRoleIcon()}
                      {user.role}
                    </span>
                    <span className="text-[10px] text-white/50 font-mono">
                      SINCE {memberSinceYear}
                    </span>
                  </div>
               </div>

               {/* QR Code */}
               <div className="bg-white p-1.5 rounded-md shadow-lg shrink-0">
                  <QRCode 
                    value={user.id} 
                    size={42} 
                    level="M" 
                    fgColor="#0f172a" // slate-900
                  />
               </div>
            </div>
          </div>

          {/* BACK */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden bg-slate-950 border border-white/10"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
             {/* Magnetic Strip */}
             <div className="w-full h-12 bg-black mt-6 relative">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-50" />
             </div>

             {/* CVV / Signature Area Simulation */}
             <div className="px-6 mt-4 flex items-center gap-4">
                <div className="flex-1 h-8 bg-white/10 relative flex items-center px-2">
                   <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20" />
                   <span className="absolute right-2 text-xs font-mono text-white/80 italic">Authorized Signature</span>
                </div>
                <div className="w-12 h-8 bg-white flex items-center justify-center rounded-sm">
                   <span className="text-slate-900 font-mono font-bold text-xs italic">CVC</span>
                </div>
             </div>

             {/* Info Fields */}
             <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-[9px] uppercase text-gray-500 font-bold tracking-wider mb-1">Tipo Sanguíneo</p>
                      <p className="font-mono text-sm text-gray-300">{user.bloodType || 'N/A'}</p>
                   </div>
                   <div>
                      <p className="text-[9px] uppercase text-gray-500 font-bold tracking-wider mb-1">Membro ID</p>
                      <p className="font-mono text-[10px] text-gray-300 tracking-wider truncate">{user.id}</p>
                   </div>
                </div>

                <div>
                   <p className="text-[9px] uppercase text-gray-500 font-bold tracking-wider mb-1">Emergência</p>
                   <p className="font-mono text-sm text-gray-300">{user.emergencyContact || 'Não informado'}</p>
                </div>
             </div>

             <div className="absolute bottom-4 w-full text-center">
                <p className="text-[8px] text-gray-600 px-6">
                   Este cartão é de propriedade da {user.churchName || 'Igreja'}. 
                   Se encontrado, por favor devolva.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Virar Cartão
        </Button>
        <Button 
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Salvando...' : 'Baixar Carteirinha'}
        </Button>
      </div>
    </div>
  )
}