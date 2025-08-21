import { mailerLite, sdkList } from '@/server/mailer-lite'

import { MLGroup } from './fetch-groups-page.types'

export async function fetchGroupsPage(page: number, limit: number) {
  const resp =
    (await (mailerLite as any).groups.list?.({ page, limit })) ??
    (await (mailerLite as any).groups.get?.({ page, limit }))
  const [rows] = sdkList<MLGroup>(resp)

  return rows
}
