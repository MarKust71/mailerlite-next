// src/stores/ui.ts
'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type UIState = {
  addSubscriberOpen: boolean
  setAddSubscriberOpen: (open: boolean) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      addSubscriberOpen: false,
      setAddSubscriberOpen: (open) => set({ addSubscriberOpen: open }),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open })
    }),
    { name: 'ui-store' }
  )
)
