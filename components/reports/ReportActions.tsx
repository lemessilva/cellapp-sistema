'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { handleReturnReport } from '@/app/actions/report'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AlertCircle, FileText, X, UploadCloud } from 'lucide-react'

interface ReportActionsProps {
    reportId: string
    status: string
    userRole: string
}

export function ReportActions({ reportId, status, userRole }: ReportActionsProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter()

    // Permite visualização para LIDER, ADMIN, SUPERVISOR
    // Apenas se o status for ENVIADO_LIDER (Aguardando Aprovação)
    // O usuário solicitou explicitamente que ADMIN também veja.
    const canView = ['LIDER', 'ADMIN', 'SUPERVISOR'].includes(userRole) && status === 'ENVIADO_LIDER'

    if (!canView) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Devolver / Corrigir
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Devolver Relatório para Correção</DialogTitle>
                    <DialogDescription>
                        Indique o motivo da devolução. O relatório voltará para rascunho.
                    </DialogDescription>
                </DialogHeader>
                <form 
                    action={async (formData) => {
                        setLoading(true)
                        const res = await handleReturnReport(formData)
                        setLoading(false)
                        if(res?.error) {
                            toast.error(res.error)
                        } else {
                            toast.success('Relatório devolvido com sucesso!')
                            setOpen(false)
                            router.refresh()
                        }
                    }}
                    className="space-y-4 py-4"
                >
                    <input type="hidden" name="reportId" value={reportId} />
                    <div>
                        <label className="text-sm font-medium mb-1 block">Motivo</label>
                        <Textarea name="reason" placeholder="Descreva o erro encontrado..." required />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block text-slate-700">Print/Imagem (Opcional)</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer relative group bg-slate-50/50">
                            <input 
                                type="file" 
                                name="file" 
                                accept="image/*" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setSelectedFile(e.target.files[0])
                                    }
                                }}
                            />
                            
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2 text-indigo-600 z-0 animate-in fade-in zoom-in">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault() // Prevent opening file dialog
                                                setSelectedFile(null)
                                            }}
                                            className="p-1 hover:bg-red-100 text-red-500 rounded-full z-20 transition-colors"
                                            title="Remover arquivo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-indigo-400">Arquivo selecionado</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-indigo-200 transition-all">
                                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                                    </div>
                                    <p className="text-sm text-slate-700 font-bold group-hover:text-indigo-700 transition-colors">Clique ou arraste a imagem</p>
                                    <p className="text-xs text-slate-400 mt-1">JPG, PNG (Máx 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50">Cancelar</Button>
                        <Button type="submit" variant="destructive" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm shadow-red-200">
                            {loading ? 'Enviando...' : 'Confirmar Devolução'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
