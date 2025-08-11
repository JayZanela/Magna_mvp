import { NextRequest } from 'next/server'
import { UserController } from './user.controller'
import { withAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    return await UserController.getUsers()
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    return await UserController.createUser(req)
  })(request)
}