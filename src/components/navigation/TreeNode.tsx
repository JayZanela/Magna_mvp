'use client'

import { useState } from 'react'
import { TestSuite, TestScenario } from '@/lib/types'
import { Button } from '@/components/ui/Button'

type TreeNodeData = TestSuite | TestScenario

interface TreeNodeProps {
  data: TreeNodeData
  level: number
  isExpanded?: boolean
  children?: TreeNodeData[]
  onToggle?: (id: number) => void
  onSelect?: (data: TreeNodeData) => void
  onEdit?: (data: TreeNodeData) => void
  onDelete?: (data: TreeNodeData) => void
  onCreateChild?: (parentId: number) => void
}

export function TreeNode({
  data,
  level,
  isExpanded = false,
  children = [],
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onCreateChild
}: TreeNodeProps) {
  const [showActions, setShowActions] = useState(false)
  
  const isSuite = 'suiteOrder' in data
  const isScenario = 'scenarioOrder' in data
  const hasChildren = children.length > 0
  
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
        return 'text-yellow-600'
      case 'in_progress':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'blocked':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleToggle = () => {
    if (isSuite && hasChildren) {
      onToggle?.(data.id)
    }
  }

  const handleSelect = () => {
    onSelect?.(data)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(data)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(data)
  }

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCreateChild?.(data.id)
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded group cursor-pointer`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={handleSelect}
      >
        {/* Toggle button for suites with children */}
        {isSuite && hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            className="mr-1 p-1 hover:bg-gray-200 rounded"
          >
            <span className="text-xs">
              {isExpanded ? '▼' : '▶'}
            </span>
          </button>
        )}

        {/* Icon */}
        <span className="mr-2 text-sm">{getIcon()}</span>

        {/* Name */}
        <span className="flex-1 text-sm truncate">{data.name}</span>

        {/* Status for scenarios */}
        {isScenario && (data as TestScenario).status && (
          <span className={`text-xs mr-2 ${getStatusColor((data as TestScenario).status)}`}>
            {(data as TestScenario).status}
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
                className="text-xs p-1 h-6"
                title="Adicionar item"
              >
                +
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="text-xs p-1 h-6"
              title="Editar"
            >
              ✏️
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="text-xs p-1 h-6"
              title="Excluir"
            >
              🗑️
            </Button>
          </div>
        )}
      </div>

      {/* Children */}
      {isSuite && isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              data={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}