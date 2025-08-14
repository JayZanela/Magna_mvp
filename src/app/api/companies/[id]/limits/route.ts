import { NextRequest } from 'next/server'
import { CompanyController } from '../../company.controller'
import { withAuth } from '@/lib/auth/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: NextRequest) => {
    const id = parseInt(params.id)
    const userId = (req as any).user?.id
    return await CompanyController.getCompanyLimits(id, userId)
  })(request)
}