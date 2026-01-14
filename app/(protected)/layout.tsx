import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Header from '@/components/Header'
import AppNavigation from '@/components/AppNavigation'
import MainLayout from '@/components/MainLayout'
import { SidebarProvider } from '@/components/providers/SidebarContext'
import { Toaster } from 'sonner'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  if (!user.dados_completos) {
    redirect('/completar-cadastro')
  }

  const isSecretary = user.celula?.secretarioId === user.id

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50">
        <Header userId={user.id} />
        <AppNavigation role={user.role} isSecretary={isSecretary} />
        
        <MainLayout>
          {children}
        </MainLayout>
      
      <Toaster position="top-center" richColors />
      </div>
    </SidebarProvider>
  )
}
