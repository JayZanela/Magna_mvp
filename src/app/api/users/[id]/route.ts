import { NextRequest } from 'next/server'
import { UserController } from '../user.controller'
import { withAuth } from '@/lib/auth/middleware'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const id = parseInt(params.id, 10)
    return await UserController.getUserById(id)
  })(request)
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const id = parseInt(params.id, 10)
    return await UserController.updateUser(id, req)
  })(request)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const id = parseInt(params.id, 10)
    const requesterId = (req as any).user?.id
    return await UserController.deleteUser(id, requesterId)
  })(request)
}