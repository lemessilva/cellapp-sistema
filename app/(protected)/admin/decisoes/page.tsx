import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import DecisionQRCode from '@/components/admin/DecisionQRCode'
import DecisionAdminTable from '@/components/admin/DecisionAdminTable'

function formatPhoneToWa(value: string) {
  const digits = (value || '').replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

function DateCell({ date }: { date: Date }) {
  const d = new Date(date)
  return <span className="text-gray-500 text-sm">{d.toLocaleString('pt-BR')}</span>
}

function WhatsAppButton({ phone, name }: { phone: string; name: string }) {
  const wa = formatPhoneToWa(phone)
  const url = `https://wa.me/${wa}?text=${encodeURIComponent(`Olá ${name}! Vimos sua decisão no culto, podemos falar? 🙌`)}` 
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Button variant="outline">WhatsApp</Button>
    </a>
  )
}

function QRCodePanel() {
  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <DecisionQRCode />
    </div>
  )
}

export default async function AdminDecisionsPage() {
  const [items, leaders] = await Promise.all([
    prisma.decisionCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, nome: true } } }
    }),
    prisma.user.findMany({
      where: {
        ativo: true,
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPERVISOR' },
          { role: 'LIDER' },
          { funcoes: { contains: 'Pastor', mode: 'insensitive' } }
        ]
      },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' }
    })
  ])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Cartões de Decisão</h1>
      </div>

      <QRCodePanel />

      <DecisionAdminTable
        items={items.map(i => ({
          ...i,
          assignedTo: i.assignedTo ? { id: i.assignedTo.id, nome: i.assignedTo.nome } : null
        }))}
        leaders={leaders}
      />
    </div>
  )
}
