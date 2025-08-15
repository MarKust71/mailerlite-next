import { ml } from '@/server/mailerLite'

import { MLGroup } from './fetch-groups-page.types'

export async function fetchGroupsPage(page: number, limit: number) {
  // MailerLite: paginacja dla grup = page + limit
  const resp = await ml
    .get('groups', { searchParams: { page, limit } })
    .json<{ data?: MLGroup[] } | MLGroup[]>()

  return Array.isArray(resp) ? resp : (resp.data ?? [])
}
