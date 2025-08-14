'use client'

import { Project } from '@/lib/types'
import { Button } from '@/components/ui/Button'

interface ProjectHeaderProps {
  project: Project
  onEditProject: () => void
  onManageMembers: () => void
}

export function ProjectHeader({ project, onEditProject, onManageMembers }: ProjectHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-red-600 bg-red-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'completed':
        return 'Concluído'
      default:
        return status
    }
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
            </div>
            
            {project.description && (
              <p className="mt-2 text-gray-600">
                {project.description}
              </p>
            )}
            
            <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
              {project.owner && (
                <span>Proprietário: {project.owner.fullName}</span>
              )}
              {project.members && (
                <span>{project.members.length} membro(s)</span>
              )}
              <span>
                Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onManageMembers}
            >
              Gerenciar Membros
            </Button>
            <Button
              variant="outline"
              onClick={onEditProject}
            >
              Editar Projeto
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}