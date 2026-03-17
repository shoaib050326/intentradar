'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/components/providers'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Notification = {
  id: string
  message: string
  leadId?: string
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastCount, setLastCount] = useState(0)
  
  const { data: leadCount } = trpc.lead.list.useQuery({})

  useEffect(() => {
    if (leadCount && leadCount.length > lastCount && lastCount > 0) {
      const newLeads = leadCount.length - lastCount
      setNotifications(prev => [{
        id: Date.now().toString(),
        message: `${newLeads} new lead${newLeads > 1 ? 's' : ''} detected!`,
      }, ...prev])
    }
    if (leadCount) {
      setLastCount(leadCount.length)
    }
  }, [leadCount, lastCount])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm">{notification.message}</span>
            <button onClick={() => dismissNotification(notification.id)} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
