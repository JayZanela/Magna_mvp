'use client'

import { Header } from './Header'
import { useAuthManager } from '@/hooks/useAuthManager'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  // Inicializar o gerenciador de autenticação em todos os componentes que usam Layout
  useAuthManager()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}