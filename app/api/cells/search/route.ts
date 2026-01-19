import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const cells = await prisma.cell.findMany({
      select: {
        id: true,
        nome: true,
        lider: {
          select: {
            nome: true,
            whatsapp: true,
            telefone: true,
          }
        },
        diaSemana: true,
        dia_reuniao: true,
        horario: true,
        bairro: true,
        cidade: true,
        rosters: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          },
          take: 1,
          select: {
            customAddress: true,
            host: {
              select: {
                bairro: true,
                cidade: true
              }
            }
          }
        }
      },
      orderBy: {
        diaSemana: 'asc',
      }
    })

    const safeResponse = cells.map((cell) => {
      const nextRoster = cell.rosters[0]
      let displayLocation = 'Local a definir'

      // Hierarquia de Privacidade
      // 1. Anfitrião (Se houver): Mostra apenas Bairro - Cidade
      if (nextRoster?.host?.bairro) {
        displayLocation = `${nextRoster.host.bairro}${nextRoster.host.cidade ? ' - ' + nextRoster.host.cidade : ''}`
      }
      // 2. Endereço Manual: Ignorado por segurança (não temos garantia que é só bairro)
      // 3. Fallback: Dados da Célula
      else if (cell.bairro) {
        displayLocation = `${cell.bairro}${cell.cidade ? ' - ' + cell.cidade : ''}`
      }

      return {
        id: cell.id,
        nome: cell.nome,
        liderNome: cell.lider?.nome || 'Líder',
        diaSemana: cell.diaSemana || cell.dia_reuniao,
        horario: cell.horario,
        bairro: cell.bairro,
        cidade: cell.cidade,
        whatsappLider: cell.lider?.whatsapp || cell.lider?.telefone,
        displayLocation,
      }
    })

    return NextResponse.json(safeResponse)
  } catch (error) {
    console.error('List API Error:', error)
    return NextResponse.json([])
  }
}
