import { NextRequest } from 'next/server'
import { CommentController } from '../comentarios.controller'

export async function GET(request: NextRequest) {
  return CommentController.getUserComments(request)
}