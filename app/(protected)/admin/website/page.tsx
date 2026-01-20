import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSiteConfiguration } from '@/app/actions/website'
import { getBanners } from '@/app/actions/banners'
import { getResources } from '@/app/actions/resources'
import { getBioLinks } from '@/app/actions/bio-links'
import { getSermonSeries } from '@/app/actions/sermons'
import WebsiteEditor from './WebsiteEditor'

export default async function WebsiteAdminPage() {
  const user = await getUser()
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    redirect('/app')
  }

  const [config, banners, resources, cellsRaw, eventsRaw, churchInfo, bioLinks, sermonSeries] = await Promise.all([
    getSiteConfiguration(),
    getBanners(),
    getResources(),
    prisma.cell.findMany({
      include: { lider: true }
    }),
    prisma.event.findMany({
      where: { isOpen: true, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 3
    }),
    prisma.churchInfo.findUnique({
      where: { id: 'main' }
    }),
    getBioLinks(),
    getSermonSeries()
  ])

  // Map cells to match FindCellSection interface
  const cells = cellsRaw.map(cell => ({
    id: cell.id,
    nome: cell.nome,
    liderNome: cell.lider?.nome || 'Líder',
    diaSemana: cell.diaSemana || cell.dia_reuniao || '',
    horario: cell.horario || '',
    bairro: cell.bairro || '',
    cidade: cell.cidade || '',
    whatsappLider: cell.lider?.whatsapp || cell.lider?.telefone || '',
    displayLocation: `${cell.bairro || ''}${cell.cidade ? ' - ' + cell.cidade : ''}`
  }))

  // Map events to serialize Decimal types
  const events = eventsRaw.map(event => ({
    ...event,
    price: event.price.toNumber(), // Convert Decimal to number
    // Ensure dates are also serialized if needed, but Date objects are usually fine in Next.js props (they are serialized to ISO strings automatically in recent versions, or maybe not?)
    // Actually, Date objects are allowed in Server Actions but NOT in Client Components props in Next.js 13+ unless they are simple JSON-serializable.
    // Wait, Date objects ARE supported in Client Component props?
    // "Warning: Only plain objects can be passed to Client Components from Server Components. Date objects are not supported."
    // Yes, Date objects are NOT supported directly. They need to be strings.
    // But usually Prisma dates work if the component doesn't strict check, or if Next.js serializes them?
    // No, Next.js warns about Date objects too.
    // So I should probably convert dates to strings too to be safe.
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestão do Site</h1>
        <p className="text-slate-500">Gerencie o conteúdo da página inicial, horários e informações de contato.</p>
      </div>
      
      <WebsiteEditor 
        initialConfig={config} 
        initialBanners={banners} 
        initialResources={resources}
        initialCells={cells}
        initialEvents={events}
        initialChurchInfo={churchInfo}
        initialBioLinks={bioLinks}
        initialSermonSeries={sermonSeries}
      />
    </div>
  )
}
