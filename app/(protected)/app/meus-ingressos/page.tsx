import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Calendar, MapPin, Ticket } from 'lucide-react'

export default async function MeusIngressosPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const registrations = await prisma.registration.findMany({
    where: {
      userId: user.id
    },
    include: {
      event: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const now = new Date()

  const proximos = registrations.filter((r) => r.event.date >= now)
  const historico = registrations.filter((r) => r.event.date < now)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatDate = (d: Date) =>
    new Date(d).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const PaymentBadge = ({ status }: { status: string }) => {
    const normalized = status.toUpperCase()
    const label =
      normalized === 'PAID' ? 'Pago' : normalized === 'PARTIAL' ? 'Parcial' : 'Pendente'
    const style =
      normalized === 'PAID'
        ? 'bg-green-100 text-green-800'
        : normalized === 'PARTIAL'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-yellow-100 text-yellow-800'

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {label}
      </span>
    )
  }

  const Section = ({
    title,
    items
  }: {
    title: string
    items: typeof registrations
  }) => (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{items.length} ingresso(s)</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
          Nenhuma inscrição nesta seção.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-indigo-500" />
                    {reg.event.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Valor:{' '}
                    {Number(reg.event.price) === 0
                      ? 'Gratuito'
                      : formatCurrency(Number(reg.event.price))}
                  </p>
                </div>
                <PaymentBadge status={reg.paymentStatus} />
              </div>

              <div className="flex flex-col gap-1 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(reg.event.date)}</span>
                </div>
                {reg.event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{reg.event.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-1 text-[11px] text-slate-400">
                Inscrito em{' '}
                {new Date(reg.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                , timeZone: 'UTC' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Meus Ingressos</h1>
        <p className="text-slate-500 text-sm">
          Acompanhe suas inscrições em eventos, pagamentos e histórico.
        </p>
      </header>

      <div className="space-y-8">
        <Section title="Disponíveis / Próximos" items={proximos} />
        <Section title="Histórico / Usados" items={historico} />
      </div>
    </div>
  )
}
