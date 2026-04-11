// FlowDesk — Seed inicial
// Cria dados de exemplo para desenvolvimento

const dotenv = require('dotenv') as { config: (options: { path: string }) => void }
dotenv.config({ path: '.env.local' })

import { PrismaClient, UserRole, TicketStatus, TicketPriority, ChecklistPeriodicity, ChecklistItemType, KnowledgeArticleStatus } from '../node_modules/.prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // -------------------------------------------------------
  // Company
  // -------------------------------------------------------
  const company = await prisma.company.upsert({
    where: { slug: 'flowdesk-demo' },
    update: {},
    create: {
      name: 'FlowDesk Demo',
      slug: 'flowdesk-demo',
      isActive: true,
    },
  })
  console.log('✅ Company created:', company.name)

  // -------------------------------------------------------
  // Units
  // -------------------------------------------------------
  const unitMatrix = await prisma.unit.upsert({
    where: { id: 'unit-matrix' },
    update: {},
    create: {
      id: 'unit-matrix',
      name: 'Matriz',
      description: 'Unidade principal',
      companyId: company.id,
    },
  })

  const unitBranch = await prisma.unit.upsert({
    where: { id: 'unit-branch-1' },
    update: {},
    create: {
      id: 'unit-branch-1',
      name: 'Filial 01',
      description: 'Primeira filial',
      companyId: company.id,
    },
  })
  console.log('✅ Units created')

  // -------------------------------------------------------
  // Sectors
  // -------------------------------------------------------
  const sectorTI = await prisma.sector.upsert({
    where: { id: 'sector-ti' },
    update: {},
    create: {
      id: 'sector-ti',
      name: 'TI',
      description: 'Tecnologia da Informação',
      companyId: company.id,
    },
  })

  const sectorRH = await prisma.sector.upsert({
    where: { id: 'sector-rh' },
    update: {},
    create: {
      id: 'sector-rh',
      name: 'RH',
      description: 'Recursos Humanos',
      companyId: company.id,
    },
  })

  const sectorOperations = await prisma.sector.upsert({
    where: { id: 'sector-ops' },
    update: {},
    create: {
      id: 'sector-ops',
      name: 'Operações',
      description: 'Setor operacional',
      companyId: company.id,
    },
  })
  console.log('✅ Sectors created')

  // -------------------------------------------------------
  // Users
  // -------------------------------------------------------
  const hashPassword = async (plain: string) => bcrypt.hash(plain, 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flowdesk.dev' },
    update: {},
    create: {
      name: 'Admin FlowDesk',
      email: 'admin@flowdesk.dev',
      password: await hashPassword('Admin@123'),
      role: UserRole.ADMIN,
      companyId: company.id,
      unitId: unitMatrix.id,
      sectorId: sectorTI.id,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'gestor@flowdesk.dev' },
    update: {},
    create: {
      name: 'Carlos Gestor',
      email: 'gestor@flowdesk.dev',
      password: await hashPassword('Gestor@123'),
      role: UserRole.MANAGER,
      companyId: company.id,
      unitId: unitMatrix.id,
      sectorId: sectorOperations.id,
    },
  })

  const analyst = await prisma.user.upsert({
    where: { email: 'analista@flowdesk.dev' },
    update: {},
    create: {
      name: 'Ana Analista',
      email: 'analista@flowdesk.dev',
      password: await hashPassword('Analista@123'),
      role: UserRole.ANALYST,
      companyId: company.id,
      unitId: unitMatrix.id,
      sectorId: sectorTI.id,
    },
  })

  const requester = await prisma.user.upsert({
    where: { email: 'solicitante@flowdesk.dev' },
    update: {},
    create: {
      name: 'João Solicitante',
      email: 'solicitante@flowdesk.dev',
      password: await hashPassword('Solicitante@123'),
      role: UserRole.REQUESTER,
      companyId: company.id,
      unitId: unitBranch.id,
      sectorId: sectorRH.id,
    },
  })
  console.log('✅ Users created')

  // -------------------------------------------------------
  // Tickets
  // -------------------------------------------------------
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Computador não liga na sala de reuniões',
        description: 'O computador da sala de reuniões principal não está ligando. Já tentamos reiniciar sem sucesso.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        category: 'Hardware',
        companyId: company.id,
        unitId: unitMatrix.id,
        sectorId: sectorTI.id,
        requesterId: requester.id,
        assigneeId: analyst.id,
        slaDueAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Acesso ao sistema ERP bloqueado',
        description: 'Não consigo acessar o módulo financeiro do ERP desde ontem de manhã.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.CRITICAL,
        category: 'Acesso/Permissão',
        companyId: company.id,
        unitId: unitMatrix.id,
        sectorId: sectorTI.id,
        requesterId: manager.id,
        assigneeId: analyst.id,
        slaDueAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hora
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Solicitação de novo colaborador no sistema',
        description: 'Precisamos criar usuário para novo colaborador que inicia na segunda-feira.',
        status: TicketStatus.WAITING_RESPONSE,
        priority: TicketPriority.MEDIUM,
        category: 'Cadastro',
        companyId: company.id,
        unitId: unitBranch.id,
        sectorId: sectorRH.id,
        requesterId: requester.id,
        slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Impressora da recepção com papel atolado',
        description: 'Impressora principal da recepção está com papel atolado e não consigo resolver.',
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.LOW,
        category: 'Hardware',
        companyId: company.id,
        unitId: unitMatrix.id,
        sectorId: sectorOperations.id,
        requesterId: requester.id,
        assigneeId: analyst.id,
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        slaDueAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Lentidão na rede WiFi do escritório',
        description: 'A rede WiFi está extremamente lenta desde a atualização de ontem.',
        status: TicketStatus.CLOSED,
        priority: TicketPriority.HIGH,
        category: 'Rede',
        companyId: company.id,
        unitId: unitMatrix.id,
        sectorId: sectorTI.id,
        requesterId: manager.id,
        assigneeId: analyst.id,
        resolvedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        slaDueAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        slaBreached: false,
      },
    }),
  ])
  console.log(`✅ ${tickets.length} tickets created`)

  // -------------------------------------------------------
  // Checklist Template
  // -------------------------------------------------------
  const template = await prisma.checklistTemplate.create({
    data: {
      name: 'Abertura do Escritório',
      description: 'Checklist diário de abertura e verificação das instalações',
      periodicity: ChecklistPeriodicity.DAILY,
      companyId: company.id,
      unitId: unitMatrix.id,
      sectorId: sectorOperations.id,
      items: {
        create: [
          { title: 'Luzes funcionando', type: ChecklistItemType.CONFORMITY, order: 1, isRequired: true },
          { title: 'Ar condicionado operacional', type: ChecklistItemType.CONFORMITY, order: 2, isRequired: true },
          { title: 'Portaria liberada', type: ChecklistItemType.CONFORMITY, order: 3, isRequired: true },
          { title: 'Temperatura do ambiente (°C)', type: ChecklistItemType.NUMBER, order: 4, isRequired: false },
          { title: 'Observações gerais', type: ChecklistItemType.TEXT, order: 5, isRequired: false },
          { title: 'Foto da entrada', type: ChecklistItemType.ATTACHMENT, order: 6, isRequired: false },
        ],
      },
    },
    include: { items: true },
  })
  console.log('✅ Checklist template created:', template.name)

  // -------------------------------------------------------
  // Knowledge Articles
  // -------------------------------------------------------
  await prisma.knowledgeArticle.createMany({
    data: [
      {
        title: 'Como resetar senha do Windows',
        content: `# Como resetar senha do Windows\n\nSe você esqueceu sua senha do Windows, siga os passos abaixo:\n\n1. Na tela de login, clique em "Esqueci minha senha"\n2. Selecione sua conta Microsoft\n3. Siga as instruções enviadas para seu e-mail de recuperação\n\n**Contato:** Se o problema persistir, abra um chamado para o setor de TI.`,
        category: 'TI - Acesso',
        tags: ['windows', 'senha', 'acesso'],
        status: KnowledgeArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        companyId: company.id,
        authorId: admin.id,
        views: 42,
      },
      {
        title: 'Procedimento de solicitação de equipamentos',
        content: `# Solicitação de Equipamentos\n\nPara solicitar novos equipamentos ou reparos, siga o processo abaixo:\n\n1. Abra um chamado no FlowDesk\n2. Categoria: Hardware\n3. Descreva o equipamento e o problema\n4. Anexe foto se possível\n\nO prazo de atendimento é de até **2 dias úteis** para análise inicial.`,
        category: 'Processos',
        tags: ['equipamento', 'hardware', 'solicitação'],
        status: KnowledgeArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        companyId: company.id,
        authorId: admin.id,
        views: 18,
      },
    ],
  })
  console.log('✅ Knowledge articles created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Demo credentials:')
  console.log('  Admin:      admin@flowdesk.dev      / Admin@123')
  console.log('  Manager:    gestor@flowdesk.dev     / Gestor@123')
  console.log('  Analyst:    analista@flowdesk.dev   / Analista@123')
  console.log('  Requester:  solicitante@flowdesk.dev / Solicitante@123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
