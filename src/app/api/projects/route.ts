import { NextRequest } from 'next/server'
import { ProjectController } from './project.controller'
import { withAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    return await ProjectController.getProjects(req)
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    return await ProjectController.createProject(req)
  })(request)
}