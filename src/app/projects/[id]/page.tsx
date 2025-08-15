'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { ProjectHeader } from '@/components/projects/ProjectHeader'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { MembersModal } from '@/components/projects/MembersModal'
import { ProjectTree } from '@/components/navigation'
import { SuiteForm } from '@/components/suites'
import { ScenarioForm, ScenarioDetails } from '@/components/scenarios'
import { useProject } from '@/hooks'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { TestSuite, TestScenario } from '@/lib/types'

type TreeItem = TestSuite | TestScenario

function SuiteDetails({
  suite,
  onEdit,
  onSelectScenario,
}: {
  suite: TestSuite
  onEdit: (suite: TestSuite) => void
  onSelectScenario: (scenario: TestScenario) => void
}) {
  const scenarios = suite?._count?.scenarios || 0

  const getScenarioStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'blocked':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'in_progress':
        return 'Em Progresso'
      case 'completed':
        return 'Concluído'
      case 'failed':
        return 'Falhou'
      case 'blocked':
        return 'Bloqueado'
      default:
        return status || 'Sem status'
    }
  }

  return (
    <div className="bg-white border rounded-lg">
      {/* Cabeçalho da Suite */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              📂 {suite.name}
            </h3>
            <p className="text-sm text-gray-500">Suite de Teste</p>
          </div>
          <Button variant="outline" onClick={() => onEdit(suite)}>
            Editar Suite
          </Button>
        </div>

        {suite.description && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
            <p className="text-gray-600">{suite.description}</p>
          </div>
        )}

        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(suite.createdAt).toLocaleDateString('pt-BR')}
          </p>
          <p>
            <strong>Cenários:</strong> {scenarios}
          </p>
        </div>
      </div>

      {/* Lista de Cenários */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Cenários da Suite</h4>
          {scenarios > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                concluídos
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                pendentes
              </span>
            </div>
          )}
        </div>

        {scenarios === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2">📄</div>
            <p className="mb-2">Nenhum cenário criado</p>
            <p className="text-sm">
              Esta suite ainda não possui cenários de teste
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">teste</div>
        )}
      </div>
    </div>
  )
}

function ItemDetails({
  item,
  onEdit,
  onSelectScenario,
}: {
  item: TreeItem
  onEdit: (item: TreeItem) => void
  onSelectScenario?: (scenario: TestScenario) => void
}) {
  const isSuite = 'suiteOrder' in item

  if (!isSuite) {
    // Use the detailed scenario component for scenarios
    return (
      <ScenarioDetails
        scenarioId={item.id}
        onEdit={(scenario) => onEdit(scenario)}
      />
    )
  }

  // Enhanced suite details with scenario list
  return (
    <SuiteDetails
      suite={item as TestSuite}
      onEdit={(suite) => onEdit(suite)}
      onSelectScenario={(scenario) => onSelectScenario?.(scenario)}
    />
  )
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = parseInt((params?.id as string) || '0')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isSuiteFormOpen, setIsSuiteFormOpen] = useState(false)
  const [isScenarioFormOpen, setIsScenarioFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null)
  const [editingItem, setEditingItem] = useState<TreeItem | null>(null)
  const [parentSuiteId, setParentSuiteId] = useState<number | null>(null)
  const [targetSuiteId, setTargetSuiteId] = useState<number>(0)

  const { data: project, isLoading, error } = useProject(projectId)

  const handleSelectItem = (item: TreeItem) => {
    setSelectedItem(item)
  }

  const handleSelectScenario = (scenario: TestScenario) => {
    setSelectedItem(scenario)
  }

  const handleEditItem = (item: TreeItem) => {
    setEditingItem(item)
    const isSuite = 'suiteOrder' in item
    if (isSuite) {
      setIsSuiteFormOpen(true)
    } else {
      setIsScenarioFormOpen(true)
    }
  }

  const handleDeleteItem = (item: TreeItem) => {
    const isSuite = 'suiteOrder' in item
    const itemType = isSuite ? 'suite' : 'cenário'

    if (
      window.confirm(
        `Tem certeza que deseja excluir esta ${itemType}: "${item.name}"?`
      )
    ) {
      // TODO: Implement delete logic
      console.log('Delete item:', item)
    }
  }

  const handleCreateSuite = (parentId?: number) => {
    setParentSuiteId(parentId || null)
    setEditingItem(null)
    setIsSuiteFormOpen(true)
  }

  const handleCreateScenario = (suiteId: number) => {
    setTargetSuiteId(suiteId)
    setEditingItem(null)
    setIsScenarioFormOpen(true)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </Layout>
    )
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="py-12">
          <ErrorMessage message="Projeto não encontrado" />
          <div className="mt-4">
            <Button onClick={() => router.push('/')}>
              Voltar para projetos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <ProjectHeader
          project={project}
          onEditProject={() => setIsEditModalOpen(true)}
          onManageMembers={() => setIsMembersModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProjectTree
              projectId={projectId}
              onSelectItem={handleSelectItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onCreateSuite={handleCreateSuite}
              onCreateScenario={handleCreateScenario}
            />
          </div>

          <div className="lg:col-span-2">
            {selectedItem ? (
              <ItemDetails
                item={selectedItem}
                onEdit={handleEditItem}
                onSelectScenario={handleSelectScenario}
              />
            ) : (
              <div className="bg-white border rounded-lg p-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione um item
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Clique em uma suite ou cenário na árvore para ver os
                    detalhes
                  </p>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">📂</div>
                      <h4 className="font-medium text-gray-900">Suites</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Pastas organizacionais
                      </p>
                    </div>

                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">📄</div>
                      <h4 className="font-medium text-gray-900">Cenários</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Casos de teste
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProjectForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />

      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={projectId}
      />

      <SuiteForm
        isOpen={isSuiteFormOpen}
        onClose={() => {
          setIsSuiteFormOpen(false)
          setEditingItem(null)
          setParentSuiteId(null)
        }}
        projectId={projectId}
        suite={
          editingItem && 'suiteOrder' in editingItem
            ? (editingItem as TestSuite)
            : null
        }
        parentId={parentSuiteId}
      />

      <ScenarioForm
        isOpen={isScenarioFormOpen}
        onClose={() => {
          setIsScenarioFormOpen(false)
          setEditingItem(null)
          setTargetSuiteId(0)
        }}
        projectId={projectId}
        suiteId={
          targetSuiteId ||
          (editingItem && 'scenarioOrder' in editingItem
            ? (editingItem as TestScenario).suiteId
            : 0)
        }
        scenario={
          editingItem && 'scenarioOrder' in editingItem
            ? (editingItem as TestScenario)
            : null
        }
      />
    </Layout>
  )
}
