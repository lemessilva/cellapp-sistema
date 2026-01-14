import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode('super-secret-key-change-in-prod')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas que exigem autenticação
  const isProtectedRoute = pathname.startsWith('/app') || pathname.startsWith('/admin')
  
  // Se for rota pública, deixa passar
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value

  // Se não tiver token, redireciona para login
  if (!token) {
    const url = new URL('/login', request.url)
    // url.searchParams.set('callbackUrl', pathname) // Opcional: para redirecionar de volta depois
    return NextResponse.redirect(url)
  }

  try {
    // Verifica a assinatura do token
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    // Token inválido ou expirado
    const response = NextResponse.redirect(new URL('/login', request.url))
    // Limpa o cookie inválido
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc - though usually handled by public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
