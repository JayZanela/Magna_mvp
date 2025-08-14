'use client'

import { Project } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProjectCardProps {
  project: Project
  onSelect: (project: Project) => void
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
}

export function ProjectCard({ project, onSelect, onEdit, onDelete }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

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
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          )}
          
          <div className="text-xs text-gray-500">
            <p>Criado em: {formatDate(project.createdAt)}</p>
            {project.owner && (
              <p>Proprietário: {project.owner.fullName}</p>
            )}
            {project.members && (
              <p>{project.members.length} membro(s)</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => onSelect(project)}
          >
            Acessar
          </Button>
          
          <div className="flex space-x-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(project)
                }}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(project)
                }}
              >
                Excluir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}