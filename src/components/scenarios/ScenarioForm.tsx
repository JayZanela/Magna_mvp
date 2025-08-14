'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useCreateScenario, useUpdateScenario, useProjectMembers } from '@/hooks'
import { TestScenario } from '@/lib/types'

interface ScenarioFormProps {
  isOpen: boolean
  onClose: () => void
  suiteId: number
  projectId: number
  scenario?: TestScenario | null
}

export function ScenarioForm({ isOpen, onClose, suiteId, projectId, scenario }: ScenarioFormProps) {
  const [name, setName] = useState('')
  const [preconditions, setPreconditions] = useState('')
  const [steps, setSteps] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [assignedTo, setAssignedTo] = useState<number | undefined>()
  const [priority, setPriority] = useState('medium')

  const createScenarioMutation = useCreateScenario()
  const updateScenarioMutation = useUpdateScenario()
  const { data: members } = useProjectMembers(projectId)

  const isEditing = !!scenario
  const isLoading = createScenarioMutation.isPending || updateScenarioMutation.isPending
  const error = createScenarioMutation.error || updateScenarioMutation.error

  useEffect(() => {
    if (scenario) {
      setName(scenario.name)
      setPreconditions(scenario.preconditions || '')
      setSteps(scenario.steps || '')
      setExpectedResult(scenario.expectedResult || '')
      setAssignedTo(scenario.assignedTo || undefined)
      setPriority(scenario.priority)
    } else {
      setName('')
      setPreconditions('')
      setSteps('')
      setExpectedResult('')
      setAssignedTo(undefined)
      setPriority('medium')
    }
  }, [scenario])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name,
      preconditions: preconditions || undefined,
      steps: steps || undefined,
      expectedResult: expectedResult || undefined,
      assignedTo: assignedTo || undefined,
      priority
    }

    if (isEditing) {
      updateScenarioMutation.mutate(
        { id: scenario.id, data },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    } else {
      createScenarioMutation.mutate(
        { suiteId, data },
        {
          onSuccess: () => {
            onClose()
            resetForm()
          }
        }
      )
    }
  }

  const resetForm = () => {
    setName('')
    setPreconditions('')
    setSteps('')
    setExpectedResult('')
    setAssignedTo(undefined)
    setPriority('medium')
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Baixa'
      case 'medium':
        return 'Média'
      case 'high':
        return 'Alta'
      case 'critical':
        return 'Crítica'
      default:
        return priority
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Cenário' : 'Novo Cenário de Teste'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Cenário"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Validar login com credenciais válidas"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Responsável (opcional)
            </label>
            <select
              value={assignedTo || ''}
              onChange={(e) => setAssignedTo(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Não atribuído</option>
              {members?.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Pré-condições (opcional)
          </label>
          <textarea
            value={preconditions}
            onChange={(e) => setPreconditions(e.target.value)}
            placeholder="Descreva as condições necessárias antes do teste..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Passos do Teste (opcional)
          </label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="1. Acessar a página de login
2. Inserir email válido
3. Inserir senha válida
4. Clicar em 'Entrar'"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Resultado Esperado (opcional)
          </label>
          <textarea
            value={expectedResult}
            onChange={(e) => setExpectedResult(e.target.value)}
            placeholder="Descreva o que deve acontecer quando o teste for executado corretamente..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <ErrorMessage message={error.message} />
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <Loading size="sm" />
            ) : (
              isEditing ? 'Atualizar' : 'Criar'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}