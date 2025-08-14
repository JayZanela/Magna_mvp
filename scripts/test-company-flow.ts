import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testCompanyFlow() {
  console.log('🧪 Testando fluxo completo de empresas...')

  try {
    // 1. Criar primeira empresa
    console.log('\n📊 1. Criando primeira empresa...')
    const company1 = await prisma.company.create({
      data: {
        name: 'TechCorp Ltda',
        tradingName: 'TechCorp',
        cnpj: '12.345.678/0001-90',
        businessType: 'software_house',
        planType: 'professional',
        maxProjects: 10,
        maxUsers: 25,
        maxStorageGb: 10,
        subdomain: 'techcorp',
        city: 'São Paulo',
        state: 'SP',
        isActive: true
      }
    })
    console.log(`✅ Empresa criada: ${company1.name} (ID: ${company1.id})`)

    // 2. Criar segunda empresa
    console.log('\n📊 2. Criando segunda empresa...')
    const company2 = await prisma.company.create({
      data: {
        name: 'StartupXYZ Ltda',
        tradingName: 'StartupXYZ',
        businessType: 'tech_department',
        planType: 'trial',
        maxProjects: 3,
        maxUsers: 5,
        maxStorageGb: 2,
        city: 'Rio de Janeiro',
        state: 'RJ',
        isActive: true
      }
    })
    console.log(`✅ Empresa criada: ${company2.name} (ID: ${company2.id})`)

    // 3. Criar usuários para a primeira empresa
    console.log('\n👥 3. Criando usuários para TechCorp...')
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    const user1 = await prisma.user.create({
      data: {
        email: 'admin@techcorp.com',
        fullName: 'João Admin',
        passwordHash: hashedPassword,
        role: 'admin',
        companyId: company1.id,
        isActive: true
      }
    })
    console.log(`✅ Admin criado: ${user1.email}`)

    const user2 = await prisma.user.create({
      data: {
        email: 'tester@techcorp.com',
        fullName: 'Maria Tester',
        passwordHash: hashedPassword,
        role: 'tester',
        companyId: company1.id,
        isActive: true
      }
    })
    console.log(`✅ Tester criado: ${user2.email}`)

    // 4. Criar usuários para a segunda empresa
    console.log('\n👥 4. Criando usuários para StartupXYZ...')
    const user3 = await prisma.user.create({
      data: {
        email: 'ceo@startupxyz.com',
        fullName: 'Pedro CEO',
        passwordHash: hashedPassword,
        role: 'admin',
        companyId: company2.id,
        isActive: true
      }
    })
    console.log(`✅ CEO criado: ${user3.email}`)

    // 5. Criar projeto para a primeira empresa
    console.log('\n📁 5. Criando projeto para TechCorp...')
    const project1 = await prisma.project.create({
      data: {
        name: 'Sistema de E-commerce',
        description: 'Plataforma completa de vendas online',
        ownerId: user1.id,
        status: 'active'
      }
    })

    await prisma.projectMember.create({
      data: {
        projectId: project1.id,
        userId: user1.id,
        role: 'admin'
      }
    })

    await prisma.projectMember.create({
      data: {
        projectId: project1.id,
        userId: user2.id,
        role: 'tester'
      }
    })
    console.log(`✅ Projeto criado: ${project1.name}`)

    // 6. Verificar isolamento entre empresas
    console.log('\n🔒 6. Verificando isolamento entre empresas...')
    
    const techCorpUsers = await prisma.user.findMany({
      where: { companyId: company1.id },
      include: { company: { select: { name: true } } }
    })
    
    const startupUsers = await prisma.user.findMany({
      where: { companyId: company2.id },
      include: { company: { select: { name: true } } }
    })

    console.log(`📊 TechCorp tem ${techCorpUsers.length} usuários`)
    console.log(`📊 StartupXYZ tem ${startupUsers.length} usuários`)

    // 7. Testar limites da empresa
    console.log('\n⚠️ 7. Testando limites da empresa...')
    
    const company2Limits = await prisma.company.findUnique({
      where: { id: company2.id },
      include: {
        _count: { select: { users: true } }
      }
    })

    const canAddUser = company2Limits!._count.users < company2Limits!.maxUsers
    console.log(`📈 StartupXYZ: ${company2Limits!._count.users}/${company2Limits!.maxUsers} usuários (Pode adicionar: ${canAddUser})`)

    // 8. Resumo final
    console.log('\n📋 8. Resumo final...')
    const allCompanies = await prisma.company.findMany({
      include: {
        _count: { select: { users: true } }
      }
    })

    console.log('\n🏢 Empresas criadas:')
    allCompanies.forEach(company => {
      console.log(`   • ${company.name}: ${company._count.users} usuários, plano ${company.planType}`)
    })

    console.log('\n✅ Teste completo finalizado com sucesso!')
    console.log('\n🎯 Próximos passos:')
    console.log('   1. Testar APIs via HTTP')
    console.log('   2. Testar autenticação com empresas')
    console.log('   3. Validar criação de projetos com limites')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testCompanyFlow()
    .then(() => {
      console.log('\n✅ Teste finalizado!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Teste falhou:', error)
      process.exit(1)
    })
}

export default testCompanyFlow