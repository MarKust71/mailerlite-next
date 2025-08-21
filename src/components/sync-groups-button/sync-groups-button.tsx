// src/components/sync-groups-button/sync-groups-button.tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react' // jeśli nie używasz, usuń ikonę
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

type ImportGroupsResponse =
  | { importedGroups: number; linkedMemberships: number }
  | { error: string; detail?: unknown }

export function SyncGroupsButton({
  includeMembers = true,
  className
}: {
  includeMembers?: boolean
  className?: string
}) {
  const qc = useQueryClient()
  const [running, setRunning] = useState(false)
  const toastId = useRef<string | number>(0)

  const mutation = useMutation({
    mutationFn: async () => {
      const url = `/api/dev/import-groups?includeMembers=${includeMembers ? 'true' : 'false'}`
      const res = await fetch(url, { method: 'POST' })
      const data = (await res.json()) as ImportGroupsResponse
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
      toastId.current = toast.loading('Synchronizuję grupy…')
    },
    onSuccess: (data) => {
      if ('importedGroups' in data) {
        toast.success(
          `Zaimportowano grup: ${data.importedGroups}${
            includeMembers ? ` • Powiązań członków: ${data.linkedMemberships}` : ''
          }`,
          { id: toastId.current }
        )
        qc.invalidateQueries({ queryKey: ['groups'] })
        qc.invalidateQueries({ queryKey: ['subscribers'] })
      } else {
        toast.success('Zakończono synchronizację.', { id: toastId.current })
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Błąd importu grup: ${msg}`, { id: toastId.current })
    },
    onSettled: () => {
      setRunning(false)
    }
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
        <>Sync groups now{includeMembers ? ' (with members)' : ''}</>
      )}
    </Button>
  )
}
