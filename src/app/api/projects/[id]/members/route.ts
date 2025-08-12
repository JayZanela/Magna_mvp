import { NextRequest } from 'next/server'
import { ProjectController } from '../../project.controller'
import { withAuth } from '@/lib/auth/middleware'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const projectId = parseInt(params.id, 10)
    return await ProjectController.getProjectMembers(projectId, req)
  })(request)
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const projectId = parseInt(params.id, 10)
    return await ProjectController.addProjectMember(projectId, req)
  })(request)
}