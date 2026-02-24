import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getMyScales, updateScaleParticipantStatus } from '@/app/actions/worship'

export default async function MyScalesPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const participations = await getMyScales()

  async function handleStatus(formData: FormData) {
    'use server'
    const id = String(formData.get('id') || '')
    const status = String(formData.get('status') || '')
    if (id && status) {
      await updateScaleParticipantStatus(id, status as 'CONFIRMED' | 'REJECTED' | 'PENDING')
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-slate-900 mb-2">Minhas Escalas de Louvor</h1>
      {participations.length === 0 && (
        <p className="text-sm text-slate-500">
          Você ainda não está escalado para próximos cultos.
        </p>
      )}

      <div className="space-y-4">
        {participations.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.scale.title}</p>
                <p className="text-xs text-slate-500">
                  {new Date(p.scale.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {p.role}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700 uppercase">Equipe</p>
              <div className="flex flex-wrap gap-1">
                {p.scale.participants.map((member) => (
                  <span
                    key={member.id}
                    className="px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
                  >
                    {member.user?.nome?.split(' ')[0] || '—'}{' '}
                    <span className="text-slate-400">({member.role})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700 uppercase">Repertório</p>
              <ul className="space-y-1">
                {p.scale.songs
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700">
                        {item.order + 1}. {item.song?.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{item.song?.artist}</span>
                        {item.song?.cipherLink && (
                          <a
                            href={item.song.cipherLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline text-[11px]"
                          >
                            Ver cifra
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">Confirmação da sua presença</p>
              <div className="flex gap-2">
                <form action={handleStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="CONFIRMED" />
                  <button
                    type="submit"
                    className={
                      'px-3 py-1 rounded-full text-xs font-semibold ' +
                      (p.status === 'CONFIRMED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700')
                    }
                  >
                    Confirmar
                  </button>
                </form>
                <form action={handleStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <button
                    type="submit"
                    className={
                      'px-3 py-1 rounded-full text-xs font-semibold ' +
                      (p.status === 'REJECTED'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700')
                    }
                  >
                    Recusar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

