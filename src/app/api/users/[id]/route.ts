import { NextRequest } from 'next/server'
import { UserController } from '../user.controller'

interface RouteParams {
  params: { id: string }
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10)
  return await UserController.getUserById(id)
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10)
  return await UserController.updateUser(id, request)
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10)
  return await UserController.deleteUser(id)
}