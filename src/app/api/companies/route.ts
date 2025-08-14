import { NextRequest } from 'next/server'
import { CompanyController } from './company.controller'
import { withAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    return await CompanyController.getCompanies()
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    return await CompanyController.createCompany(req)
  })(request)
}