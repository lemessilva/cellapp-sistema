import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const siteConfig = await prisma.siteConfiguration.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: 'Bem-vindo à Nossa Igreja',
      heroSubtitle: 'Um lugar de fé, esperança e amor.',
      heroCtaText: 'Visite-nos',
      heroCtaLink: '#schedule',
    },
  })

  console.log('Configuração do site criada/garantida:', siteConfig.id)

  const passwordHash = await hash('123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cellapp.com.br' },
    update: {
      nome: 'Administrador',
      password: passwordHash,
      role: Role.ADMIN,
    },
    create: {
      nome: 'Administrador',
      email: 'admin@cellapp.com.br',
      password: passwordHash,
      role: Role.ADMIN,
    },
  })

  console.log('Usuário Admin criado/atualizado:', admin.email)
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
