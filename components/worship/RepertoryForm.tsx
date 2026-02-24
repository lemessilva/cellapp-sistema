'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Play, Pause, Square, Youtube, FileText } from 'lucide-react'
import {
  createSong,
  deleteSong,
  searchSpotifyTracks,
  updateSong,
  resolveSongYoutubeUrl
} from '@/app/actions/worship'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

type Song = {
  id: string
  title: string
  artist: string
  cipherLink: string | null
  bpm: number | null
  key: string | null
  coverUrl: string | null
  previewUrl: string | null
  youtubeUrl: string | null
}

type SpotifySuggestion = {
  id: string
  title: string
  artist: string
  coverUrl: string | null
  audioUrl: string
  bpm: number | null
  key: string | null
  youtubeUrl: string
  cifraUrl: string
  previewUrl: string | null
}

export function RepertoryForm({ songs }: { songs: Song[] }) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [cipherLink, setCipherLink] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [bpm, setBpm] = useState<string>('')
  const [key, setKey] = useState('')

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [spotifyResults, setSpotifyResults] = useState<SpotifySuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const isSelectingRef = useRef(false)
  const [editingSongId, setEditingSongId] = useState<string | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  function normalizeYouTubeWatchUrl(url: string | null): string | null {
    if (!url) return null
    try {
      const parsed = new URL(url)
      const host = parsed.hostname.toLowerCase()
      let videoId: string | null = null
      if (host.includes('youtube.com')) {
        const v = parsed.searchParams.get('v')
        if (v) videoId = v
        if (!videoId && parsed.pathname.startsWith('/embed/')) {
          videoId = parsed.pathname.split('/embed/')[1] || null
        }
        if (!videoId && parsed.pathname.startsWith('/shorts/')) {
          videoId = parsed.pathname.split('/shorts/')[1] || null
        }
      } else if (host.includes('youtu.be')) {
        const parts = parsed.pathname.split('/')
        videoId = parts.filter(Boolean)[0] || null
      }
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
    } catch {
      return null
    }
  }
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 400)
    return () => clearTimeout(handle)
  }, [query])

  useEffect(() => {
    if (!debouncedQuery) {
      setSpotifyResults([])
      return
    }
    let cancelled = false
    setIsSearching(true)
    searchSpotifyTracks(debouncedQuery)
      .then((results) => {
        if (!cancelled) {
          setSpotifyResults(results)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSearching(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  function formatTime(value: number): string {
    if (!value || !Number.isFinite(value)) return '0:00'
    const total = Math.floor(value)
    const minutes = Math.floor(total / 60)
    const seconds = total % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  async function handleCreate() {
    const trimmedTitle = title.trim()
    const trimmedArtist = artist.trim()
    if (!trimmedTitle || !trimmedArtist) {
      alert('Preencha Título e Artista (selecione uma música ou digite manualmente).')
      return
    }

    const payload = {
      title: trimmedTitle,
      artist: trimmedArtist,
      cipherLink: cipherLink || null,
      bpm: bpm ? Number(bpm) : null,
      key: key || null,
      coverUrl: coverUrl || null,
      previewUrl: previewUrl || null,
      youtubeUrl: youtubeUrl || null
    }
    const result = editingSongId
      ? await updateSong(editingSongId, payload)
      : await createSong(payload)
    if ((result as any)?.error) {
      alert((result as any).error)
      return
    }

    setTitle('')
    setArtist('')
    setCipherLink('')
    setYoutubeUrl('')
    setBpm('')
    setKey('')
    setQuery('')
    setPreviewUrl('')
    setSpotifyResults([])
    setEditingSongId(null)
  }

  async function handleDelete(id: string) {
    await deleteSong(id)
  }

  const youtubeSearchUrl = useMemo(() => {
    if (!title.trim() && !artist.trim()) return ''
    const q = encodeURIComponent(`${title} ${artist}`.trim())
    return `https://www.youtube.com/results?search_query=${q}`
  }, [title, artist])

  const cifraClubUrl = useMemo(() => {
    if (!title.trim() && !artist.trim()) return ''
    const q = encodeURIComponent(`${title} ${artist}`.trim())
    return `https://www.cifraclub.com.br/?q=${q}`
  }, [title, artist])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Buscar no Spotify
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome da música ou artista..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {isSearching && (
            <p className="text-xs text-slate-400 mt-1">Buscando no Spotify...</p>
          )}
        </div>

        {spotifyResults.length > 0 && (
          <div className="border border-slate-200 rounded-lg divide-y max-h-64 overflow-y-auto">
            {spotifyResults.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  isSelectingRef.current = true
                  setTitle(track.title)
                  setArtist(track.artist)
                  setBpm(track.bpm ? String(track.bpm) : '')
                  setKey(track.key || '')
                  setCoverUrl(track.coverUrl || '')
                  setYoutubeUrl(track.youtubeUrl || '')
                  setCipherLink(track.cifraUrl || '')
                  setPreviewUrl(track.previewUrl || '')
                  setSpotifyResults([])
                  setQuery('')
                  setDebouncedQuery('')
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
              >
                {track.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                    ♪
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {track.title}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {track.artist}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {track.bpm ? `${track.bpm} bpm` : 'Sem BPM'}{' '}
                    {track.key ? `• Tom ${track.key}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Artista / Ministério
            </label>
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Link do Vídeo (YouTube)</label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.youtube.com/..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Link da Cifra</label>
            <input
              value={cipherLink}
              onChange={(e) => setCipherLink(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.cifraclub.com.br/..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              BPM (opcional)
            </label>
            <input
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Tom (opcional)
            </label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Ex: C, D, Em..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between pt-2">
          <div className="flex gap-3 text-xs text-slate-500">
            {youtubeSearchUrl && (
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted underline-offset-2"
              >
                Abrir busca no YouTube
              </a>
            )}
            {cifraClubUrl && (
              <a
                href={cifraClubUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted underline-offset-2"
              >
                Buscar cifra no CifraClub
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            {editingSongId ? 'Salvar Alterações' : 'Adicionar Música'}
          </button>
          {editingSongId && (
            <button
              type="button"
              onClick={() => {
                setEditingSongId(null)
                setTitle('')
                setArtist('')
                setCipherLink('')
                setYoutubeUrl('')
                setBpm('')
                setKey('')
                setCoverUrl('')
                setPreviewUrl('')
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                Capa / Preview
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                Título
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                Artista
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                BPM
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                Tom
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                YouTube
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                Letra
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2">
                  <div
                    className="relative w-12 h-12 rounded-md overflow-hidden group cursor-pointer bg-slate-100 flex items-center justify-center"
                    onClick={() => {
                      ;(async () => {
                        try {
                          let targetUrl = song.youtubeUrl
                          if (!targetUrl) {
                            const result = await resolveSongYoutubeUrl(song.id)
                            const resolved = (result as any)?.url as string | null
                            if (!resolved) {
                              alert('Não foi possível localizar o áudio no YouTube.')
                              return
                            }
                            targetUrl = resolved
                          }
                          const normalized = normalizeYouTubeWatchUrl(targetUrl)
                          if (!normalized) {
                            alert('Link do YouTube inválido.')
                            return
                          }
                          setCurrentTrack({ ...song, youtubeUrl: normalized })
                          setPlayedSeconds(0)
                          setDuration(0)
                          setIsPlaying(true)
                        } catch {
                          // Ignora abortos de requisição ou falhas transitórias
                        }
                      })()
                    }}
                  >
                    {song.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">♪</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="text-white w-6 h-6 fill-white" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <p className="font-semibold text-slate-900 text-sm">{song.title}</p>
                </td>
                <td className="px-4 py-2 text-gray-500 text-sm">{song.artist}</td>
                <td className="px-4 py-2 text-slate-600">
                  {song.bpm != null ? `${song.bpm} bpm` : '-'}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {song.key || '-'}
                </td>
                <td className="px-4 py-2">
                  {song.youtubeUrl ? (
                    <a
                      href={song.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      <Youtube className="w-5 h-5 text-red-500 hover:scale-110 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-slate-300 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {song.cipherLink ? (
                    <a
                      href={song.cipherLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      <FileText className="w-5 h-5 text-blue-500 hover:scale-110 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-slate-300 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSongId(song.id)
                        setTitle(song.title)
                        setArtist(song.artist)
                        setCipherLink(song.cipherLink || '')
                        setBpm(song.bpm != null ? String(song.bpm) : '')
                        setKey(song.key || '')
                        setCoverUrl(song.coverUrl || '')
                        setYoutubeUrl(song.youtubeUrl || '')
                        setPreviewUrl(song.previewUrl || '')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(song.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Apagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {songs.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-400 text-sm"
                  colSpan={8}
                >
                  Nenhuma música cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isMounted && currentTrack?.youtubeUrl && (
        <ReactPlayer
          key={currentTrack.youtubeUrl}
          ref={playerRef}
          url={normalizeYouTubeWatchUrl(currentTrack.youtubeUrl)}
          playing={isPlaying}
          width="10px"
          height="10px"
          className="absolute opacity-0 pointer-events-none -z-50"
          onReady={() => setIsPlaying(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onBuffer={() => {
            console.log('Carregando áudio...')
          }}
          onDuration={(d: number) => setDuration(d)}
          onProgress={(p: { playedSeconds: number }) => setPlayedSeconds(p.playedSeconds)}
          onEnded={() => {
            setIsPlaying(false)
            setPlayedSeconds(0)
          }}
          onError={() => {}}
          config={{
            youtube: {
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : '',
                playsinline: 1
              }
            }
          }}
        />
      )}

      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <div className="flex items-center gap-3 min-w-[180px]">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                {currentTrack.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">♪</span>
                )}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false)
                    setCurrentTrack(null)
                    setPlayedSeconds(0)
                    setDuration(0)
                  }}
                  className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-slate-500 w-10 text-right">
                  {formatTime(playedSeconds)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.5}
                  value={Math.min(playedSeconds, duration || 0)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setPlayedSeconds(value)
                    if (playerRef.current) {
                      playerRef.current.seekTo(value, 'seconds')
                    }
                  }}
                  className="w-full accent-indigo-600"
                />
                <span className="text-xs text-slate-500 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
