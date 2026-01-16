import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSiteConfiguration } from '@/app/actions/website'
import { getBanners } from '@/app/actions/banners'
import { getResources } from '@/app/actions/resources'
import WebsiteEditor from './WebsiteEditor'

export default async function WebsiteAdminPage() {
  const user = await getUser()
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MIDIA')) {
    redirect('/app')
  }

  const [config, banners, resources] = await Promise.all([
    getSiteConfiguration(),
    getBanners(),
    getResources()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestão do Site</h1>
        <p className="text-slate-500">Gerencie o conteúdo da página inicial, horários e informações de contato.</p>
      </div>
      
      <WebsiteEditor initialConfig={config} initialBanners={banners} initialResources={resources} />
    </div>
  )
}
