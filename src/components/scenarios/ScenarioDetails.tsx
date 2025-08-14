'use client'

import { useState } from 'react'
import { TestScenario, TestExecution } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ExecutionsList, ExecutionDetails } from '@/components/executions'
import { useScenario } from '@/hooks'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'

interface ScenarioDetailsProps {
  scenarioId: number
  onEdit?: (scenario: TestScenario) => void
}

export function ScenarioDetails({ scenarioId, onEdit }: ScenarioDetailsProps) {
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null)
  const [isExecutionDetailsOpen, setIsExecutionDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'executions'>('details')

  const { data: scenario, isLoading, error } = useScenario(scenarioId)

  const handleViewExecution = (execution: TestExecution) => {
    setSelectedExecution(execution)
    setIsExecutionDetailsOpen(true)
  }

  const handleEditExecution = (execution: TestExecution) => {
    // TODO: Implement edit execution
    console.log('Edit execution:', execution)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading />
      </div>
    )
  }

  if (error || !scenario) {
    return <ErrorMessage message="Erro ao carregar cenário" />
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Crítica'
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return priority
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center space-x-2">
                <span>📄</span>
                <span>{scenario.name}</span>
              </CardTitle>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scenario.status)}`}>
                  {scenario.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(scenario.priority)}`}>
                  {getPriorityLabel(scenario.priority)}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => onEdit?.(scenario)}>
              Editar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Criador:</span> {scenario.creator.fullName}
            </div>
            <div>
              <span className="font-medium">Responsável:</span> {scenario.assignee?.fullName || 'Não atribuído'}
            </div>
            <div>
              <span className="font-medium">Criado:</span> {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div>
              <span className="font-medium">Atualizado:</span> {new Date(scenario.updatedAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'executions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Execuções ({scenario.executions?.length || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' ? (
        <div className="space-y-4">
          {scenario.preconditions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pré-condições</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {scenario.preconditions}
                </p>
              </CardContent>
            </Card>
          )}

          {scenario.steps && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Passos do Teste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {scenario.steps}
                </p>
              </CardContent>
            </Card>
          )}

          {scenario.expectedResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resultado Esperado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {scenario.expectedResult}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <ExecutionsList
          scenarioId={scenario.id}
          onViewExecution={handleViewExecution}
          onEditExecution={handleEditExecution}
        />
      )}

      {/* Execution Details Modal */}
      <ExecutionDetails
        isOpen={isExecutionDetailsOpen}
        onClose={() => {
          setIsExecutionDetailsOpen(false)
          setSelectedExecution(null)
        }}
        execution={selectedExecution}
      />
    </div>
  )
}