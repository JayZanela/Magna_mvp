'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProjectList, ProjectForm } from '@/components/projects'
import { useCurrentUser } from '@/hooks'
import { Project } from '@/lib/types'

export default function Home() {
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const { data: user } = useCurrentUser()

  const handleSelectProject = (project: Project) => {
    // Navegar para página do projeto
    window.location.href = `/projects/${project.id}`
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setIsProjectFormOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsProjectFormOpen(true)
  }

  const handleCloseProjectForm = () => {
    setIsProjectFormOpen(false)
    setEditingProject(null)
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Bem-vindo à Magna 🐺
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sistema de gerenciamento de testes de software
          </p>
          <p className="text-sm text-gray-500">
            Faça login para acessar seus projetos
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Meus Projetos
          </h1>
          <p className="text-gray-600">
            Gerencie seus projetos de teste de software
          </p>
        </div>

        <ProjectList
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
        />
      </div>

      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={handleCloseProjectForm}
        project={editingProject}
      />
    </Layout>
  )
}