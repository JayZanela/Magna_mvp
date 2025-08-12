import { NextRequest } from 'next/server'
import { SuiteController } from '../../../suites/suite.controller'
import { withAuth } from '@/lib/auth/middleware'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const projectId = parseInt(params.id, 10)
    return await SuiteController.getProjectSuites(projectId, req)
  })(request)
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const projectId = parseInt(params.id, 10)
    
    const body = await req.json()
    body.projectId = projectId
    
    const modifiedRequest = new Request(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(body)
    })
    
    Object.defineProperty(modifiedRequest, 'user', {
      value: (req as any).user,
      writable: false
    })

    return await SuiteController.createSuite(modifiedRequest as NextRequest)
  })(request)
}