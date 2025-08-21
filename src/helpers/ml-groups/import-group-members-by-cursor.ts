// src/helpers/ml-groups/import-group-members-by-cursor.ts
import { prisma } from '@/server/db'
import { mailerLite, sdkList } from '@/server/mailer-lite'

import { GroupSubscriber, PageResult } from './import-group-members-by-cursor.types'

export async function importGroupMembersByCursor(
  localGroupId: string,
  remoteGroupId: string,
  limit: number
) {
  let cursor: string | undefined = undefined
  let linked = 0

  async function fetchPage(c?: string): Promise<PageResult> {
    if (typeof mailerLite.groups?.getSubscribers !== 'function') {
      throw new Error('MailerLite client does not expose groups.getSubscribers')
    }

    const resp = await mailerLite.groups.getSubscribers(remoteGroupId, { limit, cursor: c })
    const [rows, next] = sdkList<GroupSubscriber>(resp)

    return { rows, next }
  }

  while (true) {
    // SDK: subskrybenci należący do grupy — cursor/limit
    const { rows, next } = await fetchPage(cursor)

    console.log({ imported: rows.length, next })

    if (!next) break

    // Linkowanie membershipów po emailu (dostosuj, jeśli używasz innych kluczy)
    for (const r of rows) {
      const sub = await prisma.subscriber.findUnique({ where: { email: r.email } })
      if (!sub) continue

      await prisma.subscriberGroup.upsert({
        where: {
          subscriberId_groupId: { subscriberId: sub.id, groupId: localGroupId }
        },
        update: {},
        create: { subscriberId: sub.id, groupId: localGroupId }
      })
      linked += 1
    }

    if (!next) break

    cursor = next
  }

  return linked
}
