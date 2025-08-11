import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function withAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Extrair token do header Authorization
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      
      // Verificar token
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Adicionar dados do usuário ao request
      (request as any).user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }
      
      return handler(request, context)
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
  }
}

// Uso nas rotas protegidas
export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    // Sua lógica aqui - req.user está disponível
    const user = (req as any).user
    return NextResponse.json({ message: `Olá ${user.email}` })
  })(request)
}