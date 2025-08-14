'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MembersList } from './MembersList'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useAddProjectMember } from '@/hooks'

interface MembersModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
}

export function MembersModal({ isOpen, onClose, projectId }: MembersModalProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('tester')

  const addProjectMemberMutation = useAddProjectMember()

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Para este MVP, vamos simular que o usuário já existe no sistema
    // Em uma implementação real, seria necessário buscar o usuário pelo email
    const mockUserId = Math.floor(Math.random() * 1000) + 1
    
    addProjectMemberMutation.mutate(
      {
        projectId,
        data: { userId: mockUserId, role }
      },
      {
        onSuccess: () => {
          setEmail('')
          setRole('tester')
          setIsAddingMember(false)
        }
      }
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Membros"
    >
      <div className="space-y-6">
        <MembersList
          projectId={projectId}
          onAddMember={() => setIsAddingMember(true)}
        />

        {isAddingMember && (
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Adicionar Novo Membro
            </h4>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <Input
                type="email"
                label="Email do Usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Função
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tester">Testador</option>
                  <option value="manager">Gerente</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              {addProjectMemberMutation.error && (
                <ErrorMessage message={addProjectMemberMutation.error.message} />
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingMember(false)}
                  disabled={addProjectMemberMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={addProjectMemberMutation.isPending || !email.trim()}
                >
                  {addProjectMemberMutation.isPending ? (
                    <Loading size="sm" />
                  ) : (
                    'Adicionar'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  )
}