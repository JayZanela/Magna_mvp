'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useCreateSuite, useUpdateSuite } from '@/hooks'
import { TestSuite } from '@/lib/types'

interface SuiteFormProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  suite?: TestSuite | null
  parentId?: number | null
}

export function SuiteForm({ isOpen, onClose, projectId, suite, parentId }: SuiteFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createSuiteMutation = useCreateSuite()
  const updateSuiteMutation = useUpdateSuite()

  const isEditing = !!suite
  const isLoading = createSuiteMutation.isPending || updateSuiteMutation.isPending
  const error = createSuiteMutation.error || updateSuiteMutation.error

  useEffect(() => {
    if (suite) {
      setName(suite.name)
      setDescription(suite.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [suite])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = { 
      name, 
      description: description || undefined,
      parentId: parentId || undefined
    }

    if (isEditing) {
      updateSuiteMutation.mutate(
        { id: suite.id, data },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    } else {
      createSuiteMutation.mutate(
        { projectId, data },
        {
          onSuccess: () => {
            onClose()
            setName('')
            setDescription('')
          }
        }
      )
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
      title={isEditing ? 'Editar Suite' : 'Nova Suite'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome da Suite"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Módulo de Login, Testes de Integração..."
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o objetivo desta suite de testes..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {parentId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Esta suite será criada como uma sub-suite
            </p>
          </div>
        )}

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