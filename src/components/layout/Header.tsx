'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AuthModal } from '@/components/auth'
import { useCurrentUser, useLogout } from '@/hooks'

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              🐺 Magna
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Olá, {user.fullName}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  )
}