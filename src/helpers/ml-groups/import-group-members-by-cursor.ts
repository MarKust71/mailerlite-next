import { prisma } from '@/server/db'

import { fetchGroupMembersCursor } from './fetch-group-members-cursor'

// --- import powiązań grupy -> subskrybenci (SubscriberGroup) ---
export async function importGroupMembersByCursor(
  localGroupId: string,
  mlGroupId: string,
  limit = 100
) {
  let cursor: string | undefined = undefined
  let linked = 0

  while (true) {
    const { rows, next } = await fetchGroupMembersCursor(mlGroupId, cursor, limit)

    console.log({ group: mlGroupId, members: rows.length, cursor })

    if (!rows.length) break

    for (const m of rows) {
      const sub =
        (await prisma.subscriber.findUnique({ where: { mailerLiteId: m.id } })) ??
        (await prisma.subscriber.findUnique({ where: { email: m.email } }))
      if (!sub) continue

      await prisma.subscriberGroup.upsert({
        where: { subscriberId_groupId: { subscriberId: sub.id, groupId: localGroupId } },
        create: { subscriberId: sub.id, groupId: localGroupId },
        update: {}
      })
      linked += 1
    }

    if (!next) break
    cursor = next
  }

  return linked
}
