import { NextRequest } from 'next/server'
import { AuthController } from '../auth.controller'

export async function POST(request: NextRequest) {
  return await AuthController.refreshToken(request)
}