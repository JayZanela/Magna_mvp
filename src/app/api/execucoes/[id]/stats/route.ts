import { NextRequest } from 'next/server'
import { CommentController } from '../../../comentarios/comentarios.controller'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return CommentController.getExecutionCommentStats(request, { params })
}