'use client'

import { X, CheckCircle, Clock } from 'lucide-react'
import QRCode from 'react-qr-code'

type TicketProps = {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
  eventDate: string
  eventLocation?: string
  userName: string
  status: string // 'CONFIRMED' | 'WAITLIST' | 'CANCELED'
  paymentStatus: string // 'PAID' | 'PENDING'
  registrationId: string
}

export function TicketModal({ isOpen, onClose, eventTitle, eventDate, eventLocation, userName, status, paymentStatus, registrationId }: TicketProps) {
  if (!isOpen) return null

  const isConfirmed = status === 'CONFIRMED' && paymentStatus === 'PAID'
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header - Stub */}
        <div className={`h-4 ${isConfirmed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>

          <div className="text-center mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seu Ingresso</h3>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{eventTitle}</h2>
          </div>

          {/* Ticket Body */}
          <div className="space-y-4 border-b-2 border-dashed border-slate-100 pb-6 mb-6 relative">
            {/* Cutout circles */}
            <div className="absolute -left-8 bottom-[-36px] w-6 h-6 bg-slate-800 rounded-full"></div> 
            <div className="absolute -right-8 bottom-[-36px] w-6 h-6 bg-slate-800 rounded-full"></div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Participante</label>
              <p className="font-semibold text-slate-800">{userName}</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <label className="text-xs text-slate-400 font-medium">Data</label>
                <p className="font-semibold text-slate-800">{new Date(eventDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <label className="text-xs text-slate-400 font-medium">Hora</label>
                <p className="font-semibold text-slate-800">{new Date(eventDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Local</label>
              <p className="font-semibold text-slate-800 truncate">{eventLocation || 'A definir'}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
             <div className="p-2 bg-white border-2 border-slate-100 rounded-xl">
                <QRCode value={registrationId} size={120} />
             </div>
             
             <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
               isConfirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
             }`}>
               {isConfirmed ? (
                 <>
                   <CheckCircle className="w-4 h-4" /> Confirmado
                 </>
               ) : (
                 <>
                   <Clock className="w-4 h-4" /> Pagamento Pendente
                 </>
               )}
             </div>
             
             <p className="text-xs text-slate-400 text-center font-mono">{registrationId}</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center">
            <p className="text-xs text-slate-400">Apresente este QR Code na entrada.</p>
        </div>
      </div>
    </div>
  )
}
