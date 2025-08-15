// src/app/(dashboard)/subscribers/page.tsx
'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { SyncGroupsButton } from '@/components/sync-groups-button'
import { SyncSubscribersButton } from '@/components/sync-subscribers-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSubscribersTable } from '@/stores/subscribers'
import { useUIStore } from '@/stores/ui'

import type { Subscriber, SubscriberGroup, SubscriberFieldValue, CustomField } from '@prisma/client'

/** Typ encji z relacjami, tak jak zwraca API */
type SubscriberWithRelations = Subscriber & {
  groups: SubscriberGroup[]
  fields: (SubscriberFieldValue & { customField: CustomField })[]
}

/** Kształt odpowiedzi /api/subscribers */
type SubscribersResponse = { items: SubscriberWithRelations[]; total: number }

/** Minimalny helper do budowania query string */
function buildQueryString(params: Record<string, string | number | null | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') q.set(k, String(v))
  }

  return q.toString()
}

export default function SubscribersPage() {
  const queryClient = useQueryClient()
  const selector = (s: ReturnType<typeof useSubscribersTable.getState>) => ({
    page: s.page,
    pageSize: s.pageSize,
    sortBy: s.sortBy,
    sortDir: s.sortDir,
    filters: s.filters,
    setQuery: s.setQuery,
    setPage: s.setPage
  })

  // Zustand: parametry tabeli/filtrów
  const { page, pageSize, sortBy, sortDir, filters, setQuery, setPage } = useSubscribersTable(
    useShallow(selector)
  )

  const queryKey = useMemo(
    () =>
      [
        'subscribers',
        {
          q: filters.q,
          groupId: filters.groupId,
          status: filters.status,
          page,
          pageSize,
          sortBy,
          sortDir
        }
      ] as const,
    [filters.q, filters.groupId, filters.status, page, pageSize, sortBy, sortDir]
  )

  const { data, isLoading, isFetching, error } = useQuery<SubscribersResponse>({
    queryKey,
    queryFn: async () => {
      const qs = buildQueryString({
        page,
        pageSize,
        sortBy,
        sortDir,
        q: filters.q,
        groupId: filters.groupId,
        status: filters.status === 'any' ? null : filters.status
      })
      const res = await fetch(`/api/subscribers?${qs}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch subscribers')

      return (await res.json()) as SubscribersResponse
    },
    placeholderData: keepPreviousData,
    staleTime: 5_000
  })

  // (opcjonalnie) mutacja tworzenia — pokazana typowo, bez użycia poniżej
  const createMutation = useMutation({
    mutationFn: async (payload: { email: string; name?: string }) => {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('Create failed')

      return (await res.json()) as SubscriberWithRelations
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
    }
  })

  const { setAddSubscriberOpen } = useUIStore(
    useShallow((s) => ({ setAddSubscriberOpen: s.setAddSubscriberOpen }))
  )

  const totalItems = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (isLoading && !data) return <div className="p-6">Ładowanie…</div>
  if (error) return <div className="p-6 text-red-600">Błąd pobierania</div>

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl border overflow-x-auto max-h-[80vh] overflow-auto">
        <div
          className="grid text-sm divide-y"
          style={{ gridTemplateColumns: 'max-content max-content 1fr 1fr 1fr 1fr' }}
        >
          {/* STICKY: pasek z tytułem + filtrem + przyciskiem oraz nagłówkiem tabeli */}
          <div className="sticky top-0 z-20 grid grid-cols-subgrid col-span-full bg-background/95 supports-[backdrop-filter]:bg-background/75 backdrop-blur border-b">
            {/* Pasek narzędzi */}
            <div className="col-span-full divide-y">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex flex-row gap-2 items-center">
                  <h1 className="text-xl font-semibold">Subskrybenci</h1>
                  {isFetching && <div className="text-sm text-muted-foreground">Odświeżanie…</div>}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    value={filters.q}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    placeholder="Szukaj po e-mailu lub imieniu…"
                    className="w-64"
                  />

                  <Button onClick={() => setAddSubscriberOpen(true)}>Dodaj</Button>
                </div>
              </div>
            </div>

            {/* Nagłówek jako wiersz subgrid */}
            <div className="grid grid-cols-subgrid col-span-full gap-x-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <div className="px-4 py-2 font-medium whitespace-nowrap">Status</div>
              <div className="px-4 py-2 font-medium whitespace-nowrap">E-mail</div>
              <div className="px-4 py-2 font-medium">Imię</div>
              <div className="px-4 py-2 font-medium">Nazwisko</div>
              <div className="px-4 py-2 font-medium">Grupy</div>
              <div className="px-4 py-2 font-medium">Utworzono</div>
            </div>
          </div>

          {/*Lista wierszy z divide-y*/}
          <div className="divide-y col-span-full grid grid-cols-subgrid">
            {data?.items.map((s) => (
              <div key={s.id} className="grid grid-cols-subgrid col-span-full gap-x-4">
                <div className="px-4 py-2 text-muted-foreground whitespace-nowrap">{s.status}</div>
                <div className="px-4 py-2 font-medium">{s.email}</div>
                <div className="px-4 py-2 font-medium">{s.name}</div>
                <div className="px-4 py-2 font-medium">
                  {s.fields.find((f) => f.customField.key === 'last_name')?.value}
                </div>
                <div className="px-4 py-2 text-muted-foreground">{s.groups.length}</div>
                <div className="px-4 py-2 text-muted-foreground tabular-nums">
                  {new Date(s.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Razem: {totalItems} • Strona {page} / {totalPages}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Poprzednia
          </Button>

          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Następna
          </Button>
        </div>
      </div>

      <SyncSubscribersButton />

      <SyncGroupsButton includeMembers className={'ml-2'} />
    </div>
  )
}
