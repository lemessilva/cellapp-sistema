'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import QRCode from 'react-qr-code'

export default function DecisionQRCode() {
  const [origin, setOrigin] = useState<string>('https://seu-site.com')
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      setOrigin(window.location.origin)
    }
  }, [])

  const targetUrl = `${origin}/decisao`

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Link público</div>
          <div className="font-mono text-sm">{targetUrl}</div>
        </div>
        <Button onClick={() => setShow((s) => !s)}>{show ? 'Ocultar QR Code' : 'Gerar QR Code'}</Button>
      </div>
      {show && (
        <div className="mt-4 flex items-center gap-6">
          <div className="border bg-white p-2">
            <QRCode value={targetUrl} size={220} />
          </div>
          <div className="text-sm text-gray-500">
            Imprima e fixe este QR Code nas cadeiras para facilitar o preenchimento.
          </div>
        </div>
      )}
    </div>
  )
}
