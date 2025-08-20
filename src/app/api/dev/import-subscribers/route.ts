// src/app/api/dev/import-subscribers/route.ts
import { NextResponse } from 'next/server'

import { MLListResponse, MLSubscriber } from '@/helpers/ml/types'
import { prisma } from '@/server/db'
import { ml } from '@/server/mailerLite'

export async function POST() {
  const limit = 100
  let cursor: string | undefined = undefined
  let imported = 0
  let inactivated = 0

  // Zestaw ID-ów ML widzianych w tym przebiegu
  const seenIds = new Set<string>()

  // helper do pobrania strony: z cursor (jeśli jest) i limit
  async function fetchPage(c?: string) {
    const searchParams: Record<string, string | number> = { limit }
    if (c) searchParams.cursor = c
    const resp = await ml.get('subscribers', { searchParams }).json<MLListResponse<MLSubscriber>>()
    const rows = Array.isArray(resp) ? resp : (resp.data ?? [])
    const next = Array.isArray(resp) ? undefined : (resp.meta?.next_cursor ?? undefined)

    return { rows, next }
  }

  try {
    while (true) {
      const { rows, next } = await fetchPage(cursor)

      console.log({ imported: rows.length, next })

      if (!rows.length) break

      // krótkie transakcje — 1 subskrybent = 1 transakcja (unika P2028)
      for (const r of rows) {
        // zapamiętujemy zdalne ID jako "widziane"
        if (r.id) seenIds.add(r.id)

        await prisma.$transaction(
          async (tx) => {
            const name =
              r.name ??
              (r.fields?.name as string | undefined) ??
              (r.fields?.first_name as string | undefined) ??
              null

            const sub = await tx.subscriber.upsert({
              where: { email: r.email },
              create: {
                email: r.email,
                name,
                status: (r.status ?? 'active') as string,
                mailerLiteId: r.id,
                createdAt: r.created_at ? new Date(r.created_at) : undefined
              },
              update: {
                name,
                status: (r.status ?? 'active') as string,
                mailerLiteId: r.id,
                updatedAt: r.updated_at ? new Date(r.updated_at) : undefined
              }
            })

            const fields = r.fields && typeof r.fields === 'object' ? r.fields : {}
            for (const [key, value] of Object.entries(fields)) {
              if (value == null) continue

              const cf = await tx.customField.upsert({
                where: { key },
                update: { label: key, type: typeof value },
                create: { key, label: key, type: typeof value }
              })

              await tx.subscriberFieldValue.upsert({
                where: {
                  subscriberId_customFieldId: {
                    subscriberId: sub.id,
                    customFieldId: cf.id
                  }
                },
                create: {
                  subscriberId: sub.id,
                  customFieldId: cf.id,
                  value: String(value)
                },
                update: { value: String(value) }
              })
            }
          },
          { timeout: 10_000 }
        )
      }

      imported += rows.length
      if (!next) break // brak następnej strony
      cursor = next
    }

    // --- POST-SYNC: oznacz jako inactive tych, których NIE było w remote ---

    // 1) Pobierz lokalnych subów, którzy mają mailerLiteId (czyli pochodzą z ML)
    const localWithMlId = await prisma.subscriber.findMany({
      select: { id: true, mailerLiteId: true },
      where: { mailerLiteId: { not: null } }
    })

    // 2) Wybierz tych, których mailerLiteId nie wystąpił w aktualnym przebiegu
    const toDeactivateIds = localWithMlId
      .filter((s) => s.mailerLiteId && !seenIds.has(s.mailerLiteId))
      .map((s) => s.id)

    // 3) Oznacz w partiach jako inactive (żeby nie tworzyć wielkich IN)
    const chunkSize = 1000
    for (let i = 0; i < toDeactivateIds.length; i += chunkSize) {
      const batch = toDeactivateIds.slice(i, i + chunkSize)
      if (batch.length) {
        const res = await prisma.subscriber.updateMany({
          where: { id: { in: batch } },
          data: { status: 'inactive' }
        })
        inactivated += res.count
      }
    }

    return NextResponse.json({ imported, inactivated })
  } catch (e: any) {
    // lepsza diagnostyka z ciałem odpowiedzi
    if (e.name === 'HTTPError' && e.response) {
      const detail = await e.response
        .clone()
        .json()
        .catch(() => null)
      console.error('MailerLite error', e.response.status, detail ?? (await e.response.text()))

      return NextResponse.json({ error: 'MailerLite error', detail }, { status: e.response.status })
    }
    throw e
  }
}
