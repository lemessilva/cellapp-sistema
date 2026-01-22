'use client'

import { startLiveMeeting } from '@/app/actions/live-meeting'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Play, Loader2 } from 'lucide-react'

export function StartLiveMeetingButton({ cellId }: { cellId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStart = async () => {
        if (!confirm('Iniciar modo Célula Ao Vivo? Isso bloqueará o app em modo foco.')) return

        setLoading(true)
        // Use today's date in YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0]
        
        const result = await startLiveMeeting(cellId, today)
        
        if (result.success) {
            toast.success('Célula iniciada!')
            router.push('/live-meeting')
        } else {
            toast.error(result.error || 'Erro ao iniciar')
        }
        setLoading(false)
    }

    return (
        <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-md flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
            <div className="bg-white/20 p-2 rounded-full">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
            </div>
            <div className="text-left">
                <div className="text-sm font-normal opacity-90">Modo Ao Vivo</div>
                <div className="text-lg">INICIAR CÉLULA</div>
            </div>
        </button>
    )
}
