import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToCompanies() {
  console.log('🚀 Iniciando migração para sistema de empresas...')

  try {
    // 1. Criar empresa padrão
    console.log('📊 Criando empresa padrão...')
    const defaultCompany = await prisma.company.create({
      data: {
        name: 'Magna Empresa Padrão',
        tradingName: 'Magna',
        businessType: 'tech_department',
        planType: 'professional',
        maxProjects: 50,
        maxUsers: 100,
        maxStorageGb: 20,
        isActive: true,
        country: 'BR',
        // Trial de 90 dias para empresa padrão
        trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        createdBy: null
      }
    })

    console.log(`✅ Empresa padrão criada com ID: ${defaultCompany.id}`)

    // 2. Buscar todos os usuários sem empresa
    const usersWithoutCompany = await prisma.user.findMany({
      where: { companyId: null },
      select: { id: true, email: true, fullName: true, role: true }
    })

    console.log(`📋 Encontrados ${usersWithoutCompany.length} usuários para migrar`)

    if (usersWithoutCompany.length === 0) {
      console.log('✅ Nenhum usuário para migrar. Migração concluída!')
      return
    }

    // 3. Associar usuários à empresa padrão
    let migratedCount = 0
    for (const user of usersWithoutCompany) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          companyId: defaultCompany.id,
          // Se for o primeiro usuário ou se já tem role admin, manter admin
          role: user.role === 'admin' || migratedCount === 0 ? 'admin' : user.role
        }
      })
      
      console.log(`  ✓ Usuário ${user.email} migrado para empresa padrão`)
      migratedCount++
    }

    // 4. Criar estatísticas finais
    const finalStats = await prisma.company.findUnique({
      where: { id: defaultCompany.id },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    console.log('\n📊 Migração concluída com sucesso!')
    console.log(`   • Empresa: ${finalStats?.name}`)
    console.log(`   • Usuários migrados: ${finalStats?._count.users}`)
    console.log(`   • Limites configurados:`)
    console.log(`     - Projetos: ${finalStats?.maxProjects}`)
    console.log(`     - Usuários: ${finalStats?.maxUsers}`)
    console.log(`     - Armazenamento: ${finalStats?.maxStorageGb}GB`)

    console.log('\n🎯 Próximos passos:')
    console.log('   1. Revisar dados da empresa padrão via API')
    console.log('   2. Configurar subdomain se necessário')
    console.log('   3. Ajustar roles dos usuários conforme necessário')
    console.log('   4. Testar criação de novos usuários e projetos')

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateToCompanies()
    .then(() => {
      console.log('\n✅ Migração finalizada!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Migração falhou:', error)
      process.exit(1)
    })
}

export default migrateToCompanies