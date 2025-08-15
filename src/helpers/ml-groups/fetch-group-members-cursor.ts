import { MLListResponse } from '@/helpers/ml/types'
import { ml } from '@/server/mailerLite'

import { MLSubscriberSlim } from './fetch-group-members-cursor.types'

export async function fetchGroupMembersCursor(
  mlGroupId: string,
  cursor?: string,
  limit = 100
): Promise<{ rows: MLSubscriberSlim[]; next?: string }> {
  const searchParams: Record<string, string | number> = { limit }
  if (cursor) searchParams.cursor = cursor

  const resp = await ml
    .get(`groups/${mlGroupId}/subscribers`, { searchParams })
    .json<MLListResponse<MLSubscriberSlim>>()

  const rows = Array.isArray(resp) ? resp : (resp.data ?? [])
  const next = Array.isArray(resp) ? undefined : (resp.meta?.next_cursor ?? undefined)

  return { rows, next }
}
