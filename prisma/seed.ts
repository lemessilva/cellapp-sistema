import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')

  // 1. Criar um Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cellapp.com' },
    update: {},
    create: {
      email: 'admin@cellapp.com',
      nome: 'Administrador',
      password: 'admin', // Em produção, usar hash!
      role: 'ADMIN',
      dados_completos: true,
    },
  })
  console.log(`Created admin: ${admin.email}`)

  // 2. Criar um Líder
  const lider = await prisma.user.upsert({
    where: { email: 'lider@cellapp.com' },
    update: {},
    create: {
      email: 'lider@cellapp.com',
      nome: 'Líder da Silva',
      password: '123',
      role: 'LIDER',
      dados_completos: true,
      telefone: '11999999999',
    },
  })
  console.log(`Created lider: ${lider.email}`)

  // 2. Criar uma Célula
  const cell = await prisma.cell.upsert({
    where: { liderId: admin.id },
    update: {},
    create: {
      nome: 'Célula Alpha',
      dia_reuniao: 'Quarta-feira',
      horario: '20:00',
      liderId: admin.id,
      membros: {
        connect: { id: admin.id } // Admin também é membro da célula
      }
    },
  })

  // Atualizar admin para ser membro da célula também
  await prisma.user.update({
    where: { id: admin.id },
    data: { celulaId: cell.id }
  })

  // 4. Criar um Convite Válido
  const invite = await prisma.invite.upsert({
    where: { token: 'convite-teste-123' },
    update: {},
    create: {
      token: 'convite-teste-123', // Token fixo para facilitar teste
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      createdById: lider.id,
      cellId: cell.id,
    },
  })
  console.log(`Created invite token: ${invite.token}`)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
