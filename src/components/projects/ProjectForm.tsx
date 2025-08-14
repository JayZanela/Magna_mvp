'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useCreateProject, useUpdateProject } from '@/hooks'
import { Project } from '@/lib/types'

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  project?: Project | null
}

export function ProjectForm({ isOpen, onClose, project }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()

  const isEditing = !!project
  const isLoading = createProjectMutation.isPending || updateProjectMutation.isPending
  const error = createProjectMutation.error || updateProjectMutation.error

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = { name, description: description || undefined }

    if (isEditing) {
      updateProjectMutation.mutate(
        { id: project.id, data },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    } else {
      createProjectMutation.mutate(data, {
        onSuccess: () => {
          onClose()
          setName('')
          setDescription('')
        }
      })
    }
  }

  const handleClose = () => {
    onClose()
    setName('')
    setDescription('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Projeto' : 'Criar Projeto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Projeto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome do projeto"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o projeto..."
            rows={3}
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