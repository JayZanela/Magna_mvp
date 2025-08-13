import { NextRequest } from 'next/server'
import { ExecutionController } from '../../execucoes.controller'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return ExecutionController.retryExecution(request, { params })
}