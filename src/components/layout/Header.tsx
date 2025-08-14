'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AuthModal } from '@/components/auth'
import { useCurrentUser } from '@/hooks'
import { useAuthManager } from '@/hooks/useAuthManager'

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: user, isLoading } = useCurrentUser()
  const { handleManualLogout, isLoggingOut } = useAuthManager()

  console.log('LOG HEADER', user)

  const handleLogout = () => {
    handleManualLogout()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">🐺 Magna</h1>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <div>Olá, {user.fullName}</div>
                  {user.company && (
                    <div className="text-xs text-gray-500">
                      {user.company.name}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Saindo...' : 'Sair'}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)}>Entrar</Button>
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
