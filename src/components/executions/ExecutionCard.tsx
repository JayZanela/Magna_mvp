'use client'

import { TestExecution } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ExecutionCardProps {
  execution: TestExecution
  onView: (execution: TestExecution) => void
  onEdit: (execution: TestExecution) => void
  onRetry: (execution: TestExecution) => void
}

export function ExecutionCard({ execution, onView, onEdit, onRetry }: ExecutionCardProps) {
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

  const getDuration = () => {
    if (execution.startedAt && execution.completedAt) {
      const start = new Date(execution.startedAt)
      const end = new Date(execution.completedAt)
      const diffMs = end.getTime() - start.getTime()
      const diffMins = Math.round(diffMs / 60000)
      return `${diffMins} min`
    }
    return null
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm">
            Execução #{execution.executionRound}
          </CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
            {getStatusLabel(execution.status)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600">
          <p><strong>Executor:</strong> {execution.executor.fullName}</p>
          <p><strong>Iniciado:</strong> {execution.startedAt ? formatDate(execution.startedAt) : 'Não iniciado'}</p>
          {execution.completedAt && (
            <p><strong>Concluído:</strong> {formatDate(execution.completedAt)}</p>
          )}
          {getDuration() && (
            <p><strong>Duração:</strong> {getDuration()}</p>
          )}
        </div>

        {execution.notes && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Observações:</p>
            <p className="text-xs text-gray-600 line-clamp-2">{execution.notes}</p>
          </div>
        )}

        <div className="flex items-center text-xs text-gray-500">
          {execution.attachments && execution.attachments.length > 0 && (
            <span className="mr-3">📎 {execution.attachments.length} anexo(s)</span>
          )}
          {execution.comments && execution.comments.length > 0 && (
            <span>💬 {execution.comments.length} comentário(s)</span>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <Button size="sm" variant="outline" onClick={() => onView(execution)}>
            Ver Detalhes
          </Button>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(execution)}>
              Editar
            </Button>
            {execution.status === 'failed' && (
              <Button size="sm" onClick={() => onRetry(execution)}>
                Reexecutar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}