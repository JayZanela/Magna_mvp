/**
 * Global setup para Vitest
 * Configura banco de dados e dados base antes de todos os testes
 */

import { TestDatabaseManager } from './database-manager'

export async function setup() {
  console.log('🚀 Global setup started...')
  
  try {
    // Inicializar conexão com banco
    await TestDatabaseManager.initialize()
    
    // Reset completo para garantir estado limpo
    await TestDatabaseManager.resetDatabase()
    
    // Configurar dados base para todos os testes
    await TestDatabaseManager.setupBaseData()
    
    console.log('✅ Global setup completed successfully')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export async function teardown() {
  console.log('🧹 Global teardown started...')
  
  try {
    // Limpar dados de teste
    await TestDatabaseManager.cleanupTestData()
    
    // Fechar conexão
    await TestDatabaseManager.disconnect()
    
    console.log('✅ Global teardown completed successfully')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Não falhar aqui para não impedir outros cleanups
  }
}