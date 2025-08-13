import { NextRequest } from 'next/server'
import { CenarioController } from '../cenarios.controller'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return CenarioController.getScenarioById(request, { params })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return CenarioController.updateScenario(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return CenarioController.deleteScenario(request, { params })
}