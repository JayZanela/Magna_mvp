import { NextRequest } from 'next/server'
import { ExecutionController } from './execucoes.controller'

export async function POST(request: NextRequest) {
  return ExecutionController.startExecution(request)
}