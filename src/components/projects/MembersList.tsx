'use client'

import { ProjectMember } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useProjectMembers, useRemoveProjectMember } from '@/hooks'

interface MembersListProps {
  projectId: number
  onAddMember: () => void
}

export function MembersList({ projectId, onAddMember }: MembersListProps) {
  const { data: members, isLoading, error } = useProjectMembers(projectId)
  const removeProjectMemberMutation = useRemoveProjectMember()

  const handleRemoveMember = (member: ProjectMember) => {
    if (window.confirm(`Remover ${member.user.fullName} do projeto?`)) {
      removeProjectMemberMutation.mutate({
        projectId,
        userId: member.userId
      })
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Proprietário'
      case 'manager':
        return 'Gerente'
      case 'tester':
        return 'Testador'
      case 'viewer':
        return 'Visualizador'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'text-purple-600 bg-purple-100'
      case 'manager':
        return 'text-blue-600 bg-blue-100'
      case 'tester':
        return 'text-green-600 bg-green-100'
      case 'viewer':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Erro ao carregar membros" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Membros do Projeto ({members?.length || 0})
        </h3>
        <Button onClick={onAddMember} size="sm">
          Adicionar Membro
        </Button>
      </div>

      {!members || members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum membro no projeto</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {member.user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.user.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {member.user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    Adicionado em: {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
                
                {member.role !== 'owner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member)}
                    disabled={removeProjectMemberMutation.isPending}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}