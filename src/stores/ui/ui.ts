// src/stores/ui.ts
'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { UIState } from './ui.types'

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
