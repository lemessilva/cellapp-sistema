'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Default to false to prevent mobile overlay blocking on initial load
  const [isOpen, setIsOpen] = useState(false)

  // Check screen size on mount
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsOpen(true)
    }
  }, [])

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
