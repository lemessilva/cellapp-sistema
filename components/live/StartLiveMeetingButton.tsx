'use client'

import { startLiveMeeting } from '@/app/actions/live-meeting'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Play, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function StartLiveMeetingButton({ cellId }: { cellId: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleConfirmStart = async () => {
        setLoading(true)
        // Use today's date in YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0]
        
        const result = await startLiveMeeting(cellId, today)
        
        if (result.success) {
            toast.success('Célula iniciada!')
            router.push('/live-meeting')
            // Don't set loading false here to prevent UI flicker before redirect
        } else {
            toast.error(result.error || 'Erro ao iniciar')
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-md flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                    <div className="bg-white/20 p-2 rounded-full">
                        <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-normal opacity-90">Modo Ao Vivo</div>
                        <div className="text-lg">INICIAR CÉLULA</div>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Iniciar Célula Ao Vivo?</DialogTitle>
                    <DialogDescription>
                        Esta ação ativará o modo foco para a reunião de hoje.
                        <br />
                        O cronômetro será iniciado e os membros serão notificados.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmStart} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Iniciar Agora
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
