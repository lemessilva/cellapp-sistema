import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Download } from 'lucide-react'

export default async function LeaderResourcesPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  if (user.role === 'MIDIA') {
    redirect('/admin/website')
  }

  if (!['LIDER', 'SUPERVISOR', 'ADMIN'].includes(user.role)) {
    redirect('/app')
  }

  const resources = await prisma.resource.findMany({
    where: {
      OR: [
        { publicoAlvo: 'LIDERES' },
        { publicoAlvo: 'GERAL' }
      ]
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recursos para Líderes</h1>
        <p className="text-slate-500">
          Faça o download de materiais disponibilizados pela equipe de mídia e liderança.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Nenhum recurso disponível</h2>
          <p className="text-slate-500 text-sm">
            Assim que novos materiais forem publicados, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{resource.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {resource.tipo === 'PDF' ? 'PDF' : resource.tipo === 'IMAGEM' ? 'Imagem' : 'Outro'} •{' '}
                    {resource.publicoAlvo === 'LIDERES' ? 'Líderes' : 'Geral'}
                  </p>
                </div>
              </div>
              <Link
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" />
                Baixar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

