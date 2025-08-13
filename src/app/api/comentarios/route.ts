import { NextRequest } from 'next/server'
import { CommentController } from './comentarios.controller'

export async function POST(request: NextRequest) {
  return CommentController.createComment(request)
}

export async function GET(request: NextRequest) {
  return CommentController.getRecentComments(request)
}