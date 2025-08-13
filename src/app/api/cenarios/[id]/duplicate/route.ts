import { NextRequest } from 'next/server'
import { CenarioController } from '../../cenarios.controller'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return CenarioController.duplicateScenario(request, { params })
}