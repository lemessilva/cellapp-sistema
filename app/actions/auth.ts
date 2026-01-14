'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function logout() {
  const cookieStore = await cookies()
  
  // Destruir cookies de sessão conhecidos
  cookieStore.delete('auth-token')
  cookieStore.delete('user_id') // Legado, mas bom garantir
  
  // Limpar cookies do NextAuth/Auth.js (caso sejam usados no futuro ou paralelamente)
  cookieStore.delete('authjs.session-token')
  cookieStore.delete('__Secure-authjs.session-token')
  cookieStore.delete('next-auth.session-token')
  cookieStore.delete('__Secure-next-auth.session-token')

  // Limpar cache para evitar que o usuário veja páginas antigas ao voltar
  revalidatePath('/')
  revalidatePath('/app')
  revalidatePath('/admin')

  redirect('/login')
}
