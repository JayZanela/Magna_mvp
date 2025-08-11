// Exemplo de uso do middleware withAuth em rotas protegidas

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from './middleware'

// Exemplo 1: Rota GET protegida
export async function protectedGET(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    const user = (req as any).user
    
    // Aqui você tem acesso aos dados do usuário autenticado:
    // user.id, user.email, user.role
    
    return NextResponse.json({ 
      message: `Olá ${user.email}`,
      userId: user.id,
      userRole: user.role
    })
  })(request)
}

// Exemplo 2: Rota POST protegida
export async function protectedPOST(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    const user = (req as any).user
    const body = await req.json()
    
    // Lógica do seu endpoint aqui
    // O usuário já está autenticado e validado
    
    return NextResponse.json({ 
      success: true,
      createdBy: user.id,
      data: body
    })
  })(request)
}

// Exemplo 3: Verificação de role específico
export async function adminOnlyEndpoint(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    const user = (req as any).user
    
    // Verificar se o usuário tem permissão de admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      )
    }
    
    // Lógica para admins aqui
    return NextResponse.json({ message: 'Área administrativa' })
  })(request)
}

// Como usar em uma rota real (src/app/api/profile/route.ts):
/*
import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    const user = (req as any).user
    
    // Buscar dados do perfil do usuário
    const profile = await getUserProfile(user.id)
    
    return NextResponse.json(profile)
  })(request)
}
*/