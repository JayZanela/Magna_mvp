import { NextRequest } from 'next/server'
import { ProjectController } from '../../../project.controller'
import { withAuth } from '@/lib/auth/middleware'

interface RouteParams {
  params: { id: string, userId: string }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const projectId = parseInt(params.id, 10)
    const memberId = parseInt(params.userId, 10)
    return await ProjectController.updateProjectMember(projectId, memberId, req)
  })(request)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (req: NextRequest) => {
    const projectId = parseInt(params.id, 10)
    const memberId = parseInt(params.userId, 10)
    return await ProjectController.removeProjectMember(projectId, memberId, req)
  })(request)
}