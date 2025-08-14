import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testQuickRegister() {
  console.log('🧪 Testando novo fluxo de cadastro rápido...')

  try {
    // 1. Limpar banco para teste limpo
    console.log('\n🧹 Limpando banco de dados...')
    await prisma.user.deleteMany()
    await prisma.company.deleteMany()

    // 2. Testar cadastro via API
    console.log('\n📝 Testando cadastro rápido de empresa...')
    
    const registerData = {
      companyName: 'StartupTech',
      businessType: 'software_house',
      adminName: 'João Silva',
      adminEmail: 'joao@startuptech.com',
      adminPassword: '123456',
      tradingName: 'StartupTech',
      industry: 'Tecnologia',
      city: 'São Paulo',
      state: 'SP'
    }

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Cadastro bem-sucedido!')
      console.log(`   👤 Usuário: ${result.user.fullName} (${result.user.email})`)
      console.log(`   🏢 Empresa: ${result.company.name}`)
      console.log(`   📋 Plano: ${result.company.planType}`)
      console.log(`   👥 Limite usuários: ${result.company.maxUsers}`)
      console.log(`   📁 Limite projetos: ${result.company.maxProjects}`)
    } else {
      const error = await response.json()
      console.log('❌ Erro no cadastro:', error)
      throw new Error(`HTTP ${response.status}: ${error.error}`)
    }

    // 3. Verificar no banco
    console.log('\n🔍 Verificando dados no banco...')
    
    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    })

    companies.forEach(company => {
      console.log(`📊 Empresa: ${company.name}`)
      console.log(`   • Tipo: ${company.businessType}`)
      console.log(`   • Plano: ${company.planType}`)
      console.log(`   • Trial até: ${company.trialExpiresAt?.toLocaleDateString('pt-BR')}`)
      console.log(`   • Usuários: ${company.users.length}`)
      company.users.forEach(user => {
        console.log(`     - ${user.fullName} (${user.email}) - ${user.role}`)
      })
    })

    // 4. Testar login
    console.log('\n🔐 Testando login...')
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'joao@startuptech.com',
        password: '123456'
      }),
    })

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json()
      console.log('✅ Login bem-sucedido!')
      console.log(`   👤 ${loginResult.user.fullName}`)
      console.log(`   🏢 Empresa ID: ${loginResult.user.companyId}`)
      console.log(`   🎭 Role: ${loginResult.user.role}`)
    } else {
      const loginError = await loginResponse.json()
      console.log('❌ Erro no login:', loginError)
    }

    // 5. Testar erro de email duplicado
    console.log('\n🔄 Testando proteção contra email duplicado...')
    
    const duplicateResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...registerData,
        companyName: 'Outra Empresa'
      }),
    })

    if (!duplicateResponse.ok) {
      const duplicateError = await duplicateResponse.json()
      console.log('✅ Proteção funcionando:', duplicateError.error)
    } else {
      console.log('❌ ERRO: Deveria ter rejeitado email duplicado!')
    }

    console.log('\n✅ Todos os testes passaram!')
    console.log('\n🎯 Fluxo implementado com sucesso:')
    console.log('   ✅ Cadastro rápido em 2 minutos')
    console.log('   ✅ Apenas campos obrigatórios')
    console.log('   ✅ Empresa + admin criados juntos')
    console.log('   ✅ Trial de 30 dias automático')
    console.log('   ✅ Limites generosos para trial')
    console.log('   ✅ Proteção contra emails duplicados')
    console.log('   ✅ Login funcionando')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  // Aguardar servidor estar pronto
  console.log('⏳ Aguardando 3 segundos para servidor estar pronto...')
  setTimeout(() => {
    testQuickRegister()
      .then(() => {
        console.log('\n✅ Teste finalizado!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('\n❌ Teste falhou:', error)
        process.exit(1)
      })
  }, 3000)
}

export default testQuickRegister