import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getAdminScales, getSongs, getWorshipMembers, createScale } from '@/app/actions/worship'

export default async function WorshipScalesPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const tags = user.ministryTags || []
  const isWorshipLeader = tags.includes('LOUVOR_LIDER') || user.role === 'ADMIN'

  if (!isWorshipLeader) {
    redirect('/app')
  }

  const [scales, songs, members] = await Promise.all([
    getAdminScales(),
    getSongs(),
    getWorshipMembers(),
  ])

  async function handleCreateScale(formData: FormData) {
    'use server'
    const title = String(formData.get('title') || '')
    const date = String(formData.get('date') || '')

    const participantIds = formData.getAll('participantId') as string[]
    const participantRoles = formData.getAll('participantRole') as string[]
    const songIds = formData.getAll('songIds') as string[]

    const participants = participantIds
      .map((id, index) => ({
        userId: id,
        role: String(participantRoles[index] || '').trim(),
      }))
      .filter((p) => p.userId && p.role)

    await createScale({
      title,
      date,
      participants,
      songIds: songIds as string[],
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Escalas de Louvor</h1>
        <p className="text-slate-500 mt-1">
          Monte a equipe e o repertório dos próximos cultos.
        </p>
      </div>

      <form action={handleCreateScale} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Título da Escala</label>
            <input
              name="title"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Culto de Domingo - Noite"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Data</label>
            <input
              type="datetime-local"
              name="date"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Equipe</p>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    name="participantId"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    defaultValue=""
                  >
                    <option value="">Selecionar membro</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.nome}
                      </option>
                    ))}
                  </select>
                  <input
                    name="participantRole"
                    placeholder="Função (Vocal, Guitarra...)"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Deixe linhas em branco se não precisar de todas.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Repertório</p>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-slate-400">{index + 1}.</span>
                  <select
                    name="songIds"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    defaultValue=""
                  >
                    <option value="">Selecionar música</option>
                    {songs.map((song) => (
                      <option key={song.id} value={song.id}>
                        {song.title} — {song.artist}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              A ordem define o fluxo do louvor.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Salvar Escala
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Próximas escalas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {scales.map((scale) => (
            <div key={scale.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{scale.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(scale.date).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Equipe</p>
                <ul className="space-y-1">
                  {scale.participants.map((p) => (
                    <li key={p.id} className="flex justify-between text-xs">
                      <span className="text-slate-700">
                        {p.user?.nome || '—'}{' '}
                        <span className="text-slate-400">({p.role})</span>
                      </span>
                      <span
                        className={
                          p.status === 'CONFIRMED'
                            ? 'px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold'
                            : p.status === 'REJECTED'
                            ? 'px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold'
                            : 'px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold'
                        }
                      >
                        {p.status === 'CONFIRMED'
                          ? 'Confirmado'
                          : p.status === 'REJECTED'
                          ? 'Recusado'
                          : 'Pendente'}
                      </span>
                    </li>
                  ))}
                  {scale.participants.length === 0 && (
                    <li className="text-xs text-slate-400">Nenhum participante definido.</li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Repertório</p>
                <ol className="space-y-1 text-xs">
                  {scale.songs
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span className="text-slate-700">
                          {item.order + 1}. {item.song?.title}
                        </span>
                        <span className="text-slate-400">{item.song?.artist}</span>
                      </li>
                    ))}
                  {scale.songs.length === 0 && (
                    <li className="text-xs text-slate-400">Nenhuma música definida.</li>
                  )}
                </ol>
              </div>
            </div>
          ))}
          {scales.length === 0 && (
            <p className="text-sm text-slate-400">Nenhuma escala criada ainda.</p>
          )}
        </div>
      </div>
    </div>
  )
}

