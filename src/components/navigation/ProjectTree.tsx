'use client'

import { useState, useEffect } from 'react'
import { TestSuite, TestScenario } from '@/lib/types'
import { TreeNode } from './TreeNode'
import { useProjectSuites, useSuiteScenarios } from '@/hooks'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { Button } from '@/components/ui/Button'

type TreeData = TestSuite | TestScenario

interface ProjectTreeProps {
  projectId: number
  onSelectItem?: (item: TreeData) => void
  onEditItem?: (item: TreeData) => void
  onDeleteItem?: (item: TreeData) => void
  onCreateSuite?: (parentId?: number) => void
  onCreateScenario?: (suiteId: number) => void
}

export function ProjectTree({
  projectId,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  onCreateSuite,
  onCreateScenario,
}: ProjectTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [treeData, setTreeData] = useState<TreeData[]>([])

  const { data: suites, isLoading, error } = useProjectSuites(projectId)

  // Build hierarchical tree structure
  useEffect(() => {
    if (!suites) return

    const buildTree = (parentId: number | null = null): TreeData[] => {
      const nodes: TreeData[] = []

      // Add suites
      const suitesAtLevel = suites.suites.filter(
        (suite) => suite.parentId === parentId
      )
      suitesAtLevel.forEach((suite) => {
        nodes.push(suite)

        // Add child suites
        const childSuites = buildTree(suite.id)
        nodes.push(...childSuites)

        // Add scenarios for this suite
        if (suite.scenarios) {
          const sortedScenarios = [...suite.scenarios].sort(
            (a, b) => a.scenarioOrder - b.scenarioOrder
          )
          nodes.push(...sortedScenarios)
        }
      })

      return nodes.sort((a, b) => {
        if ('suiteOrder' in a && 'suiteOrder' in b) {
          return a.suiteOrder - b.suiteOrder
        }
        if ('scenarioOrder' in a && 'scenarioOrder' in b) {
          return a.scenarioOrder - b.scenarioOrder
        }
        return 0
      })
    }

    setTreeData(buildTree())
  }, [suites])

  const handleToggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleCreateChild = (parentId: number) => {
    const parentItem = treeData.find((item) => item.id === parentId)
    if (parentItem && 'suiteOrder' in parentItem) {
      // It's a suite, we can create either a child suite or scenario
      // For now, let's create a scenario by default
      onCreateScenario?.(parentId)
    }
  }

  const renderNode = (item: TreeData, level: number = 0): React.ReactNode => {
    const isSuite = 'suiteOrder' in item
    const children = isSuite ? getChildrenOf(item.id) : []
    const isExpanded = expandedNodes.has(item.id)

    return (
      <TreeNode
        key={item.id}
        data={item}
        level={level}
        isExpanded={isExpanded}
        children={children}
        onToggle={handleToggleNode}
        onSelect={onSelectItem}
        onEdit={onEditItem}
        onDelete={onDeleteItem}
        onCreateChild={handleCreateChild}
      />
    )
  }

  const getChildrenOf = (parentId: number): TreeData[] => {
    return treeData.filter((item) => {
      if ('suiteOrder' in item) {
        return item.parentId === parentId
      }
      return item.suiteId === parentId
    })
  }

  const getRootItems = (): TreeData[] => {
    return treeData.filter((item) => {
      if ('suiteOrder' in item) {
        return item.parentId === null
      }
      return false // Scenarios are not root items
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Erro ao carregar estrutura do projeto" />
  }

  const rootItems = getRootItems()

  return (
    <div className="bg-white border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium text-gray-900">Estrutura do Projeto</h3>
        <Button
          size="sm"
          onClick={() => onCreateSuite?.()}
          title="Criar suite raiz"
        >
          + Suite
        </Button>
      </div>

      <div className="p-2">
        {rootItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Nenhuma suite criada</p>
            <p className="text-sm">Crie sua primeira suite para começar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {rootItems.map((item) => renderNode(item))}
          </div>
        )}
      </div>
    </div>
  )
}
