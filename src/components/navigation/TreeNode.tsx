'use client'

import { useState } from 'react'
import { TestSuite, TestScenario } from '@/lib/types'
import { Button } from '@/components/ui/Button'

type TreeNodeData = TestSuite | TestScenario

interface TreeNodeProps {
  id?: string
  data: TreeNodeData
  level: number
  isExpanded?: boolean
  hasChildren?: boolean
  onToggle?: () => void
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCreateChild?: () => void
}

export function TreeNode({
  id,
  data,
  level,
  isExpanded = false,
  hasChildren = false,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onCreateChild
}: TreeNodeProps) {
  const [showActions, setShowActions] = useState(false)
  
  const isSuite = 'suiteOrder' in data
  const isScenario = 'scenarioOrder' in data
  
  const getIcon = () => {
    if (isSuite) {
      return hasChildren ? (isExpanded ? '📂' : '📁') : '📁'
    }
    return '📄'
  }

  const getStatusColor = (status?: string) => {
    if (!status) return ''
    
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'blocked':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600'
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
        return status
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSuite && hasChildren) {
      onToggle?.()
    }
  }

  const handleSelect = () => {
    onSelect?.()
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCreateChild?.()
  }

  return (
    <div className="select-none">
      <div
        id={id}
        className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded group cursor-pointer transition-colors`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={handleSelect}
      >
        {/* Toggle button for suites with children */}
        {isSuite && (
          <button
            onClick={handleToggle}
            className="mr-1 p-1 hover:bg-gray-200 rounded flex items-center justify-center w-6 h-6"
            disabled={!hasChildren}
            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            <span className="text-xs">
              {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
            </span>
          </button>
        )}

        {/* Spacer for scenarios (alinhamento) */}
        {isScenario && (
          <div className="w-7" />
        )}

        {/* Icon */}
        <span className="mr-2 text-base">{getIcon()}</span>

        {/* Name */}
        <span className="flex-1 text-sm font-medium text-gray-900 truncate">
          {data.name}
        </span>

        {/* Status for scenarios */}
        {isScenario && (data as TestScenario).status && (
          <span className={`text-xs px-2 py-1 rounded-full mr-2 ${getStatusColor((data as TestScenario).status)}`}>
            {getStatusText((data as TestScenario).status)}
          </span>
        )}

        {/* Count of children for suites */}
        {isSuite && hasChildren && (
          <span className="text-xs text-gray-500 mr-2">
            ({hasChildren})
          </span>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isSuite && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCreateChild}
                className="text-xs p-1 h-7 w-7"
                title="Adicionar item"
              >
                +
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="text-xs p-1 h-7 w-7"
              title="Editar"
            >
              ✏️
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="text-xs p-1 h-7 w-7"
              title="Excluir"
            >
              🗑️
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}