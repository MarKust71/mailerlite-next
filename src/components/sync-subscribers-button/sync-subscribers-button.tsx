// src/components/sync-subscribers-button/sync-subscribers-button.tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react' // jeśli nie używasz, usuń i podmień w JSX
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

type ImportSubscribersResponse = { imported: number } | { error: string; detail?: unknown }

export function SyncSubscribersButton({ className }: { className?: string }) {
  const qc = useQueryClient()
  const [running, setRunning] = useState(false)
  const toastId = useRef<string | number>(0)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/dev/import-subscribers', { method: 'POST' })
      const data = (await res.json()) as ImportSubscribersResponse
      if (!res.ok) {
        throw new Error(
          'error' in data
            ? `${data.error}${data.detail ? `: ${JSON.stringify(data.detail)}` : ''}`
            : 'Import failed'
        )
      }

      return data
    },
    onMutate: () => {
      setRunning(true)
      toastId.current = toast.loading('Synchronizuję subskrybentów…')
    },
    onSuccess: (data) => {
      if ('imported' in data) {
        toast.success(`Zaimportowano subskrybentów: ${data.imported}`, {
          id: toastId.current
        })
        qc.invalidateQueries({ queryKey: ['subscribers'] })
      } else {
        toast.success('Zakończono synchronizację.', { id: toastId.current })
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Błąd importu subskrybentów: ${msg}`, { id: toastId.current })
    },
    onSettled: () => setRunning(false)
  })

  return (
    <Button
      onClick={() => mutation.mutate()}
      disabled={running}
      variant="outline"
      className={className}
    >
      {running ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Synchronizuję…
        </>
      ) : (
        <>Sync subscribers now</>
      )}
    </Button>
  )
}
