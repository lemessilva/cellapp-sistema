import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import DecisionQRCode from '@/components/admin/DecisionQRCode'

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
  const items = await prisma.decisionCard.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Cartões de Decisão</h1>
      </div>

      <QRCodePanel />

      <div className="mt-6 border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">WhatsApp</th>
              <th className="text-left p-3">Decisão</th>
              <th className="text-left p-3">Pedido de Oração</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.phone}</td>
                <td className="p-3">{item.decisionType}</td>
                <td className="p-3 max-w-[320px] truncate" title={item.prayerRequest || ''}>
                  {item.prayerRequest || '-'}
                </td>
                <td className="p-3">{item.status}</td>
                <td className="p-3"><DateCell date={item.createdAt} /></td>
                <td className="p-3">
                  <WhatsAppButton phone={item.phone} name={item.name} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Nenhum cartão enviado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
