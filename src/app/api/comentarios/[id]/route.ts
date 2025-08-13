import { NextRequest } from 'next/server'
import { CommentController } from '../comentarios.controller'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return CommentController.getCommentById(request, { params })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return CommentController.updateComment(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return CommentController.deleteComment(request, { params })
}