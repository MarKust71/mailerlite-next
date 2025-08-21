// src/server/actions/subscribers.ts
'use server'

import { z } from 'zod'

import { prisma } from '@/server/db'
import { ml } from '@/server/mailer-lite'

import { MLSubscriberCreate } from './subscribers.types' // ⬅️ DODAJ

import type { Prisma } from '@prisma/client'

const createSubscriberSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  fields: z.record(z.string(), z.string()).optional(),
  groupIds: z.array(z.string()).optional()
})

export async function createSubscriberAction(input: unknown) {
  const parsed = createSubscriberSchema.parse(input)
  const { email, name, groupIds = [] } = parsed
  const fields = parsed.fields ?? {}

  const body = { email, fields }

  // ⬇️ zero 'any'
  const res = await ml.post('subscribers', { json: body }).json<MLSubscriberCreate>()

  // ⬇️ KLUCZOWE: typ parametru transakcji
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const sub = await tx.subscriber.upsert({
      where: { email },
      create: { email, name: name ?? null, mailerLiteId: res.id, status: 'active' },
      update: { name: name ?? null, mailerLiteId: res.id }
    })

    for (const [key, value] of Object.entries(fields)) {
      const cf = await tx.customField.findUnique({ where: { key } })

      if (!cf) continue

      await tx.subscriberFieldValue.upsert({
        where: { subscriberId_customFieldId: { subscriberId: sub.id, customFieldId: cf.id } },
        create: { subscriberId: sub.id, customFieldId: cf.id, value: value },
        update: { value: value }
      })
    }

    if (groupIds.length) {
      await Promise.all(
        groupIds.map(async (gid) =>
          tx.subscriberGroup.upsert({
            where: { subscriberId_groupId: { subscriberId: sub.id, groupId: gid } },
            create: { subscriberId: sub.id, groupId: gid },
            update: {}
          })
        )
      )
    }

    return sub
  })
}
