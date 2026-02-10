import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import AppNavigation from '@/components/AppNavigation'
import MainLayout from '@/components/MainLayout'
import { SidebarProvider } from '@/components/providers/SidebarContext'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Validação de Sessão Básica (Token)
  const sessionUser = await getUser()

  if (!sessionUser) {
    redirect('/login')
  }

  // Use sessionUser directly since getUser already fetches fresh data from DB
  // This ensures consistency with Dashboard and avoids redundant queries
  const currentUser = sessionUser

  if (!currentUser.dados_completos) {
    redirect('/completar-cadastro')
  }

  const isSecretary = currentUser.celula?.secretarioId === currentUser.id

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50">
        <Header userId={currentUser.id} />
        <AppNavigation role={currentUser.role} isSecretary={isSecretary} />
        
        <MainLayout>
          {children}
        </MainLayout>
      
      <Toaster position="top-center" richColors />
      </div>
    </SidebarProvider>
  )
}
