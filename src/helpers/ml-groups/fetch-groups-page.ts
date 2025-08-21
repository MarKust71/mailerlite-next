// src/helpers/ml-groups/fetch-groups-page.ts
import { mailerLite, sdkList } from '@/server/mailer-lite'

import { MLGroup } from './fetch-groups-page.types'

export async function fetchGroupsPage(page: number, limit: number) {
  if (!mailerLite.groups?.get) {
    throw new Error('MailerLite client does not expose groups.get')
  }

  const resp = await mailerLite.groups.get({ page, limit, sort: 'name' })
  const [rows] = sdkList<MLGroup>(resp)

  return rows
}
