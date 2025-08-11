import { NextRequest } from 'next/server'
import { UserController } from './user.controller'



export async function GET() {
  return await UserController.getUsers()
}

export async function POST(request: NextRequest) {
  return await UserController.createUser(request)
}