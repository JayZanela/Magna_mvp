import { NextRequest } from 'next/server'
import { ExecutionController } from '../execucoes.controller'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return ExecutionController.getExecutionById(request, { params })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return ExecutionController.updateExecution(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return ExecutionController.deleteExecution(request, { params })
}