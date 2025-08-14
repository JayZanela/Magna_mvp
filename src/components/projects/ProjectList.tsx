'use client'

import { useState } from 'react'
import { Project } from '@/lib/types'
import { ProjectCard } from './ProjectCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useProjects, useDeleteProject } from '@/hooks'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'

interface ProjectListProps {
  onSelectProject: (project: Project) => void
  onCreateProject: () => void
  onEditProject: (project: Project) => void
}

export function ProjectList({
  onSelectProject,
  onCreateProject,
  onEditProject,
}: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: projects, isLoading, error } = useProjects()
  const deleteProjectMutation = useDeleteProject()

  console.log('LOG PROJJECTS', projects)

  const filteredProjects = Array.isArray(projects?.projects)
    ? projects?.projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleDeleteProject = (project: Project) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o projeto "${project.name}"?`
      )
    ) {
      deleteProjectMutation.mutate(project.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage message="Erro ao carregar projetos" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={onCreateProject}>Criar Projeto</Button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm ? (
              <p>Nenhum projeto encontrado para "{searchTerm}"</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Nenhum projeto encontrado</p>
                <p className="text-sm">
                  Crie seu primeiro projeto para começar
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
              onEdit={onEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
