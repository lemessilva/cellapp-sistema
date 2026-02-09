import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import MemberCard from '@/components/member/MemberCard'
import LockedState from '@/components/ui/LockedState'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CarteirinhaPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch complete user data including new fields
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      nome: true,
      role: true,
      foto_url: true,
      ativo: true,
      status: true,
      memberSince: true,
      bloodType: true,
      emergencyContact: true,
      createdAt: true
    }
  })

  if (!dbUser) {
    return <div>Usuário não encontrado.</div>
  }

  // Fetch church info for logo
  const churchInfo = await prisma.churchInfo.findUnique({
    where: { id: 'main' },
    select: { 
      name: true,
      logoUrl: true 
    }
  })

  // Gatekeeper Logic
  // User must be ACTIVE and have 'ATIVO' status
  // We use OR logic to ensure strict compliance: if either is missing, lock it.
  // Note: We ran a migration to set status='ATIVO' for all existing active users.
  const isLocked = dbUser.status !== 'ATIVO' || !dbUser.ativo

  // If locked, show LockedState with blurred background effect
  if (isLocked) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Blurred Background Card */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-sm pointer-events-none scale-90 grayscale">
           <MemberCard 
             user={{
               id: dbUser.id,
               name: dbUser.nome,
               role: dbUser.role,
               image: dbUser.foto_url,
               memberSince: dbUser.memberSince || dbUser.createdAt,
               bloodType: dbUser.bloodType,
               emergencyContact: dbUser.emergencyContact
             }} 
           />
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <LockedState 
            title="Carteirinha Bloqueada"
            message="A Carteirinha Digital é exclusiva para Membros Ativos. Complete o Trilho de Crescimento para desbloquear sua identidade oficial."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-lg mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">Carteirinha Digital</h1>
      </div>

      <div className="py-4">
        <MemberCard 
          user={{
            id: dbUser.id,
            name: dbUser.nome,
            role: dbUser.role,
            image: dbUser.foto_url,
            memberSince: dbUser.memberSince || dbUser.createdAt,
            bloodType: dbUser.bloodType,
            emergencyContact: dbUser.emergencyContact
          }} 
        />
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div className="flex justify-between items-center">
           <div>
             <h3 className="font-medium text-slate-900">Dados Desatualizados?</h3>
             <p className="text-xs text-slate-500">Mantenha seu tipo sanguíneo e contatos em dia.</p>
           </div>
           <Button variant="outline" size="sm" asChild>
             <Link href="/perfil">
               Editar Perfil
             </Link>
           </Button>
        </div>
      </div>
    </div>
  )
}
