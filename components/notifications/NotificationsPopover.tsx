'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle, X, ClipboardList, Calendar, Home, Award, Guitar, Gift } from 'lucide-react'
import { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/app/actions/notifications'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: Date
}

export default function NotificationsPopover({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const [list, count] = await Promise.all([
        getUserNotifications(userId),
        getUnreadCount(userId)
      ])
      setNotifications(list)
      setUnreadCount(count)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [userId])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [popoverRef])

  const handleMarkAsRead = async (id: string, link: string | null) => {
    try {
      await markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      setIsOpen(false)
      if (link) {
        router.push(link)
      }
    } catch (error) {
      toast.error('Erro ao marcar como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('Todas marcadas como lidas')
    } catch (error) {
      toast.error('Erro ao marcar todas como lidas')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'ALERT': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'REPORT': return <ClipboardList className="w-5 h-5 text-indigo-500" />
      case 'EVENT': return <Calendar className="w-5 h-5 text-purple-500" />
      case 'CELL': return <Home className="w-5 h-5 text-blue-500" />
      case 'ROLE': return <Award className="w-5 h-5 text-amber-500" />
      case 'ROSTER': return <Guitar className="w-5 h-5 text-pink-500" />
      case 'BIRTHDAY': return <Gift className="w-5 h-5 text-rose-500" />
      default: return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-50'
      case 'WARNING': return 'bg-yellow-50'
      case 'ALERT': return 'bg-red-50'
      default: return 'bg-blue-50'
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhuma notificação nova</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id, notification.link)}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getBgColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="self-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
            <button onClick={fetchNotifications} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                Atualizar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
