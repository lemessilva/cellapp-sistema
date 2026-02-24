import { env } from 'process'
import ytSearch from 'yt-search'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

let cachedToken: { accessToken: string; expiresAt: number } | null = null

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = env.SPOTIFY_CLIENT_ID
  const clientSecret = env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not configured')
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!res.ok) {
    throw new Error('Failed to get Spotify access token')
  }

  const data: { access_token: string; token_type: string; expires_in: number } = await res.json()

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000
  }

  return cachedToken.accessToken
}

function getMusicalKey(key: number | null, mode: number | null): string | null {
  if (key == null || mode == null) return null
  if (key === -1) return 'Desconhecido'
  if (key < 0 || key > 11) return null

  const pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const note = pitchClasses[key]
  if (!note) return null

  const isMinor = mode === 0
  return isMinor ? `${note}m` : note
}

export type SpotifyTrack = {
  id: string
  title: string
  artist: string
  coverUrl: string | null
  audioUrl: string
  previewUrl: string | null
  bpm: number | null
  key: string | null
  youtubeUrl: string
  cifraUrl: string
}

export async function searchTrack(query: string): Promise<SpotifyTrack[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const token = await getSpotifyAccessToken()

  const searchParams = new URLSearchParams({
    q: trimmed,
    type: 'track',
    limit: '5'
  })

  const searchRes = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!searchRes.ok) {
    return []
  }

  const searchJson: any = await searchRes.json()
  const items: any[] = searchJson?.tracks?.items || []
  if (items.length === 0) return []

  const ids = items.map((t) => t.id).join(',')

  const featuresRes = await fetch(`${SPOTIFY_API_BASE}/audio-features?ids=${ids}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  let featuresById = new Map<string, { tempo: number | null; key: number | null; mode: number | null }>()

  if (featuresRes.ok) {
    const featuresJson: any = await featuresRes.json()
    const audioFeatures: any[] = featuresJson?.audio_features || []
    for (const f of audioFeatures) {
      if (!f || !f.id) continue
      featuresById.set(f.id, {
        tempo: typeof f.tempo === 'number' ? f.tempo : null,
        key: typeof f.key === 'number' ? f.key : null,
        mode: typeof f.mode === 'number' ? f.mode : null
      })
    }
  }

  const results = await Promise.all(
    items.map(async (track) => {
      const features = featuresById.get(track.id) || { tempo: null, key: null, mode: null }
      const bpm = features.tempo != null ? Math.round(features.tempo) : null
      const musicalKey = getMusicalKey(features.key, features.mode)

      const primaryArtist = track.artists?.[0]?.name || 'Desconhecido'
      const cover = track.album?.images?.[0]?.url || null
      const url = track.external_urls?.spotify || ''
      const previewUrl = (track.preview_url as string | null) || null

      let youtubeUrl = ''
      try {
        const videoResult = await ytSearch(`${track.name} ${primaryArtist} oficial video`)
        youtubeUrl = Array.isArray(videoResult?.videos) && videoResult.videos.length > 0 ? videoResult.videos[0].url : ''
      } catch {
        youtubeUrl = ''
      }

      const cifraUrl =
        'https://www.cifraclub.com.br/busca/?q=' +
        encodeURIComponent(`${track.name} ${primaryArtist}`)

      const mapped: SpotifyTrack = {
        id: track.id as string,
        title: track.name as string,
        artist: primaryArtist as string,
        coverUrl: cover,
        audioUrl: url,
        previewUrl,
        bpm,
        key: musicalKey,
        youtubeUrl,
        cifraUrl
      }
      return mapped
    })
  )

  return results
}
