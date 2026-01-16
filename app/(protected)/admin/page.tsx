import { Suspense } from 'react'
import { getDashboardMetrics, getGrowthChartData, getFinancialChartData, getCellHealthData } from '@/app/actions/dashboard'
import DashboardKPIs from '@/components/admin/DashboardKPIs'
import DashboardCharts from '@/components/admin/DashboardCharts'
import CellHealthTable from '@/components/admin/CellHealthTable'
import DashboardSkeleton from '@/components/admin/DashboardSkeleton'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Settings } from 'lucide-react'

import { Bug } from 'lucide-react'

export default async function AdminPage() {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/app')
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2">Visão geral da saúde e crescimento da igreja.</p>
        </div>
        <div className="flex items-center gap-4">
            <Link href="/admin/feedbacks">
                <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700">
                    <Bug className="w-4 h-4 mr-2 text-red-500" />
                    Feedbacks
                </Button>
            </Link>
            <Link href="/admin/celulas">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Gerenciar Células
                </Button>
            </Link>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

async function DashboardContent() {
  // Parallel data fetching for performance
  const [metrics, growthData, financialData, cellHealth] = await Promise.all([
    getDashboardMetrics(),
    getGrowthChartData(),
    getFinancialChartData(),
    getCellHealthData()
  ])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* SEÇÃO A: KPIs */}
      <section>
        <DashboardKPIs data={metrics} />
      </section>

      {/* SEÇÃO B: Gráficos */}
      <section>
        <DashboardCharts growthData={growthData} financialData={financialData} />
      </section>

      {/* SEÇÃO C: Saúde das Células */}
      <section>
        <CellHealthTable data={cellHealth} />
      </section>
    </div>
  )
}
