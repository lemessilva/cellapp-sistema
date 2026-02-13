'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { subscribeUser } from '@/app/actions/notifications'
import { Bell } from 'lucide-react'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    console.log('PushNotificationManager: checking support...')
    if (typeof window !== 'undefined') {
      const isSecureContext = window.isSecureContext
      const hasSW = 'serviceWorker' in navigator
      const hasPush = 'PushManager' in window

      console.log('PushNotificationManager Status:', { isSecureContext, hasSW, hasPush })

      if (hasSW && hasPush && isSecureContext) {
        setIsSupported(true)
        checkSubscription()
      } else {
        if (!isSecureContext) {
          console.warn('PushNotificationManager: Not a secure context (HTTPS required for mobile IP access)')
        }
      }
    }
  }, [])

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)

    // Se não estiver inscrito, mostrar sugestão após 3 segundos
    if (!sub) {
      const hasDismissed = localStorage.getItem('push_prompt_dismissed')
      if (!hasDismissed) {
        setTimeout(() => {
          showPushPrompt()
        }, 3000)
      }
    }
  }

  function showPushPrompt() {
    toast('Ativar notificações?', {
      description: 'Receba avisos de reuniões, orações e eventos diretamente no seu celular.',
      action: {
        label: 'Ativar',
        onClick: () => handleSubscribe()
      },
      cancel: {
        label: 'Agora não',
        onClick: () => localStorage.setItem('push_prompt_dismissed', 'true')
      },
      duration: 10000,
      icon: <Bell className="w-4 h-4" />
    })
  }

  async function handleSubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Solicitar permissão explicitamente se necessário
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permissão de notificação negada.')
        return
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      })

      // Converter sub para o formato que o server action espera
      const subJSON = sub.toJSON()
      const result = await subscribeUser({
        endpoint: subJSON.endpoint,
        keys: {
          p256dh: subJSON.keys?.p256dh,
          auth: subJSON.keys?.auth
        }
      })

      if (result.success) {
        setSubscription(sub)
        toast.success('Notificações ativadas com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao salvar inscrição.')
      }
    } catch (error) {
      console.error('Error subscribing to push:', error)
      toast.error('Falha ao ativar notificações.')
    }
  }

  // Helper para converter a chave VAPID
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return null // Este componente não renderiza nada visualmente além do toast
}
