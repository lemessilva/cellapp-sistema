'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { sendNotification } from '@/app/actions/notifications'
import { searchTrack, SpotifyTrack } from '@/lib/spotify'
import ytSearch from 'yt-search'
export async function getSongs() {
  return prisma.song.findMany({
    orderBy: { title: 'asc' }
  })
}

export async function createSong(input: {
  title: string
  artist: string
  cipherLink?: string | null
  bpm?: number | null
  key?: string | null
  coverUrl?: string | null
  previewUrl?: string | null
  youtubeUrl?: string | null
}) {
  const { title, artist, cipherLink, bpm, key, coverUrl, previewUrl, youtubeUrl } = input

  const titleNormalized = String(title ?? '').trim()
  const artistNormalized = String(artist ?? '').trim()
  if (!titleNormalized || !artistNormalized) {
    return { error: 'Título e Artista são obrigatórios.' }
  }

  const safeTrim = (v?: string | null) => {
    const s = v == null ? '' : String(v).trim()
    return s.length > 0 ? s : null
  }

  let parsedBpm: number | null = null
  try {
    if (bpm !== undefined && bpm !== null) {
      const n = parseInt(bpm.toString(), 10)
      parsedBpm = Number.isFinite(n) ? n : null
    }
  } catch {
    parsedBpm = null
  }

  try {
    let song = await prisma.song.create({
      data: {
        title: titleNormalized,
        artist: artistNormalized,
        cipherLink: safeTrim(cipherLink ?? null),
        bpm: parsedBpm,
        key: safeTrim(key ?? null),
        coverUrl: safeTrim(coverUrl ?? null),
        previewUrl: safeTrim(previewUrl ?? null),
        youtubeUrl: safeTrim(youtubeUrl ?? null)
      }
    })
    revalidatePath('/admin/louvor/repertorio')
    return { success: true, song }
  } catch (error) {
    console.error('Erro Prisma ao salvar música (tentativa com previewUrl):', error)

    // Fallback para ambientes onde o Prisma Client ainda não conhece o campo previewUrl/youtubeUrl
    try {
      const song = await prisma.song.create({
        data: {
          title: titleNormalized,
          artist: artistNormalized,
          cipherLink: safeTrim(cipherLink ?? null),
          bpm: parsedBpm,
          key: safeTrim(key ?? null),
          coverUrl: safeTrim(coverUrl ?? null)
        }
      })
      revalidatePath('/admin/louvor/repertorio')
      return { success: true, song }
    } catch (fallbackError) {
      console.error('Erro Prisma ao salvar música (fallback sem previewUrl):', fallbackError)
    }

    return {
      error: 'Falha ao salvar a música no banco de dados. Verifique os logs.'
    }
  }
}

export async function updateSong(
  id: string,
  input: {
    title: string
    artist: string
    cipherLink?: string | null
    bpm?: number | null
    key?: string | null
    coverUrl?: string | null
    previewUrl?: string | null
    youtubeUrl?: string | null
  }
) {
  const { title, artist, cipherLink, bpm, key, coverUrl, previewUrl, youtubeUrl } = input

  const titleNormalized = String(title ?? '').trim()
  const artistNormalized = String(artist ?? '').trim()
  if (!titleNormalized || !artistNormalized) {
    return { error: 'Título e Artista são obrigatórios.' }
  }

  const safeTrim = (v?: string | null) => {
    const s = v == null ? '' : String(v).trim()
    return s.length > 0 ? s : null
  }

  let parsedBpm: number | null = null
  try {
    if (bpm !== undefined && bpm !== null) {
      const n = parseInt(bpm.toString(), 10)
      parsedBpm = Number.isFinite(n) ? n : null
    }
  } catch {
    parsedBpm = null
  }

  try {
    let song = await prisma.song.update({
      where: { id },
      data: {
        title: titleNormalized,
        artist: artistNormalized,
        cipherLink: safeTrim(cipherLink ?? null),
        bpm: parsedBpm,
        key: safeTrim(key ?? null),
        coverUrl: safeTrim(coverUrl ?? null),
        previewUrl: safeTrim(previewUrl ?? null),
        youtubeUrl: safeTrim(youtubeUrl ?? null)
      }
    })
    revalidatePath('/admin/louvor/repertorio')
    return { success: true, song }
  } catch (error) {
    console.error('Erro Prisma ao atualizar música (tentativa com previewUrl):', error)

    // Fallback para ambientes onde o Prisma Client ainda não conhece o campo previewUrl/youtubeUrl
    try {
      const song = await prisma.song.update({
        where: { id },
        data: {
          title: titleNormalized,
          artist: artistNormalized,
          cipherLink: safeTrim(cipherLink ?? null),
          bpm: parsedBpm,
          key: safeTrim(key ?? null),
          coverUrl: safeTrim(coverUrl ?? null)
        }
      })
      revalidatePath('/admin/louvor/repertorio')
      return { success: true, song }
    } catch (fallbackError) {
      console.error('Erro Prisma ao atualizar música (fallback sem previewUrl):', fallbackError)
    }

    return {
      error: 'Falha ao atualizar a música no banco de dados. Verifique os logs.'
    }
  }
}

export async function searchSpotifyTracks(query: string): Promise<SpotifyTrack[]> {
  try {
    return await searchTrack(query)
  } catch {
    return []
  }
}

export async function deleteSong(id: string) {
  await prisma.song.delete({ where: { id } })
  revalidatePath('/admin/louvor/repertorio')
  return { success: true }
}

export async function resolveSongYoutubeUrl(id: string) {
  const song = await prisma.song.findUnique({ where: { id } })
  if (!song) {
    return { error: 'Música não encontrada.' }
  }

  if (song.youtubeUrl) {
    return { url: song.youtubeUrl }
  }

  const query = `${song.title} ${song.artist} oficial video`
  let url: string | null = null

  try {
    const result = await ytSearch(query)
    url =
      Array.isArray(result?.videos) && result.videos.length > 0
        ? result.videos[0].url
        : null
  } catch (error) {
    console.error('Erro ao buscar vídeo no YouTube para a música:', error)
  }

  if (!url) {
    return { url: null }
  }

  try {
    await prisma.song.update({
      where: { id },
      data: {
        // Em ambientes onde o Prisma Client não conhece youtubeUrl,
        // isso pode lançar erro, que será apenas logado e ignorado.
        youtubeUrl: url as any
      }
    })
  } catch (error) {
    console.error('Erro ao persistir youtubeUrl da música (ignorado neste ambiente):', error)
  }

  return { url }
}

export async function getWorshipMembers() {
  return prisma.user.findMany({
    where: {
      ativo: true,
      ministryTags: { hasSome: ['LOUVOR_MEMBRO', 'LOUVOR_LIDER'] }
    },
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' }
  })
}

export type ScaleInput = {
  title: string
  date: string
  participants: { userId: string; role: string }[]
  songIds: string[]
}

export async function createScale(input: ScaleInput) {
  const { title, date, participants, songIds } = input
  if (!title.trim() || !date) {
    return { error: 'Título e data são obrigatórios.' }
  }
  const when = new Date(date)
  const scale = await prisma.scale.create({
    data: {
      title: title.trim(),
      date: when,
      participants: {
        create: participants.map(p => ({
          userId: p.userId,
          role: p.role.trim(),
          status: 'PENDING'
        }))
      },
      songs: {
        create: songIds.map((songId, index) => ({
          songId,
          order: index
        }))
      }
    }
  })

  // Notificar cada participante da nova escala
  const uniqueParticipantIds = Array.from(new Set(participants.map(p => p.userId)))
  await Promise.all(
    uniqueParticipantIds.map(userId =>
      sendNotification({
        userId,
        title: '🎵 Nova escala de louvor',
        message: `Você foi escalado para "${scale.title}" em ${when.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}.`,
        type: 'ROSTER',
        link: '/escalas',
        metaData: { scaleId: scale.id }
      })
    )
  )

  revalidatePath('/admin/louvor/escalas')
  return { success: true }
}

export async function getAdminScales() {
  return prisma.scale.findMany({
    orderBy: { date: 'asc' },
    include: {
      participants: {
        include: {
          user: { select: { id: true, nome: true } }
        }
      },
      songs: {
        include: {
          song: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })
}

export async function getMyScales() {
  const user = await getUser()
  if (!user) return []

  const now = new Date()

  return prisma.scaleParticipant.findMany({
    where: {
      userId: user.id,
      scale: { date: { gte: now } }
    },
    include: {
      scale: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, nome: true } }
            }
          },
          songs: {
            include: { song: true },
            orderBy: { order: 'asc' }
          }
        }
      }
    },
    orderBy: {
      scale: { date: 'asc' }
    }
  })
}

export async function updateScaleParticipantStatus(id: string, status: 'CONFIRMED' | 'REJECTED' | 'PENDING') {
  const participation = await prisma.scaleParticipant.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { id: true, nome: true } },
      scale: true
    }
  })

  // Notificar líderes de louvor sobre a resposta do membro
  const worshipLeaders = await prisma.user.findMany({
    where: {
      ativo: true,
      ministryTags: { has: 'LOUVOR_LIDER' }
    },
    select: { id: true }
  })

  const statusLabel =
    status === 'CONFIRMED' ? 'CONFIRMOU presença' : status === 'REJECTED' ? 'RECUSOU a escala' : 'atualizou o status'

  await Promise.all(
    worshipLeaders.map(leader =>
      sendNotification({
        userId: leader.id,
        title: '🎵 Resposta em escala de louvor',
        message: `${participation.user?.nome || 'Um membro'} ${statusLabel} em "${participation.scale.title}".`,
        type: 'ROSTER',
        link: '/admin/louvor/escalas',
        metaData: { scaleId: participation.scale.id, participantId: participation.id, status }
      })
    )
  )

  revalidatePath('/escalas')
  return { success: true }
}
