
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Try searching for "mella" (ignoring case usually works but let's be broad)
  const users = await prisma.user.findMany({
    where: {
      nome: {
        contains: 'mella'
      }
    },
    select: {
      email: true,
      nome: true,
      role: true
    }
  })

  console.log('Usuários encontrados com "mella":')
  users.forEach(u => console.log(`- ${u.nome} (${u.email})`))
  
  if (users.length === 0) {
      console.log('Tentando listar todos os usuários...')
      const allUsers = await prisma.user.findMany({
          take: 20,
          select: { nome: true, email: true }
      })
      allUsers.forEach(u => console.log(`- ${u.nome} (${u.email})`))
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
