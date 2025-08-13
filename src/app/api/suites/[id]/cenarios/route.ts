import { NextRequest } from 'next/server'
import { CenarioController } from '../../../cenarios/cenarios.controller'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return CenarioController.getSuiteScenarios(request, { params })
}