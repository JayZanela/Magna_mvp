import { NextRequest } from 'next/server'
import { ExecutionController } from '../../../execucoes/execucoes.controller'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return ExecutionController.getExecutionHistory(request, { params })
}