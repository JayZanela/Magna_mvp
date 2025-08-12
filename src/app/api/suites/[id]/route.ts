import { NextRequest } from 'next/server'
import { SuiteController } from '../suite.controller'
import { withAuth } from '@/lib/auth/middleware'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const id = parseInt(params.id, 10)
    return await SuiteController.getSuiteById(id, req)
  })(request)
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const id = parseInt(params.id, 10)
    return await SuiteController.updateSuite(id, req)
  })(request)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const id = parseInt(params.id, 10)
    return await SuiteController.deleteSuite(id, req)
  })(request)
}