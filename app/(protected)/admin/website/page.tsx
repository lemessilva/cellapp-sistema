import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSiteConfiguration } from '@/app/actions/website'
import { getBanners } from '@/app/actions/banners'
import { getResources } from '@/app/actions/resources'
import { getBioLinks } from '@/app/actions/bio-links'
import { getSermonSeries } from '@/app/actions/sermons'
import { getBrandAssets, getGalleryImages, getNotificationHistory } from '@/app/actions/media'
import WebsiteEditor from './WebsiteEditor'

export default async function WebsiteAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getUser()
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    redirect('/app')
  }

  const { tab } = await searchParams
  const activeTab = typeof tab === 'string' ? tab : undefined

  const [
    config, 
    banners, 
    resources, 
    cellsRaw, 
    eventsRaw, 
    churchInfo, 
    bioLinks, 
    sermonSeries,
    brandAssets,
    galleryImages,
    notificationHistory
  ] = await Promise.all([
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
    getSermonSeries(),
    getBrandAssets(),
    getGalleryImages(),
    getNotificationHistory()
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
    price: event.price.toNumber(), 
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestão do Site</h1>
        <p className="text-slate-500">Gerencie o conteúdo da página inicial, horários e informações de contato.</p>
      </div>
      
      <WebsiteEditor 
        initialTab={activeTab}
        initialConfig={config} 
        initialBanners={banners} 
        initialResources={resources}
        initialCells={cells}
        initialEvents={events}
        initialChurchInfo={churchInfo}
        initialBioLinks={bioLinks}
        initialSermonSeries={sermonSeries}
        initialBrandAssets={brandAssets}
        initialGalleryImages={galleryImages}
        initialNotificationHistory={notificationHistory}
      />
    </div>
  )
}
