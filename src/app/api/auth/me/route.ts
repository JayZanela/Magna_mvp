import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { AuthController } from '../auth.controller'

// ✅ ARQUITETURA CORRETA: Route → Controller → Service → Prisma
export const GET = withAuth(async (request: NextRequest) => {
  return await AuthController.getCurrentUser(request)
})