'use client'

import { useState, useEffect } from 'react'
import { TestSuite, TestScenario } from '@/lib/types'
import { TreeNode } from './TreeNode'
import { useProjectSuites } from '@/hooks'
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

// Estrutura hierárquica para representar a árvore
interface TreeNode {
  id: number
  data: TreeData
  children: TreeNode[]
  level: number
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
  const [treeStructure, setTreeStructure] = useState<TreeNode[]>([])

  const { data: suites, isLoading, error, refetch } = useProjectSuites(projectId)

  // Construir árvore hierárquica CORRETAMENTE
  useEffect(() => {
    if (!suites?.suites) {
      setTreeStructure([])
      return
    }

    const buildHierarchy = (parentId: number | null = null, level: number = 0): TreeNode[] => {
      // Encontrar suites deste nível
      const suitesAtLevel = suites.suites.filter(
        suite => suite.parentId === parentId
      ).sort((a, b) => a.suiteOrder - b.suiteOrder)

      return suitesAtLevel.map(suite => {
        const node: TreeNode = {
          id: suite.id,
          data: suite,
          children: [],
          level
        }

        // Adicionar suites filhas recursivamente
        const childSuites = buildHierarchy(suite.id, level + 1)
        node.children.push(...childSuites)

        // Adicionar cenários desta suite
        if (suite.scenarios && suite.scenarios.length > 0) {
          const scenarioNodes: TreeNode[] = suite.scenarios
            .sort((a, b) => a.scenarioOrder - b.scenarioOrder)
            .map(scenario => ({
              id: scenario.id,
              data: scenario,
              children: [],
              level: level + 1
            }))
          
          node.children.push(...scenarioNodes)
        }

        return node
      })
    }

    setTreeStructure(buildHierarchy())
  }, [suites])

  // Recarregar quando criar novos itens
  useEffect(() => {
    refetch()
  }, [refetch])

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
    // Criar menu suspenso para escolher suite ou cenário
    const createMenu = () => {
      const rect = document.getElementById(`node-${parentId}`)?.getBoundingClientRect()
      if (rect) {
        const menu = document.createElement('div')
        menu.className = 'absolute bg-white border shadow-lg rounded z-50 py-2'
        menu.style.left = `${rect.right + 10}px`
        menu.style.top = `${rect.top}px`
        
        const suiteBtn = document.createElement('button')
        suiteBtn.className = 'block w-full px-4 py-2 text-left hover:bg-gray-100'
        suiteBtn.textContent = '📁 Criar Suite'
        suiteBtn.onclick = () => {
          onCreateSuite?.(parentId)
          menu.remove()
        }
        
        const scenarioBtn = document.createElement('button')
        scenarioBtn.className = 'block w-full px-4 py-2 text-left hover:bg-gray-100'
        scenarioBtn.textContent = '📄 Criar Cenário'
        scenarioBtn.onclick = () => {
          onCreateScenario?.(parentId)
          menu.remove()
        }
        
        menu.appendChild(suiteBtn)
        menu.appendChild(scenarioBtn)
        document.body.appendChild(menu)
        
        // Remover ao clicar fora
        const removeMenu = (e: MouseEvent) => {
          if (!menu.contains(e.target as Node)) {
            menu.remove()
            document.removeEventListener('click', removeMenu)
          }
        }
        setTimeout(() => document.addEventListener('click', removeMenu), 0)
      }
    }
    
    createMenu()
  }

  const renderTreeNode = (node: TreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id}>
        <TreeNode
          id={`node-${node.id}`}
          data={node.data}
          level={node.level}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onToggle={() => handleToggleNode(node.id)}
          onSelect={() => onSelectItem?.(node.data)}
          onEdit={() => onEditItem?.(node.data)}
          onDelete={() => onDeleteItem?.(node.data)}
          onCreateChild={() => handleCreateChild(node.id)}
        />

        {/* Renderizar filhos se expandido */}
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children.map(childNode => renderTreeNode(childNode))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white border rounded-lg">
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <ErrorMessage message="Erro ao carregar estrutura do projeto" />
      </div>
    )
  }

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

      <div className="p-2 max-h-96 overflow-y-auto">
        {treeStructure.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Nenhuma suite criada</p>
            <p className="text-sm">Crie sua primeira suite para começar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {treeStructure.map(node => renderTreeNode(node))}
          </div>
        )}
      </div>
    </div>
  )
}
