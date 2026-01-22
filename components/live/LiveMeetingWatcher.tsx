'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { checkLiveStatus } from '@/app/actions/live-meeting'

export function LiveMeetingWatcher({ cellId }: { cellId?: string }) {
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (!cellId) return

        const check = async () => {
            const { active } = await checkLiveStatus(cellId)
            
            if (active && pathname !== '/live-meeting') {
                router.push('/live-meeting')
            } else if (!active && pathname === '/live-meeting') {
                router.push('/app/celula')
            }
        }

        // Check on mount/path change
        check()

        // Poll every 10s to ensure they don't escape
        const interval = setInterval(check, 10000) 
        return () => clearInterval(interval)

    }, [pathname, cellId, router])

    return null
}
