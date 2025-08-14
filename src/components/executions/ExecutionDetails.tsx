'use client'

import { useState } from 'react'
import { TestExecution } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useExecutionComments, useAddExecutionComment, useUploadExecutionFile } from '@/hooks'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'

interface ExecutionDetailsProps {
  isOpen: boolean
  onClose: () => void
  execution: TestExecution | null
}

export function ExecutionDetails({ isOpen, onClose, execution }: ExecutionDetailsProps) {
  const [newComment, setNewComment] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: comments, isLoading: commentsLoading } = useExecutionComments(execution?.id || 0)
  const addCommentMutation = useAddExecutionComment()
  const uploadFileMutation = useUploadExecutionFile()

  if (!execution) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'passed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'blocked':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'in_progress':
        return 'Em Execução'
      case 'passed':
        return 'Passou'
      case 'failed':
        return 'Falhou'
      case 'blocked':
        return 'Bloqueado'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    addCommentMutation.mutate(
      {
        id: execution.id,
        data: { comment: newComment }
      },
      {
        onSuccess: () => {
          setNewComment('')
        }
      }
    )
  }

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    uploadFileMutation.mutate(
      {
        id: execution.id,
        file: selectedFile
      },
      {
        onSuccess: () => {
          setSelectedFile(null)
        }
      }
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Execução #${execution.executionRound}`}
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Status and basic info */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Detalhes da Execução
            </h3>
            <p className="text-sm text-gray-500">
              Executor: {execution.executor.fullName}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(execution.status)}`}>
            {getStatusLabel(execution.status)}
          </span>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Criado:</strong> {formatDate(execution.createdAt)}</p>
            {execution.startedAt && (
              <p><strong>Iniciado:</strong> {formatDate(execution.startedAt)}</p>
            )}
            {execution.completedAt && (
              <p><strong>Concluído:</strong> {formatDate(execution.completedAt)}</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {execution.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {execution.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Test Data */}
        {execution.testData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dados de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                {execution.testData}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {execution.attachments && execution.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Anexos ({execution.attachments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {execution.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {attachment.fileSize && `${Math.round(attachment.fileSize / 1024)} KB`} - 
                        Enviado por {attachment.uploader.fullName} em {formatDate(attachment.uploadedAt)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload file */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Adicionar Evidência</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-3">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              {uploadFileMutation.error && (
                <ErrorMessage message={uploadFileMutation.error.message} />
              )}
              <Button
                type="submit"
                disabled={!selectedFile || uploadFileMutation.isPending}
                size="sm"
              >
                {uploadFileMutation.isPending ? <Loading size="sm" /> : 'Upload'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Comentários ({comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                disabled={addCommentMutation.isPending}
              />
              {addCommentMutation.error && (
                <ErrorMessage message={addCommentMutation.error.message} />
              )}
              <Button
                type="submit"
                disabled={!newComment.trim() || addCommentMutation.isPending}
                size="sm"
              >
                {addCommentMutation.isPending ? <Loading size="sm" /> : 'Comentar'}
              </Button>
            </form>

            {/* Comments list */}
            {commentsLoading ? (
              <Loading />
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{comment.user.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  )
}