import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Fórmula de Haversine para calcular distância em km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Raio da terra em km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distância em km
  return d
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const cidade = searchParams.get('cidade')
  const bairro = searchParams.get('bairro')
  const dia = searchParams.get('dia')

  try {
    let cells = await prisma.cell.findMany({
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
        latitude: true,
        longitude: true,
      }
    })

    // Filtro de Dia da Semana (Aplicado a todos os casos se existir)
    if (dia) {
      cells = cells.filter(cell => 
        cell.diaSemana?.toUpperCase() === dia.toUpperCase()
      )
    }

    type CellResult = typeof cells[0] & { distancia?: number | null }
    let results: CellResult[] = []

    // Estratégia 1: Busca por Geolocalização
    if (latParam && lngParam) {
      const userLat = parseFloat(latParam)
      const userLng = parseFloat(lngParam)

      results = cells
        .map(cell => {
          if (!cell.latitude || !cell.longitude) return null

          const distance = getDistanceFromLatLonInKm(
            userLat,
            userLng,
            cell.latitude,
            cell.longitude
          )

          return { ...cell, distancia: distance }
        })
        .filter((cell): cell is CellResult => cell !== null && (cell.distancia !== undefined && cell.distancia <= 15)) // Raio de 15km
        .sort((a, b) => (a.distancia || 0) - (b.distancia || 0))
    } 
    // Estratégia 2: Busca por Texto (Cidade ou Bairro)
    else if (cidade || bairro) {
      results = cells.filter(cell => {
        const matchCidade = cidade && cell.cidade 
          ? cell.cidade.toLowerCase().includes(cidade.toLowerCase())
          : false
        
        const matchBairro = bairro && cell.bairro
          ? cell.bairro.toLowerCase().includes(bairro.toLowerCase())
          : false
        
        if (cidade && bairro) {
            return matchCidade || matchBairro
        }
        return matchCidade || matchBairro
      })
    }
    // Estratégia 3: Sem busca, mas com filtro de dia (ou listagem geral limitada)
    else {
        results = cells
    }

    const safeResponse = results.map((cell) => ({
      id: cell.id,
      nome: cell.nome,
      liderNome: cell.lider?.nome || 'Líder',
      diaSemana: cell.diaSemana || cell.dia_reuniao,
      horario: cell.horario,
      bairro: cell.bairro,
      cidade: cell.cidade,
      whatsappLider: cell.lider?.whatsapp || cell.lider?.telefone,
      distancia: cell.distancia ? parseFloat(cell.distancia.toFixed(1)) : null
    }))

    return NextResponse.json(safeResponse)
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar células' }, { status: 500 })
  }
}
