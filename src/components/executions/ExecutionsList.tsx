'use client'

import { useState } from 'react'
import { TestExecution } from '@/lib/types'
import { ExecutionCard } from './ExecutionCard'
import { Button } from '@/components/ui/Button'
import { useScenarioExecutions, useCreateExecution, useRetryExecution } from '@/hooks'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'

interface ExecutionsListProps {
  scenarioId: number
  onViewExecution: (execution: TestExecution) => void
  onEditExecution: (execution: TestExecution) => void
}

export function ExecutionsList({ scenarioId, onViewExecution, onEditExecution }: ExecutionsListProps) {
  const { data: executions, isLoading, error } = useScenarioExecutions(scenarioId)
  const createExecutionMutation = useCreateExecution()
  const retryExecutionMutation = useRetryExecution()

  const handleCreateExecution = () => {
    createExecutionMutation.mutate({
      scenarioId,
      notes: 'Nova execução de teste'
    })
  }

  const handleRetryExecution = (execution: TestExecution) => {
    retryExecutionMutation.mutate(execution.id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Erro ao carregar execuções" />
  }

  const sortedExecutions = executions?.sort((a, b) => b.executionRound - a.executionRound) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Execuções ({sortedExecutions.length})
        </h3>
        <Button
          onClick={handleCreateExecution}
          disabled={createExecutionMutation.isPending}
        >
          {createExecutionMutation.isPending ? (
            <Loading size="sm" />
          ) : (
            'Nova Execução'
          )}
        </Button>
      </div>

      {createExecutionMutation.error && (
        <ErrorMessage message={createExecutionMutation.error.message} />
      )}

      {retryExecutionMutation.error && (
        <ErrorMessage message={retryExecutionMutation.error.message} />
      )}

      {sortedExecutions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Nenhuma execução registrada</p>
          <p className="text-sm">Crie uma nova execução para começar a testar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedExecutions.map((execution) => (
            <ExecutionCard
              key={execution.id}
              execution={execution}
              onView={onViewExecution}
              onEdit={onEditExecution}
              onRetry={handleRetryExecution}
            />
          ))}
        </div>
      )}
    </div>
  )
}